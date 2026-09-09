import * as React from 'react';
import { EmptyTableWidget } from './EmptyTableWidget';
import * as _ from 'lodash';
import { TableColumnWidget } from './TableColumnWidget';
import { observer } from 'mobx-react';
import { themed } from '../../stores/themes/reactor-theme-fragment';
import { TableRowsWidget } from './TableRowsWidget';
import { TableRowsGroupWidget, TableRowsGroupWidgetProps } from './TableRowsGroupWidget';
import { MousePosition } from '../../layers/combo/SmartPositionWidget';
import { getReactorBorderRadius, Size, useReactorSize } from '../../hooks/useReactorSize';

export interface TableColumn {
  display: string | React.JSX.Element;
  key: string;
  accessor?: (cell: any, row: TableRow) => React.JSX.Element | string;
  noWrap?: boolean;
  shrink?: boolean;
  length?: number;
}

export interface TableRow {
  cells: { [key: string]: any };
  key: string;
  groupKey?: string;
  selected?: boolean;
}

export interface TableWidgetProps<T extends TableRow = TableRow> {
  columns: TableColumn[];
  rows: T[];
  emptyLabel?: string;
  renderGroup?: (event: { rows: T[]; groupKey: string }) => Partial<TableRowsGroupWidgetProps>;
  onContextMenu?: (event: MousePosition, row: T) => any;
  size?: Size;
}

namespace S {
  export const Table = themed.table<{ $size: Size }>`
    color: ${(p) => p.theme.table.text};
    border-spacing: 0;
    width: 100%;
    border: 1px solid ${(p) => p.theme.table.border};
    border-collapse: separate;
    border-radius: ${(p) => getReactorBorderRadius(p.$size)}px;
    overflow: hidden;
  `;

  export const ColumnsRow = themed.tr`
    background: ${(p) => p.theme.table.columnBackground};
    color: ${(p) => p.theme.table.columnForeground};
    > th {
      border-bottom: 1px solid ${(p) => p.theme.table.border};
    }
  `;

  export const NoWrap = themed.div`
    display: flex;
    white-space: nowrap;
  `;
}

export const TableWidget = observer(<T extends TableRow = TableRow>(props: TableWidgetProps<T>) => {
  const size = useReactorSize(props.size);
  const getColumns = (): TableColumn[] => {
    return _.map(props.columns, (col) => {
      let accessor = col.accessor;

      // ensure a default accessor
      if (!accessor) {
        accessor = (cell: any, row) => {
          return `${cell}`;
        };
      }

      // additionally, no wrap?
      let finalAccessor = accessor;
      if (col.noWrap) {
        finalAccessor = (cell, row) => {
          return <S.NoWrap>{accessor(cell, row)}</S.NoWrap>;
        };
      }

      return {
        ...col,
        accessor: finalAccessor
      };
    });
  };

  const cols = getColumns();
  const groups = _.groupBy(
    props.rows.filter((f) => !!f.groupKey),
    'groupKey'
  );

  return (
    <S.Table $size={size}>
      <thead>
        <S.ColumnsRow>
          {_.map(cols, (col) => {
            return <TableColumnWidget column={col} key={col.key} size={size} />;
          })}
        </S.ColumnsRow>
      </thead>
      <tbody>
        {props.rows.length === 0 && (
          <tr>
            <td colSpan={Math.max(1, cols.length)}>
              <EmptyTableWidget label={props.emptyLabel} />
            </td>
          </tr>
        )}
        {/* Ungrouped */}
        <TableRowsWidget
          rows={props.rows.filter((f) => !f.groupKey)}
          onContextMenu={props.onContextMenu}
          cols={cols}
          size={size}
        />

        {
          //grouped
          _.map(groups, (rows, key) => {
            const partial: Partial<TableRowsGroupWidgetProps> = props.renderGroup
              ? props.renderGroup({
                  groupKey: key,
                  rows: rows
                })
              : { children: key };

            return (
              <TableRowsGroupWidget
                key={key}
                rows={rows}
                onContextMenu={props.onContextMenu}
                cols={cols}
                {...partial}
                size={size}
              />
            );
          })
        }
      </tbody>
    </S.Table>
  );
});
