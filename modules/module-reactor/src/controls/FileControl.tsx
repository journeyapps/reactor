import { RepresentAsComboBoxItemsEvent } from './AbstractControl';
import { ComboBoxItem } from '../stores/combo/ComboBoxDirectives';
import { PanelButtonMode, PanelButtonWidget } from '../widgets/forms/PanelButtonWidget';
import * as React from 'react';
import { useEffect } from 'react';
import { useForceUpdate } from '../hooks/useForceUpdate';
import { inject } from '../inversify.config';
import { Btn } from '../definitions/common';
import { ThemeStore } from '../stores/themes/ThemeStore';
import { selectFile } from '@journeyapps/reactor-lib-utils';
import styled from '@emotion/styled';
import { AbstractValueControl } from './AbstractValueControl';

export class FileControl extends AbstractValueControl<File> {
  @inject(ThemeStore)
  accessor themeStore: ThemeStore;

  representAsComboBoxItems(options: RepresentAsComboBoxItemsEvent = {}): ComboBoxItem[] {
    return [];
  }

  representAsControl(): React.JSX.Element {
    return <FileControlWidget control={this} />;
  }

  representAsBtn(): Btn {
    return {
      action: async () => {
        this.value = await selectFile({ single: true });
      }
    };
  }
}

export interface FileControlWidgetProps {
  control: FileControl;
}

export const FileControlWidget: React.FC<FileControlWidgetProps> = (props) => {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    return props.control.registerListener({
      valueChanged: () => {
        forceUpdate();
      }
    });
  }, []);

  return (
    <S.Buttons>
      <PanelButtonWidget
        icon="file"
        label={props.control.value?.name || 'Select file'}
        action={async () => {
          props.control.value = await selectFile({ single: true });
        }}
      />
      {props.control.value ? (
        <PanelButtonWidget
          icon="times"
          mode={PanelButtonMode.LINK}
          action={() => {
            props.control.value = null;
          }}
        />
      ) : null}
    </S.Buttons>
  );
};

namespace S {
  export const Buttons = styled.div`
    display: flex;
    align-items: center;
  `;
}
