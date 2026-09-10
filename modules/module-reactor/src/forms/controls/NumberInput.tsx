import * as React from 'react';
import { FormInput, FormInputGenerics, FormInputOptions, FormInputRenderOptions } from '../FormInput';
import { Input } from '../../widgets/forms/inputs';
import { Observer } from 'mobx-react';
import { observable } from 'mobx';

export interface NumberInputOptions extends FormInputOptions<number> {
  validator?: (value: string) => boolean | string;
  min?: number;
  max?: number;
}

export class NumberInput extends FormInput<
  {
    OPTIONS: NumberInputOptions;
    VALUE: number;
  } & FormInputGenerics
> {
  locked: boolean;

  @observable
  accessor interemediateValue: string;

  constructor(options: NumberInputOptions) {
    super(options);
    this.locked = false;
    this.interemediateValue = options.value == null ? `` : `${options.value}`;
  }

  validate() {
    if (this.value == null) {
      super.validate();
      return;
    }
    if (!Number.isFinite(this.value)) {
      this.setError('Not valid');
      return;
    }
    if (this.options.min != null && this.value < this.options.min) {
      this.setError(`Value must be greater than or equal to ${this.options.min}`);
      return;
    }
    if (this.options.max != null && this.value > this.options.max) {
      this.setError(`Value must be less than or equal to ${this.options.max}`);
      return;
    }
    super.validate();
  }

  setValue(value: number | null) {
    if (!this.locked) {
      this.interemediateValue = value === null ? '' : `${value}`;
    }
    super.setValue(value);
  }

  setIntermediate(value: string) {
    this.locked = true;
    this.interemediateValue = value;
    if (value.trim() === '') {
      this.setValue(null);
    } else {
      this.setValue(Number(value.trim()));
    }
    this.locked = false;
  }

  renderControl(options: FormInputRenderOptions): React.JSX.Element {
    return (
      <Observer
        render={() => {
          return (
            <Input
              data-1p-ignore="true"
              type="text"
              autoComplete="off"
              name={this.name}
              placeholder={this.placeholder}
              value={this.interemediateValue || ''}
              onChange={(event) => {
                this.setIntermediate(event.target.value);
              }}
            />
          );
        }}
      />
    );
  }
}
