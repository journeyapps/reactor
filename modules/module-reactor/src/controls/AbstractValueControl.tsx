import { ComboBoxItem } from '../stores/combo/ComboBoxDirectives';
import { Btn } from '../definitions/common';
import { computed, observable } from 'mobx';
import { AbstractControl, RepresentAsComboBoxItemsEvent, RepresentAsControlOptions } from './AbstractControl';
import { BaseObserver } from '@journeyapps/common-utils';

export interface AbstractValueControlListener<Value> {
  valueChanged: (value: Value) => any;
  optionsUpdated?: () => any;
}

export interface AbstractValueControlOptions<Value> {
  initialValue: Value;
}

export abstract class AbstractValueControl<
  Value = any,
  Options extends AbstractValueControlOptions<Value> = AbstractValueControlOptions<Value>
>
  extends BaseObserver<AbstractValueControlListener<Value>>
  implements AbstractControl
{
  @observable
  protected accessor _value: Value;

  constructor(protected options: Options) {
    super();
    this._value = options.initialValue;
  }

  updateOptions(options: Partial<Omit<Options, 'initialValue'>>) {
    this.options = {
      ...this.options,
      ...options
    };
    this.iterateListeners((cb) => cb.optionsUpdated?.());
  }

  abstract representAsBtn(): Btn;

  abstract representAsControl(options?: RepresentAsControlOptions): React.JSX.Element;

  abstract representAsComboBoxItems(options?: RepresentAsComboBoxItemsEvent): ComboBoxItem[];

  @computed get value() {
    return this._value;
  }

  set value(value: Value) {
    if (this._value === value) {
      return;
    }

    this._value = value;
    this.iterateListeners((cb) => cb.valueChanged?.(value));
  }
}
