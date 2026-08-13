import { observable } from 'mobx';
import * as _ from 'lodash';
import { Btn } from '../definitions/common';
import * as React from 'react';
import { ComboBoxItem } from './combo/ComboBoxDirectives';
import { AbstractStore } from './AbstractStore';
import { v4 } from 'uuid';
import { ComboBoxStore2 } from './combo2/ComboBoxStore2';
import { SimpleComboBoxDirective } from './combo2/directives/simple/SimpleComboBoxDirective';
import { ChangeThemeAction } from '../actions/builtin-actions/ChangeThemeAction';
import { System } from '../core/System';
import { WorkspaceStore } from './workspace/WorkspaceStore';
import { SettingsPanelModel } from '../panels/settings/SettingsPanelModel';

const createFavicon = (url: string) => {
  const selector = document.head.querySelector(`link[type="image/x-icon"]`);
  if (selector) {
    selector.remove();
  }

  const link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
};

export enum Alignment {
  TOP = 'top',
  LEFT = 'left',
  RIGHT = 'right'
}

export interface Toolbar {
  key: string;
  allignment: Alignment;
  getWidget: () => React.JSX.Element;
}

export interface TabListener {
  tabLeft: () => any;
  tabRight: () => any;
}

export enum ReactorMetaIconButtons {
  SETTING = 'Settings'
}

export interface UXStoreOptions {
  comboBoxStore: ComboBoxStore2;
  system: System;
  workspaceStore: WorkspaceStore;
}

export class UXStore extends AbstractStore {
  @observable
  accessor locked: boolean;
  @observable
  accessor primaryLogo: string;
  @observable
  accessor primaryHeader: Btn;
  @observable
  accessor secondaryHeader: Btn;
  @observable
  accessor additionalToolbars: Map<string, Toolbar>;
  @observable
  accessor headerMetaIcons: Btn[];
  @observable
  accessor account: {
    email: string;
    name: string;
  };

  // favicons
  darkIcon: string;
  lightIcon: string;

  // layout
  rootComponent: React.ComponentClass | React.FunctionComponent;
  cssFragments: Map<string, string>;

  tabStack: TabListener[];

  // meta buttons
  accountButtonOptions: Set<ComboBoxItem>;
  settingsButtonItems: Set<ComboBoxItem>;

  constructor(protected options2: UXStoreOptions) {
    super({
      name: 'UX_STORE'
    });
    this.rootComponent = null;
    this.primaryLogo = null;
    this.additionalToolbars = new Map();
    this.headerMetaIcons = [
      {
        icon: 'cog',
        tooltip: ReactorMetaIconButtons.SETTING,
        action: (event) => {
          options2.comboBoxStore.show(
            new SimpleComboBoxDirective({
              event,
              sort: true,
              hideSearch: true,
              items: Array.from(this.settingsButtonItems.values())
            })
          );
        }
      }
    ];
    this.tabStack = [];
    this.account = null;
    this.locked = false;
    this.primaryHeader = null;
    this.secondaryHeader = null;
    this.cssFragments = new Map<string, string>();
    this.accountButtonOptions = new Set();
    this.settingsButtonItems = new Set();
  }

  addMetaItem(category: ReactorMetaIconButtons, item: ComboBoxItem) {
    if (category === ReactorMetaIconButtons.SETTING) {
      this.settingsButtonItems.add(item);
    }
    return () => {
      if (category === ReactorMetaIconButtons.SETTING) {
        this.settingsButtonItems.delete(item);
      }
    };
  }

  setFavicons(light: string, dark: string) {
    this.lightIcon = light;
    this.darkIcon = dark;
  }

  protected async _init() {
    this.addMetaItem(ReactorMetaIconButtons.SETTING, {
      ...ChangeThemeAction.get().representAsComboBoxItem({
        installAction: true
      }),
      group: 'IDE'
    });

    this.addMetaItem(ReactorMetaIconButtons.SETTING, {
      title: 'IDE settings',
      key: 'ide-settings',
      icon: 'gears',
      group: 'IDE',
      action: async () => {
        this.options2.workspaceStore.addModelInWindow(new SettingsPanelModel(), { width: 800, height: 600 });
      }
    });

    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    const applyFavIcon = () => {
      createFavicon(matcher.matches ? this.darkIcon : this.lightIcon);
    };
    matcher.addListener(applyFavIcon);
    applyFavIcon();
  }

  setRootComponent(component: React.ComponentClass | React.FunctionComponent) {
    this.rootComponent = component;
  }

  lockReactor(locked: boolean) {
    this.locked = locked;
  }

  pushTabListener(listener: TabListener): () => any {
    this.tabStack.push(listener);
    return () => {
      this.tabStack.splice(this.tabStack.indexOf(listener), 1);
    };
  }

  registerCSS(css: string) {
    const id = v4();
    this.cssFragments.set(id, css);
    const styleElement = window.document.createElement('style');
    styleElement.innerHTML = css;
    document.body.append(styleElement);
    return () => {
      this.cssFragments.delete(id);
      styleElement.remove();
    };
  }

  getToolbars(allignment: Alignment): Toolbar[] {
    return Array.from(this.additionalToolbars.values()).filter((toolbar) => {
      return toolbar.allignment === allignment;
    });
  }

  deregisterToolbar(key: string) {
    this.additionalToolbars.delete(key);
  }

  registerToolbar(toolbar: Toolbar) {
    this.additionalToolbars.set(toolbar.key, toolbar);
  }
}
