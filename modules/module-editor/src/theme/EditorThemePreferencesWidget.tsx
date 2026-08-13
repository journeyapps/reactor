import * as React from 'react';
import styled from '@emotion/styled';
import {
  ComboBoxStore,
  inject,
  SearchableTableWidget,
  TableRow,
  ColorPickerWidget,
  PanelButtonWidget,
  PANEL_CONTENT_PADDING,
  ScrollableDivCss
} from '@journeyapps/reactor-mod';
import { colorRegistry } from './theme-utils';
import { UploadVSIXThemeBtnWidget } from './UploadVSIXThemeBtnWidget';
import * as _ from 'lodash';
import { ChangeEditorThemeAction } from '../actions/ChangeEditorThemeAction';
import { MonacoThemeStore, EditorTheme } from '../stores/MonacoThemeStore';
import { aHexToRgba, rgbaToAHex } from '@journeyapps/reactor-lib-utils';

export interface EditorThemePreferencesWidgetProps {
  save: (theme: EditorTheme) => any;
  theme: EditorTheme;
}

export interface EditorThemePreferencesWidgetState {
  theme: EditorTheme;
  modified: boolean;
}

namespace S {
  export const Container = styled.div`
    overflow: auto;
    height: 100%;
    padding: ${PANEL_CONTENT_PADDING}px;
    ${ScrollableDivCss};
  `;

  export const Top = styled.div`
    display: flex;
    flex-grow: 1;
  `;

  export const Button = styled(PanelButtonWidget)`
    margin-left: 5px;
  `;
}

export const fromCamelCaseToSentence = _.memoize((word) =>
  _.capitalize(
    word
      .replace(/([A-Z][a-z]+)/g, ' $1')
      .replace(/([A-Z]{2,})/g, ' $1')
      .replace(/\s{2,}/g, ' ')
      .trim()
  )
);

export enum ThemeTableColumns {
  COLOR = 'color',
  IDENT = 'ident',
  DESC = 'desc'
}

export class EditorThemePreferencesWidget extends React.Component<
  EditorThemePreferencesWidgetProps,
  EditorThemePreferencesWidgetState
> {
  @inject(ComboBoxStore)
  accessor comboBoxStore: ComboBoxStore;

  @inject(MonacoThemeStore)
  accessor monacoThemeStore: MonacoThemeStore;

  constructor(props: EditorThemePreferencesWidgetProps) {
    super(props);
    this.state = {
      theme: props.theme,
      modified: false
    };
  }

  getRGBA(c: any) {
    if (!c) {
      return null;
    }
    if (_.isString(c)) {
      return aHexToRgba(c);
    }
    return c.toString();
  }

  deleteTheme = () => {
    this.monacoThemeStore.deleteTheme(this.state.theme);
  };

  render() {
    return (
      <S.Container>
        <SearchableTableWidget
          columns={[
            {
              key: ThemeTableColumns.COLOR,
              display: 'Color',
              shrink: true,
              accessor: (cell, row) => {
                return (
                  <ColorPickerWidget
                    color={this.getRGBA(cell) || 'rgba(0,0,0,0)'}
                    colorChanged={(color) => {
                      this.setState({
                        theme: {
                          ...this.state.theme,
                          theme: {
                            ...this.state.theme.theme,
                            colors: {
                              ...this.state.theme.theme.colors,
                              [row.key]: rgbaToAHex(color)
                            }
                          }
                        },
                        modified: true
                      });
                    }}
                  />
                );
              }
            },
            {
              key: ThemeTableColumns.IDENT,
              display: 'ID',
              shrink: true,
              noWrap: true,
              accessorSearch: (cell) => {
                return cell;
              }
            },
            {
              key: ThemeTableColumns.DESC,
              display: 'Description',
              accessorSearch: (cell) => {
                return cell;
              }
            }
          ]}
          renderGroup={(event) => {
            return {
              defaultCollapsed: true,
              children: fromCamelCaseToSentence(event.groupKey)
            };
          }}
          rows={
            _.map(colorRegistry.colorSchema.properties, (property, id) => {
              if (_.isFunction(colorRegistry.colorsById[id].defaults?.dark)) {
                return false;
              }

              let group = null;
              let names = id.split('.');
              if (names.length > 1) {
                group = names[0];
                names.splice(0, 1);
              }

              return {
                key: id,
                groupKey: group,
                cells: {
                  [ThemeTableColumns.COLOR]: this.state.theme.theme.colors[id],
                  [ThemeTableColumns.IDENT]: names.map((part) => fromCamelCaseToSentence(part)).join(' > '),
                  [ThemeTableColumns.DESC]: property.description
                }
              } as TableRow;
            }).filter((f) => !!f) as TableRow[]
          }
        >
          <S.Top>
            <UploadVSIXThemeBtnWidget
              gotTheme={(theme) => {
                this.monacoThemeStore.addTheme(theme);
              }}
            />
            <S.Button {...ChangeEditorThemeAction.get().representAsButton()} label={this.state.theme.label} />
            <S.Button disabled={this.state.theme?.system} label={'Delete theme'} action={this.deleteTheme} />
            <S.Button
              disabled={!this.state.modified}
              label={'Save'}
              action={() => {
                this.props.save(this.state.theme);
                this.setState({
                  modified: false
                });
              }}
            />
          </S.Top>
        </SearchableTableWidget>
      </S.Container>
    );
  }
}
