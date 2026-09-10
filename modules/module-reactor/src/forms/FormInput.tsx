import * as React from 'react';
import { useEffect } from 'react';
import { InputContainerWidget } from '../widgets/forms/InputContainerWidget';
import styled from '@emotion/styled';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { BaseObserver } from '@journeyapps/common-utils';
import { Size } from '../hooks/useReactorSize';

export interface FormInputOptions<T = any> {
  label: string;
  name?: string;
  required?: boolean;
  desc?: string;
  /**
   * Expressed as markdown
   */
  tooltip?: string;
  placeholder?: string;
  value?: T;
  visible?: boolean;
  disabled?: boolean;
  /**
   * Keep the input invalid while allowing a nested control to render the validation message.
   */
  hideError?: boolean;
  size?: Size;
}

export interface FormInputRenderOptions {
  inline: boolean;
}

export interface FormInputListener<T = any> {
  valueChanged: (event: { prev_value: T; current_value: T }) => any;
  errorChanged: (event: { error: string | null }) => any;
  removed: () => any;
  visibilityChanged: () => any;
  optionsUpdated: () => any;
}

export type SimplifiedFormInputType<T> = FormInput<{
  VALUE: T;
  OPTIONS: FormInputOptions<T>;
  LISTENER: FormInputListener<T>;
}>;

export interface FormInputGenerics {
  OPTIONS: FormInputOptions;
  LISTENER: FormInputListener;
  VALUE: any;
}

export abstract class FormInput<T extends FormInputGenerics = FormInputGenerics> extends BaseObserver<T['LISTENER']> {
  value: T['VALUE'];
  private _error: string | null;
  options: T['OPTIONS'];

  constructor(options: T['OPTIONS']) {
    super();
    this.options = {
      ...options,
      visible: options.visible ?? true
    };
    this.value = options.value ?? null;
    this._error = null;
    this.validate();
  }

  update(options: Partial<Omit<T['OPTIONS'], 'name' | 'value'>>) {
    this.options = {
      ...this.options,
      ...options
    };
    this.validate();
    this.iterateListeners((cb) => cb.optionsUpdated?.());
  }

  get valid() {
    return !this.error;
  }

  /**
   * Whether this field is valid. Hidden fields do not block the form.
   */
  isValid(): boolean {
    if (!this.visible) {
      return true;
    }
    return this.valid;
  }

  protected isEmpty(): boolean {
    return this.value == null;
  }

  protected setError(error?: string) {
    if (this._error == error) {
      return;
    }
    this._error = error || null;
    this.iterateListeners((cb) => cb.errorChanged?.({ error: this._error }));
  }

  get error() {
    return this._error;
  }

  get visible() {
    return this.options.visible;
  }

  get label() {
    return this.options.label;
  }

  get placeholder() {
    return this.options.placeholder ?? this.label;
  }

  validate() {
    if (this.options.required && this.isEmpty()) {
      this.setError('Required');
    } else {
      this.setError(null);
    }
  }

  dispose() {}

  remove() {
    this.iterateListeners((cb) => cb.removed?.());
  }

  setValue(value: T['VALUE']) {
    if (value === this.value) {
      return;
    }
    let old = this.value;
    this.value = value;
    this.validate();
    this.iterateListeners((cb) => cb.valueChanged?.({ prev_value: old, current_value: this.value }));
  }

  get name() {
    return this.options.name || this.options.label;
  }

  renderInputWidget(options: FormInputRenderOptions): React.JSX.Element {
    return <FormInputWidget input={this}>{() => this.renderControl(options)}</FormInputWidget>;
  }

  abstract renderControl(options: FormInputRenderOptions): React.JSX.Element;
}

export interface FormInputWidgetProps {
  input: FormInput;
  children: () => React.JSX.Element;
}

export const FormInputWidget: React.FC<FormInputWidgetProps> = (props) => {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    return props.input.registerListener({
      valueChanged: () => {
        forceUpdate();
      },
      errorChanged: () => {
        forceUpdate();
      },
      optionsUpdated: () => {
        forceUpdate();
      }
    });
  }, []);
  if (!props.input.visible) {
    return null;
  }
  return (
    <S.InputContainer
      disabled={props.input.options.disabled}
      desc={props.input.options.desc}
      tooltip={props.input.options.tooltip}
      error={props.input.options.hideError ? null : props.input.error}
      label={props.input.label}
    >
      {props.children()}
    </S.InputContainer>
  );
};

namespace S {
  export const InputContainer = styled(InputContainerWidget)<{ disabled: boolean }>`
    ${(p) => (p.disabled ? `opacity: 0.5; pointer-events: none;` : '')};
  `;
}
