import * as React from 'react';
import styled from '@emotion/styled';
import { TableWidgetProps, TableWidget, TableColumn, TableRow } from './TableWidget';
import { ControlledSearchWidget } from '../search/ControlledSearchWidget';
import { SearchEventMatcher, createSearchEventMatcher } from '@journeyapps/reactor-lib-search';
import { themed } from '../../stores/themes/reactor-theme-fragment';
const no_results = require('../../../media/empty-table.svg');

export interface SearchableTableColumn extends TableColumn {
  accessorSearch?: (cell: any, row: any) => string | null;
}

export interface SearchableTableWidgetProps<T extends TableRow = TableRow> extends TableWidgetProps<T> {
  columns: SearchableTableColumn[];
  emptyLabel?: string;
  onSearch?: (searchValue: string | null) => any;
  tableFactory?: React.ComponentType<any>;
  tableFactoryProps?: Record<string, any>;
}

export interface SearchableTableWidgetState {
  matcher: SearchEventMatcher;
}

export class SearchableTableWidget<T extends TableRow = TableRow> extends React.Component<
  React.PropsWithChildren<SearchableTableWidgetProps<T>>,
  SearchableTableWidgetState
> {
  constructor(props: SearchableTableWidgetProps<T>) {
    super(props);
    this.state = {
      matcher: null
    };
  }

  getRows = () => {
    if (!this.state.matcher) {
      return this.props.rows;
    }
    return this.props.rows.filter((row) => {
      for (let col of this.props.columns) {
        if (!col.accessorSearch) {
          continue;
        }
        const searchValue = col.accessorSearch(row.cells[col.key], row);
        if (!!searchValue && !!this.state.matcher(searchValue)) {
          return true;
        }
      }
      return false;
    });
  };

  getEmptyMessage = () => {
    return (
      <S.EmptyContainer>
        <S.Image src={no_results} />
        <S.EmptyDesc>{this.props.emptyLabel || 'No items to display'}</S.EmptyDesc>
      </S.EmptyContainer>
    );
  };

  render() {
    const rows = this.getRows();
    const TableFactory = this.props.tableFactory || TableWidget;

    return (
      <S.Container>
        <S.Controls>
          {this.props.children}
          <S.ControlledSearch
            searchChanged={(search) => {
              this.setState(
                {
                  matcher: search ? createSearchEventMatcher(search) : null
                },
                () => {
                  this.props.onSearch?.(search);
                }
              );
            }}
          />
        </S.Controls>
        <TableFactory
          {...this.props}
          {...this.props.tableFactoryProps}
          tableFactory={undefined}
          tableFactoryProps={undefined}
          rows={rows}
        />
        {rows.length === 0 ? this.getEmptyMessage() : null}
      </S.Container>
    );
  }
}

namespace S {
  export const Container = styled.div``;

  export const ControlledSearch = styled(ControlledSearchWidget)`
    margin-left: 10px;
  `;

  export const Controls = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 5px;
  `;

  export const EmptyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  `;

  export const Image = styled.img`
    width: 50px;
    margin-bottom: 10px;
  `;

  export const EmptyDesc = themed.div`
      color: ${(p) => p.theme.text.primary};
      font-size: 14px;
  `;
}
