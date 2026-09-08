import * as React from 'react';
import { MousePosition } from '../../layers/combo/SmartPositionWidget';
import { ComboBoxItem } from '../combo/ComboBoxDirectives';
import { Btn } from '../../definitions/common';
import { BaseObserver } from '@journeyapps/common-utils';
import { v4 } from 'uuid';

export interface ComboBoxDirectiveListener {
  dismissed: () => any;
  selectedItemsChanged: () => any;
  searchChanged?: () => any;
}

export interface ComboBoxDirectiveOptions<T extends ComboBoxItem = ComboBoxItem> {
  title?: string;
  subtitle?: string;
  event?: MousePosition;
  searchPlaceholder?: string;
  centerOnMobile?: boolean;
}

export abstract class ComboBoxDirective<
  T extends ComboBoxItem = ComboBoxItem,
  O extends ComboBoxDirectiveOptions<T> = ComboBoxDirectiveOptions<T>
> extends BaseObserver<ComboBoxDirectiveListener> {
  readonly id: string;
  protected search: string;
  protected selected: Set<T>;

  // buttons which appear in the footer
  _buttons: Set<Btn>;

  constructor(protected options: O) {
    super();
    this.id = v4();
    this.search = null;
    this.selected = new Set();
    this._buttons = new Set();
  }

  get buttons() {
    return Array.from(this._buttons.values());
  }

  addButton(btn: Btn) {
    this._buttons.add(btn);
  }

  get searchPlaceholder() {
    return this.options.searchPlaceholder || 'Search';
  }

  get title() {
    return this.options.title;
  }

  get subtitle() {
    return this.options.subtitle;
  }

  getPosition() {
    return this.options.event;
  }

  centerOnMobile() {
    return this.options.centerOnMobile ?? true;
  }

  dismiss() {
    this.iterateListeners((cb) => cb.dismissed?.());
  }

  getSelected(): T[] {
    return Array.from(this.selected.values());
  }

  setSelected(items: T[]) {
    this.selected.clear();
    items.forEach((i) => {
      this.selected.add(i);
    });
    this.iterateListeners((cb) => cb.selectedItemsChanged?.());
  }

  setSearch(search: string) {
    this.search = search;
    this.iterateListeners((cb) => cb.searchChanged?.());
  }

  setParent(parent: any) {
    // optional parent-aware behavior for specific directives
  }

  abstract getContent(): React.JSX.Element;
}
