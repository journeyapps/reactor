import { SetControl } from '../../controls/SetControl';
import { FormInputOptions } from '../FormInput';
import { ControlInput, ControlInputGenerics } from './ControlInput';

export interface SelectInputOptions<T extends string = string> extends FormInputOptions {
  options: Record<T, string>;
  tooltip?: string;
}

export class SelectInput<T extends string = string> extends ControlInput<
  {
    OPTIONS: SelectInputOptions<T>;
  } & ControlInputGenerics<T>
> {
  protected override isEmpty(): boolean {
    return (this.value?.trim().length ?? 0) === 0;
  }

  constructor(options: SelectInputOptions<T>) {
    super(
      options,
      new SetControl({
        initialValue: options.value,
        options: Object.keys(options.options).map((key) => {
          return {
            key: key,
            label: options.options[key]
          };
        }),
        disabled: options.disabled
      })
    );
    this.registerListener({
      optionsUpdated: () => {
        this.control.updateOptions({
          options: this.getOptions()
        });
      }
    });
  }

  getOptions() {
    return Object.keys(this.options.options).map((key) => {
      return {
        key: key,
        label: this.options.options[key]
      };
    });
  }
}
