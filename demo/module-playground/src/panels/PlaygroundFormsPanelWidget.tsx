import * as React from 'react';
import { observer } from 'mobx-react';
import {
  CardWidget,
  DialogStore2,
  FormDialogDirective,
  PanelButtonMode,
  PanelButtonWidget,
  ReactorPanelModel,
  ioc,
  styled
} from '@journeyapps/reactor-mod';
import { DemoFormModel } from '../forms/DemoFormModel';
import { PlaygroundStore } from '../stores/PlaygroundStore';

export interface PlaygroundFormsPanelWidgetProps {
  model: ReactorPanelModel;
}

export const PlaygroundFormsPanelWidget: React.FC<PlaygroundFormsPanelWidgetProps> = observer(() => {
  const dialogStore2 = ioc.get(DialogStore2);
  const logger = ioc.get(PlaygroundStore).logger.childLogger('Forms');
  const [inlineForm, setInlineForm] = React.useState(() => new DemoFormModel());

  const runFormDialog = async () => {
    const directive = new FormDialogDirective({
      title: 'Demo form dialog',
      form: new DemoFormModel(),
      handler: async (form) => logger.info('Demo form submitted', form.value())
    });

    await dialogStore2.showDialog(directive);
  };

  const resetInlineForm = () => {
    setInlineForm(new DemoFormModel());
  };

  return (
    <S.Container>
      <CardWidget
        title="Forms"
        subHeading="Inline preview with modeled form input types"
        sections={[
          {
            key: 'form-preview',
            content: () => {
              return <S.FormContainer>{inlineForm.render()}</S.FormContainer>;
            }
          },
          {
            key: 'form-actions',
            content: () => {
              return (
                <S.Buttons>
                  <PanelButtonWidget
                    label="Open form in dialog"
                    icon="window-maximize"
                    action={runFormDialog}
                    mode={PanelButtonMode.PRIMARY}
                  />
                  <PanelButtonWidget label="Reset inline form" icon="redo" action={resetInlineForm} />
                </S.Buttons>
              );
            }
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

  export const Buttons = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `;

  export const FormContainer = styled.div`
    min-height: 140px;
  `;
}
