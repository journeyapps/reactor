import { SimpleEntitySearchEngineComponent } from '../../entities/components/search/SimpleEntitySearchEngineComponent';
import {
  CMDPalletGenerateResultWidgetEvent,
  CMDPalletSearchEngine,
  CMDPalletSearchEngineResult,
  CommandPalletSearchEngineOptions
} from '../../cmd-pallet/CMDPalletSearchEngine';
import {
  CMDPalletEntitySearchEngine,
  CMDPalletEntitySearchEngineEntry,
  CMDPalletEntitySearchEngineOptions,
  CommandPalletEntryWidgetWrapped
} from '../../cmd-pallet/CMDPalletEntitySearchEngine';
import { Action } from '../../actions/Action';
import { ActionValidationState } from '../../actions/validators/ActionValidator';
import * as React from 'react';
import { useValidator } from '../../hooks/useValidator';
import { ioc } from '../../inversify.config';
import { System } from '../../core/System';
import { EntitySearchResultEntry } from '../../entities/components/search/EntitySearchEngineComponent';
import { styled } from '../../stores/themes/reactor-theme-fragment';
import { ActionMetaWidget } from '../../actions/ActionMetaWidget';
import { useMemo } from 'react';
import { ActionStore } from '../../stores/actions/ActionStore';
import { SearchEvent } from '@journeyapps/reactor-lib-search';

export const matchesActionCommandPaletteSearch = (action: Action, event: SearchEvent) => {
  return [action.options.name, ...(action.options.aliases || []), ...(action.options.tags || [])].some((term) =>
    Boolean(event.matches(term))
  );
};

export class ActionSearchEngineComponent extends SimpleEntitySearchEngineComponent<Action> {
  constructor() {
    super({
      label: 'Default',
      getEntities: async () => {
        return ioc
          .get(ActionStore)
          .getActions()
          .filter((action) => {
            return action.validate().type !== ActionValidationState.HIDDEN;
          });
      }
    });
  }

  getCmdPaletteSearchEngine(
    options: Omit<CommandPalletSearchEngineOptions, 'displayName'> = {}
  ): CMDPalletSearchEngine {
    return new CmdPaletteActionSearchEngine(
      {
        ...options,
        component: this,

        // set priority to 100 to make it appear at the top
        priority: 100
      },
      this
    );
  }
}

export class CmdPaletteActionSearchEngine extends CMDPalletEntitySearchEngine<Action> {
  constructor(
    options: CMDPalletEntitySearchEngineOptions<Action>,
    protected component: ActionSearchEngineComponent
  ) {
    super(options);
  }

  async handleSelection(entry: CMDPalletEntitySearchEngineEntry<Action>): Promise<any> {
    return super.handleSelection(entry);
  }

  doSearch(event: SearchEvent): CMDPalletSearchEngineResult<CMDPalletEntitySearchEngineEntry<Action>> {
    const result = new CMDPalletSearchEngineResult<CMDPalletEntitySearchEngineEntry<Action>>(this);
    result.setValues(
      ioc
        .get(ActionStore)
        .getActions()
        .filter((action) => !action.options.hideFromCmdPallet)
        .filter((action) => action.validate().type !== ActionValidationState.HIDDEN)
        .filter((action) => matchesActionCommandPaletteSearch(action, event))
        .map((action) => {
          const entry: EntitySearchResultEntry<Action> = {
            entity: action,
            key: action.id
          };
          return {
            ...entry,
            engine: this,
            getWidget: (widgetEvent) => this.getWidget(entry, widgetEvent)
          } as CMDPalletEntitySearchEngineEntry<Action>;
        })
    );
    return result;
  }

  getWidget(entry: EntitySearchResultEntry<Action>, event: CMDPalletGenerateResultWidgetEvent): React.JSX.Element {
    return <ActionCmdPaletteEntryWidget key={entry.key} component={this.component} event={event} entry={entry} />;
  }
}

namespace S {
  export const Left = styled.div`
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;
    align-items: center;
  `;
  export const Category = styled.div<{ color: string }>`
    font-size: 11px;
    padding-left: 5px;
    padding-right: 5px;
    color: ${(p) => p.color};
  `;
}

export interface ActionCmdPaletteEntryWidgetProps {
  entry: EntitySearchResultEntry<Action>;
  event: CMDPalletGenerateResultWidgetEvent;
  component: ActionSearchEngineComponent;
}

export const ActionCmdPaletteEntryWidget: React.FC<ActionCmdPaletteEntryWidgetProps> = (props) => {
  const validator = useMemo(() => {
    return () => props.entry.entity.validate();
  }, []);

  const { validationResult } = useValidator({
    validator
  });
  const system = ioc.get(System);
  const def = system.definitions.get(props.entry.entity.options.category?.entityType);
  let category = def?.label || null;

  return (
    <CommandPalletEntryWidgetWrapped
      disabled={
        validationResult.type === ActionValidationState.DISABLED ||
        validationResult.type === ActionValidationState.PENDING
      }
      definition={props.component.definition}
      entry={props.entry}
      event={props.event}
    >
      <S.Left>
        {category ? <S.Category color={def.iconColor}>{category}</S.Category> : null}
        <ActionMetaWidget action={props.entry.entity} />
      </S.Left>
    </CommandPalletEntryWidgetWrapped>
  );
};
