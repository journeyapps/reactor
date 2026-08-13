import * as React from 'react';
import { observer } from 'mobx-react';
import {
  CardWidget,
  CheckboxLabelWidget,
  GuideStore,
  PanelButtonMode,
  PanelButtonWidget,
  PillWidget,
  ReactorPanelModel,
  ioc,
  styled,
  useTheme
} from '@journeyapps/reactor-mod';
import {
  PLAYGROUND_GUIDE_ID,
  PLAYGROUND_GUIDE_TARGETS,
  PlaygroundGuideTarget,
  PlaygroundGuideWorkflow
} from '../guides/PlaygroundGuideWorkflow';

export interface PlaygroundGuidePanelWidgetProps {
  model: ReactorPanelModel;
}

interface SandboxState {
  created: boolean;
  validationEnabled: boolean;
  previewed: boolean;
  applied: boolean;
}

const INITIAL_SANDBOX_STATE: SandboxState = {
  created: false,
  validationEnabled: false,
  previewed: false,
  applied: false
};

interface SandboxStageCardProps {
  number: number;
  title: string;
  description: string;
  complete: boolean;
  children: React.ReactNode;
}

const SandboxStageCard: React.FC<SandboxStageCardProps> = (props) => {
  return (
    <CardWidget
      title={
        <S.StageHeading>
          <S.StageNumber $complete={props.complete}>{props.number}</S.StageNumber>
          <S.StageTitle>{props.title}</S.StageTitle>
        </S.StageHeading>
      }
      subHeading={props.description}
      sections={[
        {
          key: 'stage-control',
          grow: false,
          content: () => <S.StageControl>{props.children}</S.StageControl>
        }
      ]}
    />
  );
};

export const PlaygroundGuidePanelWidget: React.FC<PlaygroundGuidePanelWidgetProps> = observer(() => {
  const guideStore = ioc.get(GuideStore);
  const theme = useTheme();
  const guide = guideStore.guideWorkflows.find(
    (candidate) => candidate.options.id === PLAYGROUND_GUIDE_ID
  ) as PlaygroundGuideWorkflow;
  const [sandbox, setSandbox] = React.useState<SandboxState>(INITIAL_SANDBOX_STATE);

  const currentGuide = guideStore.getCurrentGuide();
  const guideActive = currentGuide?.options.id === PLAYGROUND_GUIDE_ID;
  const currentStep = guideActive ? currentGuide.currentStepIndex() + 1 : 0;

  const completeTarget = (target: PlaygroundGuideTarget) => {
    if (!guideActive) {
      return;
    }

    const step = currentGuide.currentStep();
    const targetIsActive = step?.loadedSelections.some((selection) => selection.options.identifier?.label === target);
    if (targetIsActive) {
      step.complete();
    }
  };

  const startGuide = () => {
    if (guideActive) {
      currentGuide.exit();
    }
    setSandbox(INITIAL_SANDBOX_STATE);
    guide.activate();
  };

  return (
    <S.Container>
      <CardWidget
        title="GuideStore workflow"
        subHeading="A four-step guide targeting components inside this sandbox workspace"
        sections={[
          {
            key: 'guide-controls',
            content: () => (
              <S.Intro>
                <S.Copy>
                  Start the guide, then interact with each highlighted control. Every step is a real{' '}
                  <S.Code>GuideStep</S.Code> selection resolved through the shared <S.Code>GuideStore</S.Code>.
                </S.Copy>
                <S.GuideControls>
                  <PanelButtonWidget
                    icon={guideActive ? 'redo' : 'play'}
                    label={guideActive ? 'Restart guide' : sandbox.applied ? 'Run guide again' : 'Start guide'}
                    mode={PanelButtonMode.PRIMARY}
                    action={startGuide}
                  />
                  <S.Progress $active={guideActive}>
                    {guideActive ? `Step ${currentStep} of 4` : sandbox.applied ? 'Guide complete' : 'Not started'}
                  </S.Progress>
                </S.GuideControls>
              </S.Intro>
            )
          }
        ]}
      />

      <CardWidget
        title="Release candidate"
        subHeading="Sandbox workspace"
        sections={[
          {
            key: 'sandbox-status',
            grow: false,
            content: () => (
              <PillWidget
                label="Status"
                color={sandbox.applied ? theme.status.success : theme.status.loading}
                meta={{
                  icon: sandbox.applied ? 'check-circle' : sandbox.previewed ? 'eye' : 'flask',
                  label: sandbox.applied ? 'Applied' : sandbox.previewed ? 'Preview ready' : 'Draft'
                }}
              />
            )
          },
          {
            key: 'sandbox-stages',
            content: () => (
              <S.Stages>
                <SandboxStageCard
                  number={1}
                  title="Create the environment"
                  description="Initialize the isolated workspace used by the remaining steps."
                  complete={sandbox.created}
                >
                  <PanelButtonWidget
                    label={PLAYGROUND_GUIDE_TARGETS.create}
                    icon={sandbox.created ? 'check' : 'plus'}
                    disabled={sandbox.created}
                    action={() => {
                      setSandbox((state) => ({ ...state, created: true }));
                      completeTarget(PLAYGROUND_GUIDE_TARGETS.create);
                    }}
                  />
                </SandboxStageCard>

                <SandboxStageCard
                  number={2}
                  title="Configure checks"
                  description="Validate changes continuously before generating a preview."
                  complete={sandbox.validationEnabled}
                >
                  <CheckboxLabelWidget
                    label={PLAYGROUND_GUIDE_TARGETS.validate}
                    checked={sandbox.validationEnabled}
                    disabled={!sandbox.created}
                    onChange={(checked) => {
                      setSandbox((state) => ({ ...state, validationEnabled: checked }));
                      if (checked) {
                        completeTarget(PLAYGROUND_GUIDE_TARGETS.validate);
                      }
                    }}
                  />
                </SandboxStageCard>

                <SandboxStageCard
                  number={3}
                  title="Verify the result"
                  description="Build a preview using the current sandbox configuration."
                  complete={sandbox.previewed}
                >
                  <PanelButtonWidget
                    label={PLAYGROUND_GUIDE_TARGETS.preview}
                    icon={sandbox.previewed ? 'check' : 'eye'}
                    disabled={!sandbox.validationEnabled || sandbox.previewed}
                    action={() => {
                      setSandbox((state) => ({ ...state, previewed: true }));
                      completeTarget(PLAYGROUND_GUIDE_TARGETS.preview);
                    }}
                  />
                </SandboxStageCard>

                <SandboxStageCard
                  number={4}
                  title="Apply the sandbox"
                  description="Commit the verified configuration and complete the workflow."
                  complete={sandbox.applied}
                >
                  <PanelButtonWidget
                    label={PLAYGROUND_GUIDE_TARGETS.apply}
                    icon={sandbox.applied ? 'check' : 'rocket'}
                    mode={PanelButtonMode.PRIMARY}
                    disabled={!sandbox.previewed || sandbox.applied}
                    action={() => {
                      setSandbox((state) => ({ ...state, applied: true }));
                      completeTarget(PLAYGROUND_GUIDE_TARGETS.apply);
                    }}
                  />
                </SandboxStageCard>
              </S.Stages>
            )
          }
        ]}
      />
    </S.Container>
  );
});

namespace S {
  export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 12px;
  `;

  export const Intro = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  `;

  export const Copy = styled.div`
    min-width: 240px;
    flex: 1;
    color: ${(p) => p.theme.text.secondary};
    font-size: 13px;
    line-height: 1.5;
  `;

  export const Code = styled.code`
    color: ${(p) => p.theme.guide.accent};
  `;

  export const GuideControls = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  export const Progress = styled.div<{ $active: boolean }>`
    color: ${(p) => (p.$active ? p.theme.guide.accent : p.theme.text.secondary)};
    font-size: 13px;
    white-space: nowrap;
  `;

  export const Stages = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  `;

  export const StageNumber = styled.div<{ $complete: boolean }>`
    display: flex;
    width: 26px;
    height: 26px;
    align-items: center;
    justify-content: center;
    border: solid 1px ${(p) => (p.$complete ? p.theme.status.success : p.theme.surfaces.depth2Border)};
    border-radius: 50%;
    background: ${(p) => p.theme.surfaces.depth1Background};
    color: ${(p) => (p.$complete ? p.theme.status.success : p.theme.text.secondary)};
    font-size: 12px;
    font-weight: 600;
  `;

  export const StageHeading = styled.div`
    display: flex;
    align-items: center;
    gap: 9px;
  `;

  export const StageTitle = styled.div`
    color: ${(p) => p.theme.text.primary};
    font-size: 14px;
    font-weight: 600;
  `;

  export const StageControl = styled.div`
    display: flex;
    min-height: 34px;
    align-items: center;
  `;
}
