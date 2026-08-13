import * as React from 'react';
import { TableRow, TableColumn } from './TableWidget';
import { TableRowsWidget } from './TableRowsWidget';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styled } from '../../stores/themes/reactor-theme-fragment';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { MousePosition } from '../../layers/combo/SmartPositionWidget';
import { size, Size } from '../../hooks/useReactorSize';

export interface TableRowsGroupWidgetProps<T extends TableRow = TableRow> {
  rows: T[];
  cols: TableColumn[];
  onContextMenu: (event: MousePosition, row: T) => any;
  defaultCollapsed?: boolean;
  children?: any;
  size: Size;
}

export interface TableRowsGroupWidgetState {
  collapsed: boolean;
}

namespace S {
  export const Row = styled.tr``;

  export const Cell = styled.td`
    padding: 0;
  `;

  export const Container = styled.div<{ $size: Size }>`
    padding: ${(p) => size(p, ['5px 10px', '6px 12px', '8px 14px'])};
    display: flex;
    cursor: pointer;
    background: ${(p) => p.theme.table.groupBackground || p.theme.table.columnBackground};
    color: ${(p) => p.theme.table.columnForeground};
    border-top: 1px solid ${(p) => p.theme.table.groupBorder};
  `;

  export const Icon = styled(FontAwesomeIcon)`
    color: ${(p) => getTransparentColor(p.theme.table.columnForeground, 0.3)};
    font-size: 15px;
    flex-grow: 0;
    flex-shrink: 0;
  `;

  export const Content = styled.div`
    flex-grow: 1;
  `;
}

export class TableRowsGroupWidget<T extends TableRow = TableRow> extends React.Component<
  TableRowsGroupWidgetProps<T>,
  TableRowsGroupWidgetState
> {
  constructor(props: TableRowsGroupWidgetProps<T>) {
    super(props);
    this.state = {
      collapsed: !!props.defaultCollapsed
    };
  }

  render() {
    return (
      <>
        <S.Row
          onClick={() => {
            this.setState({
              collapsed: !this.state.collapsed
            });
          }}
        >
          <S.Cell colSpan={this.props.cols.length}>
            <S.Container $size={this.props.size}>
              <S.Content>{this.props.children}</S.Content>
              <S.Icon icon={this.state.collapsed ? 'angle-down' : 'angle-up'} />
            </S.Container>
          </S.Cell>
        </S.Row>
        {this.state.collapsed ? null : <TableRowsWidget {...this.props} />}
      </>
    );
  }
}
