import { FormInput, FormInputGenerics, FormInputOptions } from '../../FormInput';

export interface AbstractTextInputOptions extends FormInputOptions<string> {
  validator?: (value: string) => boolean | string;
}

export interface TextInputFormGenerics extends FormInputGenerics {
  OPTIONS: AbstractTextInputOptions;
  VALUE: string;
}

export abstract class AbstractTextInput<
  Generics extends TextInputFormGenerics = TextInputFormGenerics
> extends FormInput<Generics> {
  protected override isEmpty(): boolean {
    return (this.value?.trim().length ?? 0) === 0;
  }

  setValue(value: string | null) {
    if (value?.trim() === '') {
      value = null;
    }
    super.setValue(value);
  }

  override validate() {
    if (this.isEmpty()) {
      super.validate();
      return;
    }
    if (!this.options.validator) {
      super.validate();
      return;
    }
    const result = this.options.validator(this.value);
    if (result !== true) {
      this.setError(result || 'Not valid');
      return;
    }
    super.validate();
  }
}
