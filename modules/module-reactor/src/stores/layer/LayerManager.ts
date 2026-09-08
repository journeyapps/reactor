import { v4 } from 'uuid';
import { observable } from 'mobx';
import * as _ from 'lodash';
import { BaseObserver } from '@journeyapps/common-utils';

export interface LayerRenderEvent {
  index: number;
  layer: Layer;
}

export interface LayerOptions {
  render: (event: LayerRenderEvent) => React.JSX.Element;
  animate?: boolean;
  clickThrough?: boolean;
  userCanExit?: boolean;
  alwaysOnTop?: boolean;
}

export interface LayerListener {
  dispose: () => any;
}

export class Layer<T extends LayerOptions = LayerOptions> extends BaseObserver<LayerListener> {
  id: string;
  options: T;

  @observable
  accessor clickThrough: boolean;

  constructor(options: T) {
    super();
    this.id = v4();
    this.options = options;
    this.clickThrough = options.clickThrough ?? false;
  }

  userCanExit() {
    return this.options.userCanExit ?? true;
  }

  dispose() {
    this.iterateListeners((cb) => cb.dispose?.());
  }
}

export class LayerManager {
  @observable
  protected accessor visibleLayers: Layer[];

  constructor() {
    this.visibleLayers = [];
  }

  getLayers(): Layer[] {
    return _.sortBy(this.visibleLayers, (l) => (l.options.alwaysOnTop ? 1 : 0));
  }

  protected removeLayer(layer: Layer) {
    const index = this.visibleLayers.findIndex((f) => f.id === layer.id);
    if (index === -1) {
      return;
    }
    this.visibleLayers.splice(index, 1);
  }

  protected addLayer(layer: Layer) {
    // layer already exists
    if (this.visibleLayers.find((f) => f.id === layer.id)) {
      return;
    }
    this.visibleLayers.push(layer);
  }

  registerLayer(layer: Layer) {
    this.addLayer(layer);
    const l = layer.registerListener({
      dispose: () => {
        this.removeLayer(layer);
        l();
      }
    });
  }
}
