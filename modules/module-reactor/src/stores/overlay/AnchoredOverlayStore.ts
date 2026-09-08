import { computed, observable } from 'mobx';
import { v4 } from 'uuid';
import * as React from 'react';
import { BaseObserver } from '@journeyapps/common-utils';
import { AbstractStore } from '../AbstractStore';

export enum AnchoredOverlayPlacement {
  AUTO = 'auto',
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}

export interface AnchoredOverlayBounds {
  top: number;
  left: number;
  width: number;
  height: number;
  right?: number;
  bottom?: number;
}

export interface AnchoredOverlayRenderContext {
  placement: AnchoredOverlayPlacement;
  above: boolean;
}

export interface AnchoredOverlayOptions {
  id?: string;
  source: string;
  bounds: AnchoredOverlayBounds;
  placement: AnchoredOverlayPlacement;
  clickThrough: boolean;
  render: (context: AnchoredOverlayRenderContext) => React.ReactNode;
}

export interface AnchoredOverlayRecordListener {
  hidden: () => any;
}

export class AnchoredOverlayRecord extends BaseObserver<AnchoredOverlayRecordListener> {
  constructor(protected options: AnchoredOverlayOptions) {
    super();
    this.options = observable({
      ...options,
      id: options.id || v4()
    });
  }

  get id() {
    return this.options.id;
  }

  get source() {
    return this.options.source;
  }

  get bounds() {
    return this.options.bounds;
  }

  get placement() {
    return this.options.placement;
  }

  get clickThrough() {
    return this.options.clickThrough;
  }

  get render() {
    return this.options.render;
  }

  update(options: Partial<Omit<AnchoredOverlayOptions, 'id' | 'source'>>) {
    Object.assign(this.options, options);
  }

  hide() {
    this.iterateListeners((listener) => listener.hidden?.());
  }
}

export class AnchoredOverlayStore extends AbstractStore {
  @observable
  protected accessor _overlays: Set<AnchoredOverlayRecord>;

  constructor() {
    super({ name: 'ANCHORED_OVERLAY_STORE' });
    this._overlays = new Set();
  }

  @computed
  get overlays() {
    return Array.from(this._overlays.values());
  }

  show<T extends AnchoredOverlayRecord>(overlay: T): T {
    const disposeListener = overlay.registerListener({
      hidden: () => {
        disposeListener();
        this._overlays.delete(overlay);
      }
    });
    this._overlays.add(overlay);
    return overlay;
  }

  replaceSource(source: string, records: AnchoredOverlayRecord[]) {
    this.overlays.filter((overlay) => overlay.source === source).forEach((overlay) => overlay.hide());
    records.forEach((overlay) => this.show(overlay));
  }

  clearSource(source: string) {
    this.replaceSource(source, []);
  }

  hasOverlays() {
    return this._overlays.size > 0;
  }

  isClickThrough() {
    return this.overlays.every((overlay) => overlay.clickThrough);
  }
}
