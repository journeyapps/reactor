import * as React from 'react';
import { LogLevel } from '@journeyapps-labs/common-logger';
import { observer } from 'mobx-react';
import { SearchEvent } from '@journeyapps/reactor-lib-search';
import {
  inject,
  LoggerStore,
  LoggerTreeEntry,
  PanelButtonWidget,
  PanelDropdownWidget,
  SearchablePanelWidget,
  styled,
  TreeLeafWidget,
  TreeWidget
} from '@journeyapps/reactor-mod';
import { LoggingDebugPanelModel } from './LoggingDebugPanelModel';

const INHERIT_LEVEL = 'INHERIT';
const LEVEL_ITEMS = [
  { key: INHERIT_LEVEL, title: 'Inherit from parent', icon: 'turn-down' as const },
  { key: LogLevel.OFF, title: 'Off', icon: 'volume-xmark' as const },
  { key: LogLevel.ERROR, title: 'Errors', icon: 'circle-exclamation' as const },
  { key: LogLevel.WARN, title: 'Warnings', icon: 'triangle-exclamation' as const },
  { key: LogLevel.INFO, title: 'Information', icon: 'circle-info' as const },
  { key: LogLevel.DEBUG, title: 'Debug', icon: 'bug' as const }
];
const GLOBAL_LEVEL_ITEMS = LEVEL_ITEMS.filter((item) => item.key !== INHERIT_LEVEL);

namespace S {
  export const Intro = styled.div`
    color: ${(p) => p.theme.text.secondary};
    margin-bottom: 12px;
    line-height: 1.45;
  `;

  export const LoggerTree = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
  `;

  export const Tree = styled(TreeWidget)`
    & + & {
      margin-top: 2px;
    }
  `;

  export const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  `;

  export const ToolbarControl = styled.div`
    margin: 0 4px;
  `;

  export const Level = styled.span<{ $level: LogLevel }>`
    color: ${(p) => {
      switch (p.$level) {
        case LogLevel.ERROR:
          return p.theme.status.failed;
        case LogLevel.WARN:
          return p.theme.guide.accent;
        case LogLevel.INFO:
          return p.theme.status.loading;
        case LogLevel.DEBUG:
          return p.theme.status.success;
        case LogLevel.OFF:
        default:
          return p.theme.text.secondary;
      }
    }};
    font-size: 12px;
    font-weight: 700;
    min-width: 42px;
    text-align: right;
  `;

  export const Empty = styled.div`
    color: ${(p) => p.theme.text.secondary};
    padding: 20px;
    text-align: center;
  `;
}

export interface LoggerDebugPanelWidgetProps {
  model: LoggingDebugPanelModel;
}

@observer
export class LoggerDebugPanelWidget extends React.Component<LoggerDebugPanelWidgetProps> {
  @inject(LoggerStore)
  accessor loggerStore: LoggerStore;

  private filterTree(entry: LoggerTreeEntry, search: string): LoggerTreeEntry | null {
    if (!search) {
      return entry;
    }
    const normalized = search.toLowerCase();
    const loggers = entry.loggers
      .map((child) => this.filterTree(child, normalized))
      .filter((child): child is LoggerTreeEntry => child != null);
    if (
      entry.name.toLowerCase().includes(normalized) ||
      entry.label.toLowerCase().includes(normalized) ||
      loggers.length
    ) {
      return { ...entry, loggers };
    }
    return null;
  }

  private renderControls(entry: LoggerTreeEntry) {
    const inherited = entry.configuredLevel == null;
    return (
      <S.Controls onClick={(event) => event.stopPropagation()}>
        <S.Level $level={entry.level}>{entry.level}</S.Level>
        <PanelDropdownWidget
          label={inherited ? `Inherit (${entry.level})` : entry.configuredLevel}
          selected={entry.configuredLevel ?? INHERIT_LEVEL}
          items={LEVEL_ITEMS}
          onChange={({ key }) => {
            if (key === INHERIT_LEVEL) {
              this.loggerStore.inherit(entry.name);
            } else {
              this.loggerStore.setLevel(entry.name, key);
            }
          }}
        />
        <PanelButtonWidget
          icon="bullseye"
          tooltip={`Only show logs from ${entry.label} and its children`}
          action={() => this.loggerStore.isolate(entry.name)}
        />
      </S.Controls>
    );
  }

  private renderLogger(entry: LoggerTreeEntry, depth: number, searching: boolean) {
    const commonProps = {
      label: entry.label,
      tooltip: entry.name,
      depth,
      rightChildren: this.renderControls(entry)
    };

    if (entry.loggers.length === 0) {
      return <TreeLeafWidget key={entry.name} {...commonProps} />;
    }

    return (
      <S.Tree key={entry.name} {...commonProps} openDefault={depth === 0} collapsed={searching ? false : undefined}>
        {(childDepth) => entry.loggers.map((child) => this.renderLogger(child, childDepth, searching))}
      </S.Tree>
    );
  }

  private renderContent(event: SearchEvent) {
    void this.loggerStore.revision;
    const roots = this.loggerStore
      .getTree()
      .map((entry) => this.filterTree(entry, event.search || ''))
      .filter((entry): entry is LoggerTreeEntry => entry != null);

    if (!roots.length) {
      return <S.Empty>No loggers match “{event.search}”.</S.Empty>;
    }

    return (
      <>
        <S.Intro>
          Choose a level to override a logger, or let it inherit from its parent. Changes apply immediately and are
          remembered for this browser.
        </S.Intro>
        <S.LoggerTree>{roots.map((root) => this.renderLogger(root, 0, !!event.search))}</S.LoggerTree>
      </>
    );
  }

  private getGlobalLevel() {
    const levels = new Set(this.loggerStore.getEntries().map((entry) => entry.level));
    return levels.size === 1 ? Array.from(levels)[0] : null;
  }

  render() {
    const globalLevel = this.getGlobalLevel();
    return (
      <SearchablePanelWidget historyContext="reactor-debug-loggers" getContent={(event) => this.renderContent(event)}>
        <S.ToolbarControl>
          <PanelDropdownWidget
            icon="sliders"
            label={globalLevel ? `All: ${globalLevel}` : 'All levels: Mixed'}
            selected={globalLevel}
            items={GLOBAL_LEVEL_ITEMS}
            onChange={({ key }) => this.loggerStore.setGlobalLevel(key)}
          />
        </S.ToolbarControl>
        <S.ToolbarControl>
          <PanelButtonWidget
            icon="rotate-left"
            label="Reset logging"
            tooltip="Clear every logger override"
            action={() => this.loggerStore.reset()}
          />
        </S.ToolbarControl>
      </SearchablePanelWidget>
    );
  }
}
