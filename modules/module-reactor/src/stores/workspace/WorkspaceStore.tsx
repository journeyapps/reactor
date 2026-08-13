import * as _ from 'lodash';
import { v4 } from 'uuid';
import {
  Alignment,
  overConstrainRecomputeBehavior,
  WorkspaceCollectionModel,
  WorkspaceModel as StormWorkspaceModel,
  WorkspaceNodeModel
} from '@projectstorm/react-workspaces-core';
import { action, autorun, IReactionDisposer, observable } from 'mobx';
import { Log } from '@journeyapps-labs/common-logger';

import { inject, ioc } from '../../inversify.config';
import { AbstractLayoutEngine, AddModelsOptions } from './layout-engines/AbstractLayoutEngine';
import { AbstractPersistedStore, AbstractPersistedStoreListener } from '../AbstractPersistedStore';
import queryString from 'query-string';
import { DialogStore } from '../DialogStore';
import { MimeTypes, readFileAsText, selectFile } from '@journeyapps/reactor-lib-utils';
import { ActionValidationState } from '../../actions/validators/ActionValidator';
import { ReactorPanelModel } from './react-workspaces/ReactorPanelModel';
import { ReactorPanelFactory } from './react-workspaces/ReactorPanelFactory';
import { ReactorTabFactoryModel } from './react-workspaces/ReactorTabFactory';
import { ReactorWorkspaceEngine } from './ReactorWorkspaceEngine';
import { ReactorRootWorkspaceModel } from './react-workspaces/ReactorRootWorkspaceModel';
import { Btn } from '../../definitions/common';
import { AdvancedWorkspacePreference } from '../../preferences/AdvancedWorkspacePreference';
import { AdvancedLayoutEngine } from './layout-engines/AdvancedLayoutEngine';
import { SimpleLayoutEngine } from './layout-engines/SimpleLayoutEngine';
import { ReactorTrayModel } from './react-workspaces/ReactorTrayFactory';
import { WorkspaceTrayMode } from '@projectstorm/react-workspaces-model-tray';
import { LocalStorageSerializer } from '../serializers/LocalStorageSerializer';
import { WorkspaceModel } from './models/WorkspaceModel';
import { WorkspaceGroup } from './models/WorkspaceGroup';
import {
  ExportedWorkspace,
  isSerializedWorkspaceGroup,
  SerializedWorkspaceEntry,
  WorkspacePrefsSerialized
} from './models/serialization';
import { getReactorViewportMode, ReactorViewportMode } from '../../hooks/useReactorViewportMode';

export type IDEWorkspace = WorkspaceModel;
export type WorkspaceEntry = WorkspaceModel | WorkspaceGroup;
export type GeneratedIDEWorkspace = WorkspaceModel;
export type GeneratedWorkspaceEntry = WorkspaceEntry;

export interface WorkspaceStoreListener extends AbstractPersistedStoreListener {
  workspaceActivated: (workspace: IDEWorkspace) => any;
  workspaceGenerated: (model: GeneratedWorkspaceEntry) => any;
  reset?: () => any;
}

interface GetPanelFactoryOptions {
  showManuallyAllowedPanels?: boolean;
  validateFactories?: boolean;
}

type WorkspaceGeneratorCallback = () => Promise<GeneratedWorkspaceEntry | null | undefined>;

export type WorkspaceGenerator =
  | {
      generateWorkspace: WorkspaceGeneratorCallback;
    }
  | {
      generateAdvancedWorkspace?: WorkspaceGeneratorCallback;
      generateSimpleWorkspace?: WorkspaceGeneratorCallback;
    };

export class WorkspaceStore extends AbstractPersistedStore<WorkspacePrefsSerialized, WorkspaceStoreListener> {
  @observable
  accessor workspaces: WorkspaceEntry[];

  @observable
  accessor currentModel: string;

  @observable
  accessor currentTopWorkspace: string;

  @observable
  accessor fullscreenModel: WorkspaceNodeModel;

  @inject(DialogStore)
  accessor dialogStore: DialogStore;

  // core engines
  layoutEngine: AbstractLayoutEngine;
  engine: ReactorWorkspaceEngine;

  @observable
  accessor activatedModel: ReactorPanelModel;

  workspaceGenerators: Set<WorkspaceGenerator>;

  advancedLayoutEngine: AdvancedLayoutEngine;
  simpleLayoutEngine: SimpleLayoutEngine;

  constructor() {
    super({
      name: 'WORKSPACE',
      serializer: new LocalStorageSerializer<WorkspacePrefsSerialized>({
        key: 'WORKSPACE_PREFS'
      })
    });
    this.workspaces = [];
    this.engine = new ReactorWorkspaceEngine();
    this.engine.registerListener({
      layoutInvalidated: () => {
        this.saveWorkspaceDebounced();
      },
      dimensionsInvalidated: () => {
        this.saveWorkspaceDebounced();
      }
    });
    this.currentModel = null;
    this.currentTopWorkspace = null;
    this.activatedModel = null;
    this.fullscreenModel = null;
    this.workspaceGenerators = new Set();
    this.simpleLayoutEngine = new SimpleLayoutEngine();
    this.advancedLayoutEngine = new AdvancedLayoutEngine();

    let autorunListener: IReactionDisposer;
    this.engine.registerListener({
      modelUpdated: () => {
        autorunListener?.();
        let listener: () => any;
        autorunListener = autorun(() => {
          listener?.();
          if (this.currentModel && this.engine) {
            listener = overConstrainRecomputeBehavior({
              engine: this.engine
            });
          }
        });
      }
    });
  }

  switchLayoutEngine(advanced: boolean) {
    if (advanced) {
      this.setWorkspaceLayoutEngine(this.advancedLayoutEngine);
    } else {
      this.setWorkspaceLayoutEngine(this.simpleLayoutEngine);
    }
  }

  saveWorkspaceDebounced = _.debounce(
    () => {
      this.logger.debug(Log.dim('Workspace updated'));
      this.save();
    },
    1000,
    { leading: false, trailing: true }
  );

  generateFullscreenButton(model: StormWorkspaceModel): Btn {
    const isFullscreen = this.fullscreenModel;
    return {
      icon: isFullscreen ? 'compress' : 'expand',
      tooltip: isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen',
      action: () => {
        ioc.get(WorkspaceStore).setFullscreenModel(isFullscreen ? null : model);
      }
    };
  }

  setFullscreenModel(model: StormWorkspaceModel | null) {
    if (model !== null) {
      const root = this.generateRootModel();
      const cloned = this.engine.getFactory(model.type).generateModel();
      cloned.fromArray(model.toArray(), this.engine);
      root.addModel(cloned);
      this.fullscreenModel = root;
    } else {
      this.fullscreenModel = null;
    }
    this.engine.fireRepaintListeners();
  }

  getAllWorkspaces(): IDEWorkspace[] {
    return this.workspaces.flatMap((workspace) => workspace.getAllWorkspaces());
  }

  getTopLevelWorkspaces(): WorkspaceEntry[] {
    return this.workspaces;
  }

  getActiveTopWorkspace(): WorkspaceEntry {
    return this.getTopLevelWorkspace(this.currentTopWorkspace) || this.getWorkspace(this.currentModel);
  }

  getActiveWorkspace(): IDEWorkspace {
    return this.getWorkspace(this.currentModel);
  }

  getTopLevelWorkspace(key: string): WorkspaceEntry {
    if (!key) {
      return null;
    }
    return this.workspaces.find((workspace) => workspace.key === key || workspace.name === key);
  }

  getWorkspaceEntry(key: string): WorkspaceEntry {
    if (!key) {
      return null;
    }
    return this.workspaces.find((workspace) => {
      return (
        workspace.key === key || workspace.name === key || workspace.getChildren().some((child) => child.key === key)
      );
    });
  }

  protected activateWorkspace(key: string) {
    const topWorkspace = this.getWorkspaceEntry(key);
    if (!topWorkspace) {
      throw new Error(`Failed to activate workspace ${key}`);
    }

    const activation = topWorkspace.activate(key);
    this.currentTopWorkspace = activation.topWorkspace.key;
    this.currentModel = activation.workspace.key;
    this.engine.setLocked(!activation.workspace.mutable);
    this.iterateListeners((l) => {
      if (l.workspaceActivated) {
        l.workspaceActivated(activation.workspace);
      }
    });
  }

  async setActiveWorkspace(key: string) {
    if (this.fullscreenModel) {
      this.setFullscreenModel(null);
    }
    this.activateWorkspace(key);
    this.saveWorkspaceDebounced();
  }

  setWorkspaceLayoutEngine(engine: AbstractLayoutEngine) {
    engine.setWorkspaceStore(this);
    this.layoutEngine = engine;
  }

  getIDEWorkspace(id: string): IDEWorkspace {
    for (let workspace of this.getAllWorkspaces()) {
      if (workspace.model.id === id) {
        return workspace;
      }
    }
    return null;
  }

  registerWorkspaces(model: WorkspaceModel) {
    this.workspaces.push(model);
    if (!this.currentModel) {
      this.setActiveWorkspace(model.key);
    }
  }

  registerWorkspaceGroup(group: WorkspaceGroup) {
    this.workspaces.push(group);
    if (!this.currentModel) {
      this.setActiveWorkspace(group.id);
    }
  }

  registerFactory(factory: ReactorPanelFactory) {
    this.engine.addReactorPanelFactory(factory);
  }

  walk(root: StormWorkspaceModel, cb: (model: StormWorkspaceModel) => any) {
    cb(root);
    if (root instanceof WorkspaceCollectionModel) {
      for (let model of root.children) {
        this.walk(model, cb);
      }
    }
  }

  flatten(root: WorkspaceNodeModel): StormWorkspaceModel[] {
    let models = [];
    this.walk(root, (model) => {
      models.push(model);
    });
    return models;
  }

  getTabGroups() {
    return _.filter(this.flatten(this.getRoot()), (model) => {
      return model instanceof ReactorTabFactoryModel;
    }) as ReactorTabFactoryModel[];
  }

  getPanelFactories(opts: GetPanelFactoryOptions = {}): ReactorPanelFactory[] {
    opts = {
      ...opts,
      showManuallyAllowedPanels: opts.showManuallyAllowedPanels == null ? true : opts.showManuallyAllowedPanels
    };

    return _.filter(this.engine.factories, (factory) => {
      // only reactor factories
      if (!(factory instanceof ReactorPanelFactory)) {
        return false;
      }

      if (opts.validateFactories && factory.options.validators) {
        if (
          factory.options.validators.some((validation) => validation.validate().type == ActionValidationState.HIDDEN)
        ) {
          return false;
        }
      }

      // some panels are not allowed to be manually created
      if (!opts.showManuallyAllowedPanels) {
        return factory.options.allowManualCreation;
      }
      return true;
    }) as ReactorPanelFactory[];
  }

  findModel(root: WorkspaceNodeModel, id: string): StormWorkspaceModel {
    return _.find(this.flatten(root), { id: id });
  }

  getRoot(): ReactorRootWorkspaceModel {
    const model = this.getWorkspace(this.currentModel);
    if (!model) {
      return null;
    }
    return model.model;
  }

  hasOne(factory: ReactorPanelFactory): boolean {
    return _.some(this.flatten(this.getRoot()), (model) => {
      return model.type === factory.type;
    });
  }

  addModels<T extends StormWorkspaceModel[]>(input: T, options: AddModelsOptions = {}): T {
    return this.layoutEngine.addModels(input, options);
  }

  addModel<T extends StormWorkspaceModel>(input: T): T {
    return this.layoutEngine.addModels([input])[0];
  }

  activateModel(model: StormWorkspaceModel) {
    if (model.parent instanceof ReactorTabFactoryModel) {
      model.parent.setSelected(model);
    } else if (model.parent && 'setSelectedModel' in model.parent) {
      (model.parent as any).setSelectedModel(model);
    }
  }

  addModelInWindow(input: StormWorkspaceModel, options: { position?: Alignment; width: number; height: number }) {
    if (getReactorViewportMode() === ReactorViewportMode.MOBILE) {
      const root = this.generateRootModel();
      root.addModel(input);
      this.fullscreenModel = root;
      this.engine.fireRepaintListeners();
      return;
    }

    const m = this.engine.generateStandaloneWindowModel();

    const PADDING = 20;
    const W = options.width;
    const H = options.height;
    const dims = this.getRoot().r_dimensions;

    if (options.position === Alignment.BOTTOM) {
      m.position.update({
        top: dims.dimensions.height - H - PADDING,
        left: dims.dimensions.width / 2 - W / 2
      });
    } else {
      m.position.update({
        top: dims.dimensions.height / 2 - H / 2,
        left: dims.dimensions.width / 2 - W / 2
      });
    }

    m.setSize({
      width: W,
      height: H
    });

    m.setChild(input);
    this.getRoot().addFloatingWindow(m);
  }

  registerWorkspaceGenerator(generator: WorkspaceGenerator) {
    this.workspaceGenerators.add(generator);
  }

  generateWorkspace(generator: WorkspaceGenerator): Promise<GeneratedWorkspaceEntry | null | undefined> {
    if ('generateWorkspace' in generator) {
      return generator.generateWorkspace();
    }
    if (AdvancedWorkspacePreference.enabled() && generator.generateAdvancedWorkspace) {
      return generator.generateAdvancedWorkspace();
    }
    if (!AdvancedWorkspacePreference.enabled() && generator.generateSimpleWorkspace) {
      return generator.generateSimpleWorkspace();
    }
    return Promise.resolve(undefined);
  }

  @action
  async reset() {
    const currentModel = this.currentModel;
    this.workspaces = [];
    this.currentModel = null;
    this.currentTopWorkspace = null;

    const generated = await Promise.all(
      Array.from(this.workspaceGenerators.values()).map(async (generator) => {
        const model = await this.generateWorkspace(generator);
        if (model) {
          this.iterateListeners((cb) => cb.workspaceGenerated?.(model));
        }
        return model;
      })
    );

    // highest priority first
    const sorted = generated
      .filter((f) => !!f)
      .sort((a, b) => {
        return (b.priority || 0) - (a.priority || 0);
      });

    for (let w of sorted) {
      this.registerWorkspaceEntry(w);
    }

    // Safety net: generators can be disabled/misconfigured and return no workspaces.
    // Keep Reactor usable by bootstrapping a minimal empty workspace.
    if (this.workspaces.length === 0) {
      const model = this.generateRootModel();
      const emptyPanel = this.engine.getFactory('empty')?.generateModel();
      if (emptyPanel) {
        model.addModel(emptyPanel);
      }
      this.registerWorkspaces(
        new WorkspaceModel({
          id: v4(),
          name: 'Default',
          model
        })
      );
    }

    this.iterateListeners((listener) => {
      listener.reset?.();
    });

    const existing = this.getWorkspace(currentModel);

    // reset back to current model if it exists, else reset
    await this.setActiveWorkspace(!!existing ? currentModel : this.workspaces[0].key);
    setTimeout(() => {
      this.engine.fireRepaintListeners();
    }, 500);
  }

  registerWorkspaceEntry(workspace: GeneratedWorkspaceEntry) {
    if (workspace instanceof WorkspaceGroup) {
      this.registerWorkspaceGroup(workspace);
      return;
    }
    this.registerWorkspaces(workspace);
  }

  getActivePanelHash() {
    if (this.activatedModel) {
      const res = _.omit(this.activatedModel.toArray(), ['id', 'expandHorizontal', 'expandVertical']);
      return queryString.stringify(res);
    }
    return '';
  }

  async activatePanel(model: ReactorPanelModel) {
    this.activatedModel = model;
  }

  hydratePanelFromURL() {
    if (window.location.hash) {
      const query = queryString.parse(window.location.hash);
      if (query?.type) {
        const model = this.engine.getFactory(query.type as string).generateModel();
        model.fromArray(
          {
            ...(query as any),
            expandHorizontal: model.expandHorizontal,
            expandVertical: model.expandVertical
          },
          this.engine
        );
        this.addModel(model);
      }
    }
  }

  protected async _initPersisted(deserialized: boolean) {
    if (!deserialized) {
      this.currentModel = null;
      this.currentTopWorkspace = null;
      await this.reset();
    }

    this.engine.invalidateLayoutDebounced();
  }

  protected serialize(): WorkspacePrefsSerialized {
    return {
      type: 'workspaces',
      models: _.map(this.workspaces, (model) => model.serialize()),
      version: 3,
      current: this.currentModel,
      currentTop: this.currentTopWorkspace
    };
  }

  protected async deserialize(data: WorkspacePrefsSerialized) {
    try {
      this.workspaces = this.convertSerializedToModels(data);
      this.currentTopWorkspace = data.currentTop;
      await this.setActiveWorkspace(data.current);
    } catch (ex) {
      this.logger.warn('Could not restore workspace state; resetting to defaults', ex);
      this.reset();
    }
  }

  protected convertSerializedToModels(data: WorkspacePrefsSerialized): WorkspaceEntry[] {
    // legacy
    if (!data.version) {
      data.version = 1;
    }

    // patch version 1
    if (data.version === 1) {
      data = this.patch_v1(data);
    }

    try {
      return _.map(data.models, (pref) => {
        return isSerializedWorkspaceGroup(pref)
          ? WorkspaceGroup.deserialize(pref, this.engine, () => this.generateRootModel())
          : WorkspaceModel.deserialize(pref, this.engine, () => this.generateRootModel());
      });
    } catch (ex) {
      this.logger.error('Could not reload workspace', ex);
    }
    return [];
  }

  protected patch_v1(data: WorkspacePrefsSerialized) {
    this.logger.info('Migrating legacy workspace layout');
    const patchCollection = (model) => {
      if (model.type === 'srw-node') {
        // old trays -> new trays
        if (!model.expandHorizontal && model.expandVertical) {
          model.type = ReactorTrayModel.NAME;
          model.mode = model.mode === 'micro' ? WorkspaceTrayMode.COLLAPSED : WorkspaceTrayMode.NORMAL;
        }
        model.children = model.children.map((c) => {
          return patchCollection(c);
        });
      }
      return model;
    };

    data.models = data.models.map((model) => {
      if (isSerializedWorkspaceGroup(model)) {
        return model;
      }
      return {
        ...model,
        ...patchCollection(model.model)
      };
    });

    return data;
  }

  @action deleteWorkspace(key: string) {
    if (this.getAllWorkspaces().length === 1) {
      return;
    }
    const index = this.workspaces.findIndex((workspace) => workspace.key === key || workspace.name === key);
    if (index !== -1) {
      const workspace = this.workspaces[index];
      if (workspace.immutable) return;
      if (workspace instanceof WorkspaceGroup && this.getAllWorkspaces().length === workspace.children.length) {
        return;
      }
      this.workspaces.splice(index, 1);
      this.setActiveWorkspace(_.last(this.workspaces).key);
      return;
    }

    const parent = this.getWorkspaceEntry(key);
    if (parent) {
      const group = parent as WorkspaceGroup;
      if (group.immutable) return;
      const childIndex = group.children.findIndex((child) => child.contains(key));
      if (group.children[childIndex]?.immutable) return;
      group.children.splice(childIndex, 1);
      if (group.children.length === 0) {
        this.deleteWorkspace(group.key);
        return;
      }
      group.lastActiveChildId = group.children[Math.max(0, childIndex - 1)].key;
      this.setActiveWorkspace(group.lastActiveChildId);
    }
  }

  async importWorkspace(): Promise<boolean> {
    const file = await selectFile({
      mimeTypes: [MimeTypes.A_JSON, MimeTypes.T_JSON]
    });
    if (!file) {
      return;
    }
    const textFromFileLoaded = await readFileAsText(file);
    // try to decode workspaces
    try {
      const decoded: ExportedWorkspace = JSON.parse(textFromFileLoaded);
      if (!Array.isArray(decoded.models)) {
        await this.dialogStore.showErrorDialog({
          title: 'Failed to import workspaces',
          message: 'The target file is missing data, try export the workspaces again'
        });
        return false;
      }

      const finalModels = this.convertSerializedToModels(decoded);
      if (decoded.replace) {
        if (
          this.workspaces.some(
            (workspace) => workspace.immutable || workspace.getAllWorkspaces().some((child) => child.immutable)
          )
        ) {
          return false;
        }
        this.workspaces = finalModels;
        const current = decoded.current || _.first(finalModels).key;
        await this.setActiveWorkspace(current);
      } else {
        this.workspaces = this.workspaces.concat(
          finalModels.map((model) => {
            if (model instanceof WorkspaceGroup) {
              return model.cloneForImport({
                id: v4(),
                name: this.getSafeWorkspaceName(model.name),
                engine: this.engine,
                generateRootModel: () => this.generateRootModel(),
                getSafeChildName: (name, siblings) => this.getSafeWorkspaceNameFromSiblings(name, siblings)
              });
            }
            return model.cloneForImport({
              id: v4(),
              name: this.getSafeWorkspaceName(model.name),
              engine: this.engine,
              generateRootModel: () => this.generateRootModel()
            });
          })
        );
      }
      await this.save();
      return true;
    } catch (ex) {
      this.logger.error('Failed to import workspace', ex);
      await this.dialogStore.showErrorDialog({
        title: 'Failed to import workspaces',
        message:
          'The target file is not valid JSON, it was probably tampered with or has changed encoding through transmission.'
      });
    }
  }

  getExportedWorkspaceURL(key: string) {
    const workspace = this.getTopLevelWorkspace(key) || this.getWorkspace(key);
    const models: SerializedWorkspaceEntry[] = [workspace.serialize()];
    return URL.createObjectURL(
      new Blob([
        JSON.stringify({
          type: 'workspaces',
          replace: false,
          version: 3,
          current: workspace instanceof WorkspaceGroup ? workspace.lastActiveChildId : workspace.key,
          currentTop: workspace.key,
          models
        } as ExportedWorkspace)
      ])
    ).toString();
  }

  getExportedWorkspacesURL() {
    return URL.createObjectURL(
      new Blob([
        JSON.stringify({
          type: 'workspaces',
          replace: true,
          version: 3,
          current: this.currentModel,
          currentTop: this.currentTopWorkspace,
          models: this.serialize().models
        } as ExportedWorkspace)
      ])
    ).toString();
  }

  generateRootModel() {
    return new ReactorRootWorkspaceModel({
      engine: this.engine
    });
  }

  getWorkspace(key: string): IDEWorkspace {
    return this.getAllWorkspaces().find((workspace) => {
      return workspace.key === key;
    });
  }

  protected getSafeWorkspaceNameFromSiblings(
    name: string,
    siblings: { key: string; name: string }[],
    excludeKey?: string
  ): string {
    let index = 1;
    let newName = `${name}`;
    do {
      const workspace = siblings.find((sibling) => sibling.key !== excludeKey && sibling.name === newName);
      if (!workspace) {
        return newName;
      }
      index++;
      newName = `${name} ${index}`;
    } while (true);
  }

  getSafeWorkspaceName(name: string, excludeKey?: string): string {
    return this.getSafeWorkspaceNameFromSiblings(name, this.workspaces, excludeKey);
  }

  getSafeWorkspaceNameInGroup(group: WorkspaceGroup, name: string, excludeKey?: string): string {
    return this.getSafeWorkspaceNameFromSiblings(name, group.children, excludeKey);
  }

  @action cloneWorkspace(name: string, key: string) {
    const entry = this.getTopLevelWorkspace(key);
    if (entry?.immutable || this.getWorkspace(key)?.immutable) return;
    if (entry instanceof WorkspaceGroup) {
      name = this.getSafeWorkspaceName(name);
      const group = entry.clone({
        id: v4(),
        name,
        engine: this.engine,
        generateRootModel: () => this.generateRootModel()
      });
      this.workspaces.push(group);
      this.setActiveWorkspace(group.id);
      return;
    }
    const sourceWorkspace = this.getWorkspace(key);
    const parent = sourceWorkspace?.parentId ? this.getTopLevelWorkspace(sourceWorkspace.parentId) : null;
    if (parent instanceof WorkspaceGroup) {
      name = this.getSafeWorkspaceNameInGroup(parent, name);
      const workspace = sourceWorkspace.clone({
        id: v4(),
        name,
        engine: this.engine,
        generateRootModel: () => this.generateRootModel()
      });
      parent.addWorkspace(workspace);
      this.setActiveWorkspace(workspace.key);
      return;
    }

    name = this.getSafeWorkspaceName(name);
    const workspace = sourceWorkspace.clone({
      id: v4(),
      name,
      engine: this.engine,
      generateRootModel: () => this.generateRootModel()
    });
    this.workspaces.push(workspace);
    this.setActiveWorkspace(workspace.key);
  }

  @action renameWorkspace(name: string, key: string) {
    const workspace = this.getTopLevelWorkspace(key) || this.getWorkspace(key);
    if (!workspace || workspace.immutable) return;
    const parent = workspace.parentId ? this.getTopLevelWorkspace(workspace.parentId) : null;
    name =
      parent instanceof WorkspaceGroup
        ? this.getSafeWorkspaceNameInGroup(parent, name, workspace.key)
        : this.getSafeWorkspaceName(name, workspace.key);
    workspace.name = name;
    if (!workspace.id) {
      workspace.id = name;
    }
    this.workspaces = [...this.workspaces];
    this.engine.fireRepaintListeners();
    this.save();
  }

  @action
  async newWorkspaceInGroup(groupKey: string, name: string) {
    const group = this.getTopLevelWorkspace(groupKey);
    if (!(group instanceof WorkspaceGroup) || group.immutable) {
      return;
    }

    name = this.getSafeWorkspaceNameInGroup(group, name);
    const model = this.generateRootModel();
    model.addModel(new StormWorkspaceModel('empty'));
    const workspace = new WorkspaceModel({
      id: v4(),
      name,
      model
    });
    group.addWorkspace(workspace);
    await this.setActiveWorkspace(workspace.key);
  }

  @action
  async convertWorkspaceToGroup(key: string) {
    const index = this.workspaces.findIndex((workspace) => workspace.key === key || workspace.name === key);
    const workspace = this.workspaces[index];
    if (!workspace || workspace instanceof WorkspaceGroup || workspace.immutable) {
      return;
    }

    const group = WorkspaceGroup.fromWorkspace(workspace, {
      childId: v4(),
      childName: 'Default'
    });
    this.workspaces.splice(index, 1, group);
    await this.setActiveWorkspace(workspace.key);
  }

  @action
  async collapseWorkspaceGroup(key: string) {
    const index = this.workspaces.findIndex((workspace) => workspace.key === key || workspace.name === key);
    const group = this.workspaces[index];
    if (
      !(group instanceof WorkspaceGroup) ||
      group.immutable ||
      group.children.length !== 1 ||
      group.children[0].immutable
    ) {
      return;
    }

    const workspace = group.collapseToWorkspace();
    if (!workspace) {
      return;
    }
    this.workspaces.splice(index, 1, workspace);
    await this.setActiveWorkspace(workspace.key);
  }

  @action
  async newWorkspace(name: string) {
    name = this.getSafeWorkspaceName(name);
    const model = this.generateRootModel();
    model.addModel(new StormWorkspaceModel('empty'));
    this.workspaces.push(
      new WorkspaceModel({
        id: v4(),
        name: name,
        model: model
      })
    );
    await this.setActiveWorkspace(_.last(this.workspaces).key);
  }
}
