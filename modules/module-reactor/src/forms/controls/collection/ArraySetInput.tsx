import * as React from 'react';
import { useEffect } from 'react';
import {
  FormInput,
  FormInputGenerics,
  FormInputListener,
  FormInputOptions,
  FormInputRenderOptions
} from '../../FormInput';
import { ComboBoxItem } from '../../../stores/combo/ComboBoxDirectives';
import { PanelDropdownWidget } from '../../../widgets/forms/PanelDropdownWidget';
import { styled } from '../../../stores/themes/reactor-theme-fragment';
import * as _ from 'lodash';
import { useForceUpdate } from '../../../hooks/useForceUpdate';
import { LoadingPanelWidget } from '../../../widgets/panel/panel/LoadingPanelWidget';
import { PanelButtonMode, PanelButtonWidget } from '../../../widgets/forms/PanelButtonWidget';
import { Btn } from '../../../definitions/common';
import { SurfaceWidget, useSurfaceBorderColor } from '../../../widgets/surfaces/SurfaceWidget';

export interface ArraySetInputOptions<T> extends FormInputOptions<{ [key: string]: T }> {
  generate: (key: string) => FormInput;
  entries: ComboBoxItem[];
  addbutton?: Partial<Btn>;
  layout?: {
    scrollLength: number;
  };
}

export interface ArraySetInputListener extends FormInputListener {
  loadingChanged: () => any;
}

export interface ArraySetInputGenerics<T> extends FormInputGenerics {
  VALUE: { [key: string]: T };
  OPTIONS: ArraySetInputOptions<T>;
  LISTENER: ArraySetInputListener;
}

export class ArraySetInput<T> extends FormInput<ArraySetInputGenerics<T>> {
  entries: Map<string, FormInput>;
  entryListeners: Map<string, () => any>;

  loading: boolean;
  private settingValues = false;

  protected override isEmpty(): boolean {
    return Object.keys(this.value || {}).length === 0;
  }

  override get valid(): boolean {
    if (!super.valid) {
      return false;
    }
    return Array.from(this.entries.values()).every((input) => input.isValid());
  }

  constructor(options: ArraySetInputOptions<T>) {
    super({
      ...options,
      value: options.value || {},
      layout: options.layout || {
        scrollLength: null
      }
    });
    this.entries = new Map();
    this.entryListeners = new Map();
    this.loading = false;
    const initialValue = this.value;
    this.value = {};
    this.setValue(initialValue || {});
  }

  setLoading(loading = this.loading) {
    if (this.loading === loading) {
      return;
    }
    this.loading = loading;
  }

  setValue(value: ArraySetInputGenerics<T>['VALUE']) {
    // to generate
    _.difference(Object.keys(value), Array.from(this.entries.keys())).forEach((key) => {
      const item = this.options.generate(key);
      item.setValue(value[key]);
      const listener = item.registerListener({
        errorChanged: () => {
          this.iterateListeners((cb) => cb.errorChanged?.({ error: this.error }));
        },
        optionsUpdated: () => {
          this.iterateListeners((cb) => cb.errorChanged?.({ error: this.error }));
        },
        valueChanged: () => {
          if (!this.settingValues) {
            this.updateValue();
          }
        }
      });
      this.entryListeners.set(key, listener);
      this.entries.set(key, item);
    });

    // inputs to remove
    _.difference(Array.from(this.entries.keys()), Object.keys(value)).forEach((r) => {
      this.entryListeners.get(r)();
      this.entryListeners.delete(r);
      this.entries.delete(r);
    });

    this.settingValues = true;
    try {
      this.entries.forEach((item, key) => item.setValue(value[key]));
    } finally {
      this.settingValues = false;
    }
    super.setValue(value);
    this.iterateListeners((cb) => cb.errorChanged?.({ error: this.error }));
  }

  protected updateValue() {
    this.setValue(
      Array.from(this.entries.entries()).reduce((prev, cur) => {
        prev[cur[0]] = cur[1].value;
        return prev;
      }, {})
    );
  }

  availableEntries() {
    return this.options.entries.filter((i) => {
      return !this.entries.has(i.key);
    });
  }

  renderControl(options: FormInputRenderOptions): React.JSX.Element {
    return <ArraySetInputWidget input={this} />;
  }
}

export interface ArraySetInputWidgetProps {
  input: ArraySetInput<any>;
}

export const ArraySetInputWidget: React.FC<ArraySetInputWidgetProps> = (props) => {
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
        {Array.from(input.entries.keys()).map((key) => {
          return (
            <ArraySetInputEntryWidget
              key={key}
              input={input.entries.get(key)}
              label={input.options.entries.find((i) => i.key === key).title}
              remove={() => {
                let value = { ...input.value };
                delete value[key];
                input.setValue(value);
              }}
            />
          );
        })}
      </S.Entries>
      <PanelDropdownWidget
        icon="plus"
        {...(props.input.options.addbutton || {})}
        disabled={input.availableEntries().length === 0}
        selected={null}
        items={input.availableEntries()}
        onChange={({ key }) => {
          input.setValue({
            ...input.value,
            [key]: null
          });
        }}
      />
    </S.Container>
  );
};

export const ArraySetInputEntryWidget: React.FC<
  React.PropsWithChildren<{ label: string; input: FormInput; remove: () => any }>
> = (props) => {
  return (
    <S.Entry>
      <ArraySetEntryTop>
        <S.EntryLabel>{props.label}</S.EntryLabel>
        <PanelButtonWidget icon="close" mode={PanelButtonMode.LINK} action={props.remove} />
      </ArraySetEntryTop>
      <S.Display>{props.input.renderInputWidget({ inline: true })}</S.Display>
    </S.Entry>
  );
};

const ArraySetEntryTop: React.FC<React.PropsWithChildren> = (props) => {
  const borderColor = useSurfaceBorderColor();

  return <S.EntryTop $borderColor={borderColor}>{props.children}</S.EntryTop>;
};

namespace S {
  export const Container = styled.div``;

  // !----------- entry ----------

  export const Display = styled.div`
    padding: 10px;
  `;

  export const Entries = styled.div`
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  `;

  export const EntryLabel = styled.div`
    flex-grow: 1;
    color: ${(p) => p.theme.forms.groupLabelForeground};
    font-size: 12px;
    font-weight: 700;
  `;

  export const Entry = styled(SurfaceWidget)`
    flex-shrink: 0;
    overflow: hidden;
  `;

  export const EntryTop = styled.div<{ $borderColor?: string }>`
    display: flex;
    align-items: center;
    border-bottom: solid 1px ${(p) => p.$borderColor};
    padding-left: 5px;
  `;
}
