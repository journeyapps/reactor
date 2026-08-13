import * as React from 'react';
import { useEffect, useRef } from 'react';
import { ComboBoxDirective, ComboBoxDirectiveOptions } from '../../ComboBoxDirective';
import { ComboBoxItem } from '../../../combo/ComboBoxDirectives';
import { ComboBoxWidget } from '../../../../layers/combo/ComboBoxWidget';
import { useForceUpdate } from '../../../../hooks/useForceUpdate';
import { ControlledSearchWidget } from '../../../../widgets/search/ControlledSearchWidget';
import * as _ from 'lodash';
import { createSearchEventMatcher, SearchEventMatcher } from '@journeyapps/reactor-lib-search';
import { styled } from '../../../themes/reactor-theme-fragment';
import { ioc } from '../../../../inversify.config';
import { ComboBoxStore2 } from '../../ComboBoxStore2';
import { SimpleComboBoxDirective } from './SimpleComboBoxDirective';
import { ReactorViewportMode, useReactorViewportMode } from '../../../../hooks/useReactorViewportMode';
import { activateWithValidation } from '../../../../hooks/useValidator';
import { isValidationHidden } from '../../../../actions/validators/ActionValidator';
import { observer } from 'mobx-react';

export interface BaseComboBoxDirectiveOptions<T extends ComboBoxItem = ComboBoxItem> extends ComboBoxDirectiveOptions {
  items: T[];
  hideSearch?: boolean;
  sort?: boolean;
}

export class BaseComboBoxDirective<
  T extends ComboBoxItem = ComboBoxItem,
  O extends BaseComboBoxDirectiveOptions<T> = BaseComboBoxDirectiveOptions<T>
> extends ComboBoxDirective<T, O> {
  private matcher: SearchEventMatcher;
  private flattenedItems = new Map<string, T>();

  constructor(options: O) {
    super(options);
  }

  showSearch() {
    if (this.options.hideSearch) {
      return false;
    }
    return this.getFlattenedItems().length > 5;
  }

  selectItem(key: string) {
    const found = this.flattenedItems.get(key) || this.options.items.find((i) => i.key === key);
    if (found?.disabled) {
      return;
    }
    const validation = found?.validator?.();
    if (!validation) {
      this.setSelected([found]);
      return;
    }
    void activateWithValidation(validation, () => this.setSelected([found]));
  }

  setSelected(items: T[]) {
    super.setSelected(items);
    this.getSelected().forEach((s) => {
      s.action?.(this.getPosition());
    });
  }

  getContent(): React.JSX.Element {
    return <SimpleComboBoxDirectiveWidget directive={this} />;
  }

  getAllItems() {
    const items = this.options.sort ? _.sortBy(this.options.items, (i) => i.title) : this.options.items;
    return items.filter((item) => !item.validator || !isValidationHidden(item.validator()));
  }

  getItems() {
    if (!this.matcher) {
      return this.getAllItems();
    }
    return this.getFlattenedItems().flatMap((item) => {
      const titleMatch = this.matcher(item.title);
      return titleMatch ? [{ ...item, titleMatch }] : [];
    });
  }

  setSearch(search: string) {
    super.setSearch(search);
    const value = search?.trim();
    if (!value) {
      this.matcher = null;
    } else {
      this.matcher = createSearchEventMatcher(value);
    }
  }

  private getFlattenedItems(): T[] {
    this.flattenedItems.clear();

    const flatten = (items: ComboBoxItem[], titlePath: string[], keyPath: string[]): T[] => {
      return items.flatMap((item) => {
        if (item.validator && isValidationHidden(item.validator())) {
          return [];
        }

        const nextTitlePath = [...titlePath, item.title];
        const nextKeyPath = [...keyPath, item.key];
        if (item.children?.length) {
          return flatten(item.children, nextTitlePath, nextKeyPath);
        }

        const key = `search:${nextKeyPath.join('>')}`;
        this.flattenedItems.set(key, item as T);
        return [
          {
            ...item,
            key,
            title: nextTitlePath.join(' › '),
            group: undefined,
            children: undefined
          } as T
        ];
      });
    };

    return flatten(this.getAllItems(), [], []);
  }
}

export interface BaseComboBoxDirectiveWidgetProps {
  directive: BaseComboBoxDirective;
}

export const SimpleComboBoxDirectiveWidget: React.FC<BaseComboBoxDirectiveWidgetProps> = observer((props) => {
  const forceUpdate = useForceUpdate();
  const viewportMode = useReactorViewportMode();
  const store = ioc.get(ComboBoxStore2);
  const childDirective = useRef<{
    directive: SimpleComboBoxDirective;
    key: string;
    listener: () => any;
  }>(null);

  const dismissChildDirective = () => {
    childDirective.current?.listener();
    childDirective.current?.directive.dismiss();
    childDirective.current = null;
  };

  useEffect(() => {
    return props.directive.registerListener({
      dismissed: () => {
        childDirective.current?.directive.dismiss();
      }
    });
  }, [props.directive]);

  if (props.directive.getAllItems().length === 0) {
    return <S.NoItems>No items</S.NoItems>;
  }

  return (
    <>
      {props.directive.showSearch() ? (
        <S.Search
          focusOnMount={true}
          searchChanged={(search) => {
            dismissChildDirective();
            props.directive.setSearch(search);
            forceUpdate();
          }}
        />
      ) : null}
      <ComboBoxWidget
        maxHeight={!props.directive.showSearch() ? 600 : null}
        initialSelected={null}
        placeholder={props.directive.searchPlaceholder}
        items={props.directive.getItems()}
        hovered={(item, dimensions) => {
          if (viewportMode === ReactorViewportMode.MOBILE) {
            return;
          }
          if (!dimensions || item.key === childDirective.current?.key) {
            return;
          }
          dismissChildDirective();
          if (item.children?.length > 0) {
            let directive = new SimpleComboBoxDirective({
              items: item.children,
              event: {
                clientX: dimensions.x + dimensions.width,
                clientY: dimensions.y
              }
            });

            let l1 = directive.registerListener({
              dismissed: () => {
                l1();
                props.directive.dismiss();
              }
            });

            childDirective.current = {
              key: item.key,
              directive,
              listener: l1
            };
            store.show(childDirective.current.directive);
          }
        }}
        selected={(item, event) => {
          if (viewportMode === ReactorViewportMode.MOBILE && item.children?.length > 0) {
            dismissChildDirective();

            props.directive.dismiss();
            store.show(
              new SimpleComboBoxDirective({
                items: item.children,
                event: {
                  clientX: event?.clientX || props.directive.getPosition()?.clientX,
                  clientY: event?.clientY || props.directive.getPosition()?.clientY
                },
                title: item.title
              })
            );
            return;
          }

          if (item.link) {
            window.open(item.link, '_blank');
          }
          props.directive.selectItem(item.key);
        }}
      />
    </>
  );
});

namespace S {
  export const Search = styled(ControlledSearchWidget)`
    margin-bottom: 5px;
    min-width: 200px;
  `;

  export const NoItems = styled.div`
    font-style: italic;
    font-size: 12px;
    color: ${(p) => p.theme.text.secondary};
    text-align: center;
  `;
}
