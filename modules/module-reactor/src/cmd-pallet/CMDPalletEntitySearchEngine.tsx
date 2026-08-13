import * as React from 'react';
import * as _ from 'lodash';
import {
  CMDPalletGenerateResultWidgetEvent,
  CMDPalletSearchEngine,
  CMDPalletSearchEngineResult,
  CommandPalletSearchEngineOptions,
  CommandPalletSearchResultEntry
} from './CMDPalletSearchEngine';
import {
  EntitySearchEngineComponent,
  EntitySearchResultEntry
} from '../entities/components/search/EntitySearchEngineComponent';
import { EntityDefinition } from '../entities/EntityDefinition';
import { ActionSource } from '../actions/Action';
import { useDraggableEntity } from '../widgets/dnd3/entities/useDraggableEntity';
import { SearchEvent } from '@journeyapps/reactor-lib-search';
import { CommandPalletEntryWidget } from '../layers/command-pallet/CommandPalletEntryWidget';

export interface CMDPalletEntitySearchEngineOptions<E> extends Omit<CommandPalletSearchEngineOptions, 'displayName'> {
  component: EntitySearchEngineComponent<E>;
  priority?: number;
}

export type CMDPalletEntitySearchEngineEntry<E> = EntitySearchResultEntry<E> & CommandPalletSearchResultEntry;

export class CMDPalletEntitySearchEngine<E> extends CMDPalletSearchEngine<CMDPalletEntitySearchEngineEntry<E>> {
  constructor(private options2: CMDPalletEntitySearchEngineOptions<E>) {
    super({
      ...options2,
      displayName: options2.component.definition.label,
      priority: options2.priority
    });
  }

  getWidget(entry: EntitySearchResultEntry<E>, event: CMDPalletGenerateResultWidgetEvent): React.JSX.Element {
    return (
      <CommandPalletEntryWidgetWrapped
        definition={this.options2.component.definition}
        entry={entry}
        event={event}
        key={event.key}
      />
    );
  }

  doSearch(event: SearchEvent): CMDPalletSearchEngineResult<CMDPalletEntitySearchEngineEntry<E>> {
    const res = this.options2.component.getSearchEngine().search({
      value: event.search
    });
    const transformed = new CMDPalletSearchEngineResult<CMDPalletEntitySearchEngineEntry<E>>(this);
    res.pipe(transformed, (results) => {
      return _.map(results, (result) => {
        return {
          ...result,
          engine: this,
          getWidget: (event) => {
            return this.getWidget(result, event);
          }
        } as CMDPalletEntitySearchEngineEntry<E>;
      });
    });
    return transformed;
  }

  async handleSelection(entry: CMDPalletEntitySearchEngineEntry<E>) {
    return this.options2.component.definition.selectEntity({
      entity: entry.entity,
      position: null,
      source: ActionSource.COMMAND_PALLET
    });
  }
}

export interface CommandPalletEntryWidgetWrappedProps {
  entry: EntitySearchResultEntry;
  event: CMDPalletGenerateResultWidgetEvent;
  definition: EntityDefinition;
  disabled?: boolean;
}

export const CommandPalletEntryWidgetWrapped: React.FC<
  React.PropsWithChildren<CommandPalletEntryWidgetWrappedProps>
> = ({ entry, event, definition, children, disabled }) => {
  const encoded = definition.encode(entry.entity, false);
  if (encoded) {
    useDraggableEntity({
      entity: encoded,
      forwardRef: event.ref
    });
  }
  const desc = definition.describeEntity(entry.entity);
  return (
    <CommandPalletEntryWidget
      color={desc.iconColor}
      icon={desc.icon}
      primary={desc.simpleName}
      secondary={desc.complexName}
      selected={event.selected}
      forwardRef={event.ref}
      mouseEntered={event.mouseEntered}
      mouseClicked={event.mouseClicked}
      disabled={disabled}
    >
      {children}
    </CommandPalletEntryWidget>
  );
};
