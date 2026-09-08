import { WorkspaceStore } from '../workspace/WorkspaceStore';
import * as _ from 'lodash';
import { ComponentSelection } from './selections/ComponentSelection';
import { GuideWorkflow } from './GuideWorkflow';
import { makeObservable, observable, reaction } from 'mobx';
import { AbstractStore, AbstractStoreListener } from '../AbstractStore';
import * as React from 'react';
import { AnchoredOverlayPlacement, AnchoredOverlayRecord, AnchoredOverlayStore } from '../overlay/AnchoredOverlayStore';
import { GuideTooltipContentWidget } from '../../layers/guide/GuideTooltipWidget';
import { Log } from '@journeyapps/common-logger';

export interface SelectIdentifier {
  panelFactoryType?: string;
  label?: string;
  type: string;
}

export interface VisibleComponentIdentifier<
  S extends any = any,
  T extends ComponentSelection<S> = ComponentSelection<S>
> {
  selection: S;
  id: string;
  type: string;
  generate: (selection: T) => any;
}

export interface GuideStoreParams {
  workspaceStore: WorkspaceStore;
  anchoredOverlayStore: AnchoredOverlayStore;
}

export interface GuideStoreListener extends AbstractStoreListener {
  guideActivated: (event: { guide: GuideWorkflow }) => any;
}

export class GuideStore extends AbstractStore<GuideStoreListener> {
  visibleComponents: { [id: string]: VisibleComponentIdentifier };

  workspaceStore: WorkspaceStore;
  anchoredOverlayStore: AnchoredOverlayStore;
  guideWorkflows: GuideWorkflow[];

  @observable
  private accessor currentGuide: GuideWorkflow;

  @observable
  accessor selections: { [id: string]: ComponentSelection };

  selectionDirectives: {
    [id: string]: {
      directive: SelectIdentifier;
      resolve: (t: ComponentSelection) => any;
    };
  };

  workspaceListener: () => any;

  constructor(params: GuideStoreParams) {
    super({
      name: 'GUIDE_STORE'
    });
    this.visibleComponents = {};
    this.selectionDirectives = {};
    this.workspaceStore = params.workspaceStore;
    this.anchoredOverlayStore = params.anchoredOverlayStore;
    this.guideWorkflows = [];
    this.currentGuide = null;
    this.workspaceListener = null;
    this.selections = {};
    reaction(
      () =>
        Object.values(this.selections)
          .filter((selection) => !!selection.rect && !!selection.tooltip)
          .map(
            (selection) =>
              new AnchoredOverlayRecord({
                id: `guide-${selection.id}`,
                source: 'guide',
                bounds: selection.rect,
                placement: AnchoredOverlayPlacement.AUTO,
                clickThrough: true,
                render: ({ above }) =>
                  React.createElement(GuideTooltipContentWidget, {
                    selection,
                    arrowAbove: !above
                  })
              })
          ),
      (overlays) => {
        this.anchoredOverlayStore.replaceSource('guide', overlays);
      },
      {
        fireImmediately: true
      }
    );
  }

  getCurrentGuide<T extends GuideWorkflow>(): T {
    return this.currentGuide as T;
  }

  unregisterVisibleComponent(id: string) {
    if (!this.visibleComponents[id]) {
      return false;
    }
    this.selections[id]?.dispose();
    delete this.visibleComponents[id];
  }

  registerVisibleComponent(component: VisibleComponentIdentifier) {
    if (this.visibleComponents[component.id]) {
      return;
    }
    this.visibleComponents[component.id] = component;

    let resolvedSelections = 0;
    for (let id in this.selections) {
      const selection = this.selections[id];
      if (selection.matches(component)) {
        resolvedSelections += 1;
        component.generate(selection);
      }
    }
    if (resolvedSelections > 0) {
      this.logger.debug(
        Log.green('Resolved pending selection'),
        Log.bold(Log.purple(component.type)),
        component.selection
      );
    }
  }

  clearSelectionDirective(directive: SelectIdentifier) {
    for (let i in this.selectionDirectives) {
      if (_.isEqual(this.selectionDirectives[i].directive, directive)) {
        delete this.selectionDirectives[i];
      }
    }
  }

  registerGuideWorkflow(guide: GuideWorkflow) {
    guide.setGuideStore(this);
    this.logger.debug(
      Log.dim('Registered workflow'),
      Log.bold(Log.cyan(guide.options.label)),
      Log.gray(guide.options.id),
      Log.dim(`${guide.steps.length} steps`)
    );
    this.workspaceListener = guide.registerListener({
      activated: () => {
        this.currentGuide = guide;
        this.logger.info(Log.green('Activated workflow'), Log.bold(Log.cyan(guide.options.label)));
        this.iterateListeners((cb) =>
          cb.guideActivated?.({
            guide: guide
          })
        );
      },
      deActivated: () => {
        this.currentGuide = null;
        this.logger.info(Log.dim('Deactivated workflow'), Log.bold(Log.cyan(guide.options.label)));
      }
    });
    this.guideWorkflows.push(guide);
  }

  select(identifier: ComponentSelection) {
    this.selections[identifier.id] = identifier;
    this.logger.debug(
      Log.dim('Selecting component'),
      Log.bold(Log.purple(identifier.options.type)),
      identifier.options.identifier || {}
    );
    let matches = 0;
    for (let id in this.visibleComponents) {
      const vis = this.visibleComponents[id];
      if (identifier.matches(vis)) {
        matches += 1;
        vis.generate(identifier);
      }
    }
    if (matches > 0) {
      this.logger.debug(Log.green(`Matched ${matches} visible component${matches === 1 ? '' : 's'}`));
    } else {
      this.logger.debug(
        Log.yellow('Selection pending; no visible component matched'),
        Log.bold(Log.purple(identifier.options.type)),
        identifier.options.identifier || {},
        Log.dim(`${Object.keys(this.visibleComponents).length} visible components inspected`)
      );
    }

    identifier.registerListener({
      deactivated: () => {
        delete this.selections[identifier.id];
      }
    });
  }
}
