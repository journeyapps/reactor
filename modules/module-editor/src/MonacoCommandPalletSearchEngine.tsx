import * as _ from 'lodash';
import * as React from 'react';
import styled from '@emotion/styled';
import { MonacoShortcut } from './shortcuts/MonacoShortcut';
import {
  CMDPalletSearchEngine,
  CMDPalletSearchEngineResult,
  CommandPalletEntryWidget,
  CommandPalletSearchResultEntry,
  KeyboardShortcutPillsWidget,
  MousePosition
} from '@journeyapps/reactor-mod';
import * as monaco from 'monaco-editor';
import { MonacoShortcutHandler } from './shortcuts/MonacoShortcutHandler';
import { MonacoKeybindingStore } from './stores/keybindings/MonacoKeybindingStore';
import { SearchEvent } from '@journeyapps/reactor-lib-search';

export interface CMDPalletMonacoActionSearchEntry extends CommandPalletSearchResultEntry {
  action: monaco.editor.IEditorAction;
}

namespace S {
  export const Left = styled.div`
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;
  `;
}

export interface MonacoCommandPalletSearchEngineOptions {
  keybindingStore: MonacoKeybindingStore;
  handler: MonacoShortcutHandler;
}

export class MonacoCommandPalletSearchEngine extends CMDPalletSearchEngine<CMDPalletMonacoActionSearchEntry> {
  constructor(protected options2: MonacoCommandPalletSearchEngineOptions) {
    super({
      displayName: 'Editor',
      priority: 1000
    });
  }

  getShortcuts(action: MonacoShortcut) {
    if (!action) {
      return null;
    }
    return (
      <S.Left>
        <KeyboardShortcutPillsWidget chord={action.chord} />
      </S.Left>
    );
  }

  doSearch(event: SearchEvent): CMDPalletSearchEngineResult<CMDPalletMonacoActionSearchEntry> {
    const result = new CMDPalletSearchEngineResult<CMDPalletMonacoActionSearchEntry>(this);
    result.setValues(
      _.filter(this.options2.keybindingStore.getContextualActions(), (action) => {
        return !!event.matches(action.label, {
          nullIsTrue: true
        });
      }).map((action) => {
        return {
          key: `monaco-shortcut-${action.label}`,
          action: action,
          engine: this,
          getWidget: (event) => {
            const shortcuts = this.options2.handler.getShortcutsForAction(
              this.options2.handler.getMetaForAction(action.id)
            );
            return (
              <CommandPalletEntryWidget
                key={event.key}
                color="red"
                icon="i-cursor"
                primary={action.label}
                selected={event.selected}
                mouseEntered={event.mouseEntered}
                mouseClicked={event.mouseClicked}
              >
                {this.getShortcuts(shortcuts[0])}
              </CommandPalletEntryWidget>
            );
          }
        } as CMDPalletMonacoActionSearchEntry;
      })
    );
    return result;
  }

  async handleSelection(entry: CMDPalletMonacoActionSearchEntry, event: MousePosition) {
    await entry.action.run();
    return true;
  }
}
