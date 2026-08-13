import * as React from 'react';
import { useState } from 'react';
import { observer } from 'mobx-react';
import {
  CardWidget,
  MultiSelectChangeEvent,
  SearchableMultiSelectTableWidget,
  PillWidget,
  ReactorPanelModel,
  SearchableTableWidget,
  TableRow,
  TablePillWidget,
  styled
} from '@journeyapps/reactor-mod';

export interface PlaygroundTablesPanelWidgetProps {
  model: ReactorPanelModel;
}

enum TableColumns {
  NAME = 'name',
  STATUS = 'status',
  OWNER = 'owner',
  TAGS = 'tags',
  LATENCY = 'latency'
}

interface DemoTableRow extends TableRow {
  cells: {
    [TableColumns.NAME]: string;
    [TableColumns.STATUS]: {
      label: string;
      color: string;
      meta?: string;
    };
    [TableColumns.OWNER]: string;
    [TableColumns.TAGS]: string[];
    [TableColumns.LATENCY]: string;
  };
}

const TABLE_ROWS: DemoTableRow[] = [
  {
    key: 'core-builds',
    groupKey: 'Core services',
    selected: true,
    cells: {
      [TableColumns.NAME]: 'Build queue',
      [TableColumns.STATUS]: { label: 'Stable', color: '#7fd29a', meta: '12 jobs' },
      [TableColumns.OWNER]: 'Platform',
      [TableColumns.TAGS]: ['worker', 'queue', 'prod'],
      [TableColumns.LATENCY]: '42 ms'
    }
  },
  {
    key: 'core-auth',
    groupKey: 'Core services',
    cells: {
      [TableColumns.NAME]: 'Auth gateway',
      [TableColumns.STATUS]: { label: 'Watching', color: '#f0c36a', meta: '2 retries' },
      [TableColumns.OWNER]: 'Security',
      [TableColumns.TAGS]: ['edge', 'jwt'],
      [TableColumns.LATENCY]: '83 ms'
    }
  },
  {
    key: 'core-events',
    groupKey: 'Core services',
    cells: {
      [TableColumns.NAME]: 'Event relay',
      [TableColumns.STATUS]: { label: 'Stable', color: '#7fd29a', meta: 'live' },
      [TableColumns.OWNER]: 'Platform',
      [TableColumns.TAGS]: ['stream', 'sync'],
      [TableColumns.LATENCY]: '57 ms'
    }
  },
  {
    key: 'core-audit',
    groupKey: 'Core services',
    cells: {
      [TableColumns.NAME]: 'Audit trail',
      [TableColumns.STATUS]: { label: 'Queued', color: '#d4a95f', meta: 'backfill' },
      [TableColumns.OWNER]: 'Security',
      [TableColumns.TAGS]: ['logs', 'retention'],
      [TableColumns.LATENCY]: '118 ms'
    }
  },
  {
    key: 'ux-table',
    groupKey: 'UI surfaces',
    cells: {
      [TableColumns.NAME]: 'Table tokens',
      [TableColumns.STATUS]: { label: 'Needs review', color: '#7aa6c2', meta: 'reactor' },
      [TableColumns.OWNER]: 'Design systems',
      [TableColumns.TAGS]: ['theme', 'rows', 'hover'],
      [TableColumns.LATENCY]: 'n/a'
    }
  },
  {
    key: 'ux-editor',
    groupKey: 'UI surfaces',
    cells: {
      [TableColumns.NAME]: 'Editor theme pass',
      [TableColumns.STATUS]: { label: 'Complete', color: '#5cc9a7', meta: '8 themes' },
      [TableColumns.OWNER]: 'Frontend',
      [TableColumns.TAGS]: ['editor', 'selection'],
      [TableColumns.LATENCY]: 'n/a'
    }
  },
  {
    key: 'ux-panels',
    groupKey: 'UI surfaces',
    cells: {
      [TableColumns.NAME]: 'Panel chrome',
      [TableColumns.STATUS]: { label: 'Exploring', color: '#7aa6c2', meta: 'tokens' },
      [TableColumns.OWNER]: 'Frontend',
      [TableColumns.TAGS]: ['tabs', 'headers'],
      [TableColumns.LATENCY]: 'n/a'
    }
  },
  {
    key: 'ux-status',
    groupKey: 'UI surfaces',
    cells: {
      [TableColumns.NAME]: 'Status surfaces',
      [TableColumns.STATUS]: { label: 'Complete', color: '#5cc9a7', meta: 'qa pass' },
      [TableColumns.OWNER]: 'Design systems',
      [TableColumns.TAGS]: ['pills', 'cards'],
      [TableColumns.LATENCY]: 'n/a'
    }
  },
  {
    key: 'ops-cache',
    groupKey: 'Operations',
    cells: {
      [TableColumns.NAME]: 'Cache warmers',
      [TableColumns.STATUS]: { label: 'Degraded', color: '#d98686', meta: '1 region' },
      [TableColumns.OWNER]: 'SRE',
      [TableColumns.TAGS]: ['jobs', 'background'],
      [TableColumns.LATENCY]: '137 ms'
    }
  },
  {
    key: 'ops-backups',
    groupKey: 'Operations',
    cells: {
      [TableColumns.NAME]: 'Snapshot backups',
      [TableColumns.STATUS]: { label: 'Stable', color: '#7fd29a', meta: 'nightly' },
      [TableColumns.OWNER]: 'SRE',
      [TableColumns.TAGS]: ['storage', 'recovery'],
      [TableColumns.LATENCY]: '91 ms'
    }
  },
  {
    key: 'ops-regions',
    groupKey: 'Operations',
    cells: {
      [TableColumns.NAME]: 'Regional failover',
      [TableColumns.STATUS]: { label: 'Watching', color: '#f0c36a', meta: 'eu-west' },
      [TableColumns.OWNER]: 'Infra',
      [TableColumns.TAGS]: ['routing', 'health'],
      [TableColumns.LATENCY]: '104 ms'
    }
  },
  {
    key: 'ops-alerts',
    groupKey: 'Operations',
    cells: {
      [TableColumns.NAME]: 'Alert fanout',
      [TableColumns.STATUS]: { label: 'Degraded', color: '#d98686', meta: 'slack' },
      [TableColumns.OWNER]: 'Infra',
      [TableColumns.TAGS]: ['pager', 'notifications'],
      [TableColumns.LATENCY]: '166 ms'
    }
  }
];

export const PlaygroundTablesPanelWidget: React.FC<PlaygroundTablesPanelWidgetProps> = observer(() => {
  const [selectedRows, setSelectedRows] = useState<string[]>(['core-builds', 'ux-editor', 'ops-cache']);

  const columns = [
    {
      key: TableColumns.NAME,
      display: 'Name',
      accessorSearch: (cell: string) => cell
    },
    {
      key: TableColumns.STATUS,
      display: 'Status',
      noWrap: true,
      accessor: (cell: DemoTableRow['cells'][TableColumns.STATUS]) => (
        <PillWidget label={cell.label} color={cell.color} meta={cell.meta ? { label: cell.meta } : null} />
      ),
      accessorSearch: (cell: DemoTableRow['cells'][TableColumns.STATUS]) => cell.label
    },
    {
      key: TableColumns.OWNER,
      display: 'Owner',
      accessorSearch: (cell: string) => cell
    },
    {
      key: TableColumns.TAGS,
      display: 'Tags',
      accessor: (cell: string[]) => (
        <S.Tags>
          {cell.map((tag, index) => (
            <React.Fragment key={`${tag}-${index}`}>
              <TablePillWidget special={index === 0}>{tag}</TablePillWidget>
            </React.Fragment>
          ))}
        </S.Tags>
      ),
      accessorSearch: (cell: string[]) => cell.join(' ')
    },
    {
      key: TableColumns.LATENCY,
      display: 'Latency',
      noWrap: true,
      shrink: true,
      accessorSearch: (cell: string) => cell
    }
  ];

  return (
    <S.Container>
      <CardWidget
        title="Searchable Table"
        subHeading="Grouped rows with searchable columns and theme-driven selection styling"
        sections={[
          {
            key: 'searchable-table',
            content: () => (
              <SearchableTableWidget<DemoTableRow>
                columns={columns}
                rows={TABLE_ROWS}
                renderGroup={(event) => ({
                  defaultCollapsed: false,
                  children: `${event.groupKey} (${event.rows.length})`
                })}
                emptyLabel="No demo rows match the current search"
              />
            )
          }
        ]}
      />
      <CardWidget
        title="Multi-Select Table"
        subHeading="Selection is controlled via selected row keys and applied through row.selected"
        sections={[
          {
            key: 'multi-select-table',
            content: () => (
              <S.MultiSelectContent>
                <SearchableMultiSelectTableWidget<DemoTableRow>
                  columns={columns}
                  rows={TABLE_ROWS}
                  selectedRowKeys={selectedRows}
                  onSelectionChange={(event: MultiSelectChangeEvent<DemoTableRow>) => {
                    setSelectedRows(event.rowKeys);
                  }}
                  renderGroup={(event) => ({
                    defaultCollapsed: false,
                    children: `${event.groupKey} (${event.rows.length})`
                  })}
                  emptyLabel="No demo rows match the current search"
                />
                <S.SelectedPills>
                  {selectedRows.map((rowKey) => (
                    <React.Fragment key={rowKey}>
                      <TablePillWidget>{rowKey}</TablePillWidget>
                    </React.Fragment>
                  ))}
                </S.SelectedPills>
              </S.MultiSelectContent>
            )
          }
        ]}
      />
    </S.Container>
  );
});

namespace S {
  export const Container = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
  `;

  export const Tags = styled.div`
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  `;

  export const MultiSelectContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;

  export const SelectedPills = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  `;
}
