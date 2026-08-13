import {
  CMDPalletSearchEngine,
  CMDPalletSearchEngineResult,
  CommandPalletSearchResultEntry
} from './CMDPalletSearchEngine';
import { PrefsStore } from '../stores/PrefsStore';
import { WorkspaceStore } from '../stores/workspace/WorkspaceStore';
import { BooleanSetting } from '../settings/BooleanSetting';
import { ioc } from '../inversify.config';
import { MousePosition } from '../layers/combo/SmartPositionWidget';
import { SettingsPanelModel } from '../panels/settings/SettingsPanelModel';
import * as _ from 'lodash';
import { CommandPalletEntryWidget } from '../layers/command-pallet/CommandPalletEntryWidget';
import * as React from 'react';
import styled from '@emotion/styled';
import { ThemeStore } from '../stores/themes/ThemeStore';
import { theme } from '../stores/themes/reactor-theme-fragment';
import { SearchEvent } from '@journeyapps/reactor-lib-search';

export interface CMDPalletPreferenceSearchEntry extends CommandPalletSearchResultEntry {
  preference: BooleanSetting;
}

namespace S {
  export const ControlAlignment = styled.div`
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;
    width: 100%;
  `;
}

export class CMDPalletPreferencesSearchEngine extends CMDPalletSearchEngine<CMDPalletPreferenceSearchEntry> {
  constructor(
    protected preferencesStore: PrefsStore,
    protected themeStore: ThemeStore
  ) {
    super({
      displayName: 'Preferences'
    });
  }

  doSearch(event: SearchEvent): CMDPalletSearchEngineResult<CMDPalletPreferenceSearchEntry> {
    const result = new CMDPalletSearchEngineResult<CMDPalletPreferenceSearchEntry>(this);
    result.setValues(
      _.filter(this.preferencesStore.getInteractiveControls(), (control) => {
        return !!event.matches(control.options.name);
      })
        // only show boolean controls because of toggles
        .filter((c) => c instanceof BooleanSetting)
        .map((control: BooleanSetting) => {
          return {
            key: `preference-${control.options.key}`,
            preference: control,
            engine: this,
            immediatelyClose: false,
            getWidget: (event) => {
              return (
                <CommandPalletEntryWidget
                  forwardRef={event.ref}
                  color={this.themeStore.getCurrentTheme(theme).light ? 'rgb(0,192,255)' : 'cyan'}
                  icon="cogs"
                  primary={control.options.name}
                  selected={event.selected}
                  key={event.key}
                  mouseEntered={event.mouseEntered}
                  mouseClicked={event.mouseClicked}
                >
                  <S.ControlAlignment>{control.generateControl()}</S.ControlAlignment>
                </CommandPalletEntryWidget>
              );
            }
          } as CMDPalletPreferenceSearchEntry;
        })
    );
    return result;
  }

  async handleEnter(entry: CMDPalletPreferenceSearchEntry): Promise<boolean> {
    entry.preference.toggle();
    return false;
  }

  async handleSelection(entry: CMDPalletPreferenceSearchEntry, event: MousePosition) {
    ioc.get(WorkspaceStore).addModel(new SettingsPanelModel());
    return true;
  }
}
