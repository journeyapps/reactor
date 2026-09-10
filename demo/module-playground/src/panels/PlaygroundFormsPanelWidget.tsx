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
import { ValidationDemoFormModel } from '../forms/ValidationDemoFormModel';
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

  const [catalogRevision, setCatalogRevision] = React.useState(0);
  const resetInlineForm = () => {
    setCatalogRevision((value) => value + 1);
    setInlineForm(new DemoFormModel());
  };

  return (
    <S.Container>
      <ValidationShowcase />
      <CardWidget
        title="Input catalog"
        subHeading="Inline preview with modeled form input types"
        sections={[
          {
            key: 'form-preview',
            content: () => {
              return <S.FormContainer key={catalogRevision}>{inlineForm.render()}</S.FormContainer>;
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

const ValidationShowcase: React.FC = () => {
  const [form, setForm] = React.useState(() => new ValidationDemoFormModel());
  const [revision, setRevision] = React.useState(0);
  const [, refresh] = React.useReducer((value: number) => value + 1, 0);
  const [submitted, setSubmitted] = React.useState<string>(null);
  React.useEffect(() => form.registerListener({ valueChanged: refresh, errorsChanged: refresh }), [form]);
  const invalidFields = Object.keys(form.errors());

  return (
    <CardWidget
      title="Validation playground"
      subHeading="Explore required values, conditional fields, and nested validation. Nothing is saved to a server."
      sections={[
        {
          key: 'actions',
          content: () => (
            <S.Buttons>
              <PanelButtonWidget label="Fill valid example" icon="magic" action={() => form.fillValidExample()} />
              <PanelButtonWidget
                label="Reset example"
                icon="redo"
                action={() => {
                  setForm(new ValidationDemoFormModel());
                  setRevision((value) => value + 1);
                  setSubmitted(null);
                }}
              />
              <PanelButtonWidget
                label="Try validation in a dialog"
                icon="window-maximize"
                action={() => {
                  const dialogForm = new ValidationDemoFormModel();
                  dialogForm.fillValidExample();
                  return ioc.get(DialogStore2).showDialog(
                    new FormDialogDirective({
                      title: 'Validation playground',
                      form: dialogForm,
                      handler: async (model) => {
                        setSubmitted(JSON.stringify(model.value(), null, 2));
                      }
                    })
                  );
                }}
              />
            </S.Buttons>
          )
        },
        { key: 'fields', content: () => <S.FormContainer key={revision}>{form.render()}</S.FormContainer> },
        {
          key: 'state',
          content: () => (
            <S.State>
              <div role="status">
                <strong>{form.isValid() ? 'Ready to submit' : 'Needs attention'}</strong>
                {invalidFields.length > 0 && <p>Invalid fields: {invalidFields.join(', ')}</p>}
              </div>
              <PanelButtonWidget
                label="Submit example"
                icon="check"
                mode={PanelButtonMode.PRIMARY}
                disabled={!form.isValid()}
                action={() => {
                  if (form.isValid()) setSubmitted(JSON.stringify(form.value(), null, 2));
                }}
              />
              <details open>
                <summary>Live form values</summary>
                <S.Json>{JSON.stringify(form.value(), null, 2)}</S.Json>
              </details>
              {submitted != null && (
                <details open>
                  <summary>Last submitted values</summary>
                  <S.Json>{submitted}</S.Json>
                </details>
              )}
            </S.State>
          )
        }
      ]}
    />
  );
};

namespace S {
  export const State = styled.div`
    color: ${(p) => p.theme.text.primary};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  `;

  export const Json = styled.pre`
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    margin: 8px 0 0;
    font-size: 12px;
  `;

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
