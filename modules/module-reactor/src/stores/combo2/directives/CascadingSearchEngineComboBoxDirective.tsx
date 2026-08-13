import { ComboBoxDirective, ComboBoxDirectiveOptions } from '../ComboBoxDirective';
import { ComboBoxItem } from '../../combo/ComboBoxDirectives';
import * as React from 'react';
import { styled } from '../../themes/reactor-theme-fragment';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ioc } from '../../../inversify.config';
import { System } from '../../../core/System';
import { SearchEngineComboBoxDirective } from './SearchEngineComboBoxDirective';
import { PARENT_VARIABLE } from '../../../entities/components/search/SimpleParentEntitySearchEngine';
import { EntitySearchEngineParameter } from '../../../search/params/EntitySearchEngineParameter';

export interface CascadingSearchEngineComboBoxDirectiveOptions<
  T extends ComboBoxItem
> extends ComboBoxDirectiveOptions {
  directives: ComboBoxDirective<T>[];
  passValueToNextDirective: (item: T, nextEngine: ComboBoxDirective) => any;
}

export class CascadingSearchEngineComboBoxDirective<T extends ComboBoxItem = ComboBoxItem> extends ComboBoxDirective<
  T,
  CascadingSearchEngineComboBoxDirectiveOptions<T>
> {
  @observable
  accessor currentDirective: ComboBoxDirective<T>;

  selections: Map<ComboBoxDirective<T>, T>;

  currentListener?: () => any;

  directives: ComboBoxDirective<T>[];

  constructor(options: CascadingSearchEngineComboBoxDirectiveOptions<T>) {
    super(options);
    this.directives = options.directives;
    this.selections = new Map();
    this.setCurrentDirective(options.directives[0]);
  }

  setParent(parent: any) {
    const parentDef = ioc.get(System).getDefinitionForEntity(parent);
    const searchEngineDirectives = this.directives.filter(
      (d) => d instanceof SearchEngineComboBoxDirective
    ) as unknown as SearchEngineComboBoxDirective[];
    const directive = searchEngineDirectives.find((s) => {
      const parameter = Array.from(s.engine.parameters.values()).find(
        (p) => p.options.key === PARENT_VARIABLE
      ) as EntitySearchEngineParameter;
      return parameter?.options.entityType === parentDef.type;
    });

    if (directive) {
      let index = this.directives.indexOf(directive as unknown as ComboBoxDirective<T>);
      this.directives.splice(0, index);

      directive.parameters[PARENT_VARIABLE] = parent;
      this.setCurrentDirective(directive as any);
    }
  }

  dismiss() {
    super.dismiss();
    this.currentListener?.();
  }

  setCurrentDirective(directive: ComboBoxDirective<T>) {
    const index = this.directives.findIndex((d) => d === directive);
    this.currentListener?.();
    this.currentListener = directive.registerListener({
      dismissed: () => {
        // nothing selected, dismiss this root directive
        if (directive.getSelected().length === 0) {
          this.dismiss();
        }
        // load next directive
        else if (index + 1 < this.directives.length) {
          const value = directive.getSelected()[0];
          this.selections.set(directive, value);
          this.options.passValueToNextDirective(value, this.directives[index + 1]);
          this.setCurrentDirective(this.directives[index + 1]);
        }
        // final directive
        else {
          this.setSelected(directive.getSelected());
        }
      }
    });
    this.currentDirective = directive;
  }

  setSelected(items: T[]) {
    super.setSelected(items);
    this.dismiss();
  }

  getContent(): React.JSX.Element {
    return <CascadingSearchEngineComboBoxDirectiveWidget directive={this} />;
  }
}

namespace S {
  export const Crumb = styled.div<{ pointer: boolean }>`
    display: flex;
    align-items: center;
    padding-right: 10px;
    padding-bottom: 5px;
    color: ${(p) => p.theme.combobox.text};
    cursor: ${(p) => (p.pointer ? 'pointer' : 'inherit')};
  `;

  export const Number = styled.div<{ selected: boolean }>`
    border-radius: 3px;
    padding: 3px 5px;
    display: flex;
    font-size: 12px;
    background: ${(p) =>
      p.selected ? p.theme.combobox.backgroundSelected : getTransparentColor(p.theme.combobox.text, 0.2)};
  `;

  export const Label = styled.div<{ primary: boolean }>`
    padding-left: 5px;
    font-size: 12px;
    opacity: ${(p) => (p.primary ? 1 : 0.5)};
  `;

  export const Selection = styled.div`
    margin-left: 5px;
    font-size: 12px;
    background: mediumpurple;
    border-radius: 5px;
    padding: 2px 5px;
  `;
}

export interface CascadingSearchEngineComboBoxDirectiveWidgetProps {
  directive: CascadingSearchEngineComboBoxDirective;
}

export const CascadingSearchEngineComboBoxDirectiveWidget: React.FC<CascadingSearchEngineComboBoxDirectiveWidgetProps> =
  observer((props) => {
    const selectedIndex = props.directive.directives.findIndex((d) => d === props.directive.currentDirective);

    return (
      <>
        {props.directive.directives.map((d, index) => {
          const allowGoingBack = index < selectedIndex;
          const selected = selectedIndex === index;
          return (
            <S.Crumb
              pointer={allowGoingBack}
              onClick={() => {
                if (allowGoingBack) {
                  props.directive.setCurrentDirective(d);
                }
              }}
            >
              <S.Number selected={selected}>step {index + 1}</S.Number>
              {index < selectedIndex ? (
                <S.Selection>{props.directive.selections.get(d).title}</S.Selection>
              ) : (
                <S.Label primary={allowGoingBack || selected}>{d.title}</S.Label>
              )}
            </S.Crumb>
          );
        })}
        <React.Fragment key={selectedIndex}>{props.directive.currentDirective.getContent()}</React.Fragment>
      </>
    );
  });
