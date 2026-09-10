import * as React from 'react';
import { useEffect } from 'react';
import {
  FormInput,
  FormInputGenerics,
  FormInputListener,
  FormInputOptions,
  FormInputRenderOptions
} from '../../FormInput';
import { FloatingPanelButtonWidget } from '../../../widgets/floating/FloatingPanelButtonWidget';
import { styled } from '../../../stores/themes/reactor-theme-fragment';
import { useForceUpdate } from '../../../hooks/useForceUpdate';
import { LoadingPanelWidget } from '../../../widgets/panel/panel/LoadingPanelWidget';
import { v4 } from 'uuid';
import { PanelButtonWidget } from '../../../widgets/forms/PanelButtonWidget';
import { SurfaceWidget } from '../../../widgets/surfaces/SurfaceWidget';

export interface ArrayInputOptions<T> extends FormInputOptions<T[]> {
  generate: () => FormInput;
}

export interface ArrayInputListener extends FormInputListener {
  loadingChanged: () => any;
}

export interface ArrayInputGenerics<T> extends FormInputGenerics {
  VALUE: T[];
  OPTIONS: ArrayInputOptions<T>;
  LISTENER: ArrayInputListener;
}

export class ArrayInput<T> extends FormInput<ArrayInputGenerics<T>> {
  entries: Map<string, FormInput>;
  entryListeners: Set<() => any>;

  loading: boolean;

  constructor(options: ArrayInputOptions<T>) {
    super({
      ...options,
      value: options.value || []
    });
    this.entries = new Map();
    this.entryListeners = new Set();
    this.loading = false;
    this.setValue(this.value || []);
  }

  protected override isEmpty(): boolean {
    return (this.value?.length ?? 0) === 0;
  }

  override get valid(): boolean {
    if (!super.valid) {
      return false;
    }
    return Array.from(this.entries.values()).every((input) => input.isValid());
  }

  setLoading(loading = this.loading) {
    if (this.loading === loading) {
      return;
    }
    this.loading = loading;
    this.iterateListeners((cb) => cb.loadingChanged?.());
  }

  setValue(values: ArrayInputGenerics<T>['VALUE']) {
    if (values.length !== this.entries.size) {
      this.entryListeners.forEach((e) => {
        e();
      });
      this.entryListeners.clear();
      this.entries.clear();

      values.map((value) => {
        const item = this.options.generate();
        const listener = item.registerListener({
          errorChanged: () => {
            this.iterateListeners((cb) => cb.errorChanged?.({ error: this.error }));
          },
          optionsUpdated: () => {
            this.iterateListeners((cb) => cb.errorChanged?.({ error: this.error }));
          },
          valueChanged: () => {
            super.setValue(Array.from(this.entries.values()).map((v) => v.value));
          }
        });
        this.entryListeners.add(listener);
        this.entries.set(v4(), item);
      });
    }

    values.forEach((v, index) => {
      Array.from(this.entries.values())[index].setValue(v);
    });

    super.setValue(values);
    this.iterateListeners((cb) => cb.errorChanged?.({ error: this.error }));
  }

  protected updateValue() {
    this.setValue(Array.from(this.entries.values()).map((v) => v.value));
  }

  renderControl(options: FormInputRenderOptions): React.JSX.Element {
    return <ArrayInputWidget input={this} />;
  }
}

export interface ArrayInputWidgetProps {
  input: ArrayInput<any>;
}

export const ArrayInputWidget: React.FC<ArrayInputWidgetProps> = (props) => {
  const input = props.input;
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    return props.input.registerListener({
      loadingChanged: () => {
        forceUpdate();
      }
    });
  }, []);

  if (props.input.loading) {
    return (
      <S.Container>
        <LoadingPanelWidget loading={true} children={() => null} />
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Entries>
        {Array.from(input.entries.keys()).map((key, index) => {
          return (
            <S.Entry key={key}>
              <S.Display>{input.entries.get(key).renderInputWidget({ inline: true })}</S.Display>
              <FloatingPanelButtonWidget
                btn={{
                  icon: 'close',
                  action: () => {
                    let value = [...input.value];
                    value.splice(index, 1);
                    input.setValue(value);
                  }
                }}
              />
            </S.Entry>
          );
        })}
      </S.Entries>
      <PanelButtonWidget
        icon="plus"
        action={() => {
          input.setValue([...input.value, null]);
        }}
      />
    </S.Container>
  );
};

namespace S {
  export const Container = styled.div``;

  export const Display = styled.div`
    flex-grow: 1;
  `;

  export const Entries = styled.div`
    padding-bottom: 5px;
  `;

  export const Entry = styled(SurfaceWidget)`
    padding: 5px;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    column-gap: 5px;

    &:last-of-type {
      margin-bottom: 0;
    }
  `;
}
