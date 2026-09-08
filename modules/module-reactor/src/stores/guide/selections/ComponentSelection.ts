import { makeObservable, observable } from 'mobx';
import { v4 } from 'uuid';
import { VisibleComponentIdentifier } from '../GuideStore';
import * as _ from 'lodash';
import { BaseObserver } from '@journeyapps/common-utils';

export interface ComponentSelectionListener {
  deactivated: () => any;
}

export interface ComponentSelectionOptions<I> {
  type: string;
  identifier?: I;
}

export enum ToolTipPositionHint {
  ABOVE = 'above',
  BELOW = 'below',
  RIGHT = 'right',
  LEFT = 'left'
}

export interface MutableRect {
  top: number;
  left: number;
  height: number;
  width: number;
}

export interface TooltipObjectDirective {
  gen: (event: { above: boolean }) => React.JSX.Element;
  hint?: ToolTipPositionHint;
}

export type ToolTipDirective = string | TooltipObjectDirective;

export class ComponentSelection<
  I = any,
  T extends ComponentSelectionListener = ComponentSelectionListener
> extends BaseObserver<T> {
  id: string;

  @observable
  accessor tooltip: ToolTipDirective;

  @observable
  accessor rect: MutableRect;

  options: ComponentSelectionOptions<I>;

  constructor(options: ComponentSelectionOptions<I>) {
    super();
    this.options = options;
    this.id = v4();
    this.rect = null;
    this.tooltip = null;
  }

  setRect(rect: MutableRect) {
    this.rect = rect;
  }

  dispose() {
    this.iterateListeners((c) => c.deactivated()?.());
  }

  showTooltip(message: ToolTipDirective) {
    this.tooltip = message;
    return this;
  }

  matches(identifier: VisibleComponentIdentifier<I, this>) {
    if (identifier.type !== this.options.type) {
      return false;
    }

    return _.isEqual(
      _.pickBy(this.options.identifier || {}, _.identity),
      _.pickBy(identifier.selection || {}, _.identity)
    );
  }
}
