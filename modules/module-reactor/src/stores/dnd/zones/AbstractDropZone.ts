import { BaseObserver } from '@journeyapps/common-utils';
import { MousePosition } from '../../../layers/combo/SmartPositionWidget';

export interface DropZoneListener {
  highlight: (highlight: boolean) => any;
}

export interface HandleDropEvent {
  data: { [key: string]: string };
  position: MousePosition;
}

export abstract class AbstractDropZone extends BaseObserver<DropZoneListener> {
  constructor() {
    super();
  }

  highlight(highlight: boolean) {
    this.iterateListeners((cb) => cb.highlight?.(highlight));
  }

  abstract acceptsMimeType(type: string): boolean;

  abstract handleDrop(event: HandleDropEvent);
}
