import { FormInput } from './FormInput';
import * as React from 'react';
import styled from '@emotion/styled';
import { BaseObserver } from '@journeyapps/common-utils';

export interface FormEvent {
  input: FormInput;
}

export interface FormModelListener {
  valueChanged: (event: FormEvent) => any;
  errorsChanged: (event: FormEvent) => any;
}

export interface RenderOptions {
  spacing?: number;
}

export class FormModel<T = {}> extends BaseObserver<FormModelListener> {
  protected _inputs: Set<FormInput>;

  constructor() {
    super();
    this._inputs = new Set<FormInput>();
  }

  addInput<T extends FormInput>(input: T): T {
    this._inputs.add(input);
    const l1 = input.registerListener({
      valueChanged: () => {
        this.iterateListeners((cb) =>
          cb.valueChanged?.({
            input: input
          })
        );
      },
      errorChanged: () => {
        this.iterateListeners((cb) =>
          cb.errorsChanged?.({
            input: input
          })
        );
      },
      optionsUpdated: () => {
        this.iterateListeners((cb) => cb.errorsChanged?.({ input }));
      },
      removed: () => {
        this._inputs.delete(input);
        l1?.();
        this.iterateListeners((cb) => cb.errorsChanged?.({ input }));
      }
    });
    return input;
  }

  get inputs() {
    return Array.from(this._inputs.values());
  }

  getVisibleInputs() {
    return this.inputs.filter((i) => i.visible);
  }

  setValues(values: Partial<T>) {
    for (let key in values) {
      this.getInput(key).setValue(values[key]);
    }
  }

  getInput<T extends FormInput>(name: string) {
    return Array.from(this.inputs.values()).find((i) => i.name === name) as T;
  }

  errors(): T {
    let r = {};
    for (let item of this.inputs.values()) {
      if (!item.isValid()) {
        r[item.name] = item.value;
      }
    }
    return r as T;
  }

  value(): T {
    let r = {};
    for (let item of this.getVisibleInputs().values()) {
      r[item.name] = item.value;
    }
    return r as T;
  }

  isValid(): boolean {
    return this.inputs.every((input) => input.isValid());
  }

  render(options?: RenderOptions) {
    return (
      <S.Container gap={options?.spacing || 5}>
        {this.inputs.map((input) => {
          return <React.Fragment key={input.name}>{input.renderInputWidget({ inline: false })}</React.Fragment>;
        })}
      </S.Container>
    );
  }
}

namespace S {
  export const Container = styled.div<{ gap: number }>`
    display: flex;
    flex-direction: column;
    row-gap: ${(p) => p.gap}px;
  `;
}
