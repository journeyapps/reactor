import { ComponentSelection, GuideStep, GuideWorkflow, ReactorComponentType } from '@journeyapps/reactor-mod';

export const PLAYGROUND_GUIDE_ID = 'playground.sandbox-guide';
export const PLAYGROUND_GUIDE_PANEL_TYPE = 'playground.guide';

export const PLAYGROUND_GUIDE_TARGETS = {
  create: 'Create sandbox',
  validate: 'Enable live validation',
  preview: 'Run preview',
  apply: 'Apply changes'
} as const;

export type PlaygroundGuideTarget = (typeof PLAYGROUND_GUIDE_TARGETS)[keyof typeof PLAYGROUND_GUIDE_TARGETS];

export class PlaygroundGuideWorkflow extends GuideWorkflow {
  constructor() {
    super({
      id: PLAYGROUND_GUIDE_ID,
      label: 'Build a sandbox',
      description: 'A four-step GuideStore workflow running inside a single playground workspace.'
    });
    this.setupSteps();
  }

  activate(step: number = 0, state: Record<string, never> = {}) {
    // GuideWorkflow clears completed steps. Rebuild them so the playground guide
    // can be run repeatedly without reloading the demo.
    if (this.steps.length === 0) {
      this.setupSteps();
    }
    super.activate(step, state);
  }

  exit() {
    super.exit();
    this.listener?.();
    this.listener = null;
  }

  private setupSteps() {
    this.registerButtonStep(
      PLAYGROUND_GUIDE_TARGETS.create,
      'Click **Create sandbox** to initialize the example workspace.'
    );

    this.registerStep(
      new GuideStep({
        label: 'Enable validation',
        desc: 'Turn on **live validation** so the sandbox can check changes before previewing them.',
        activated: (step) => {
          step
            .register(
              new ComponentSelection({
                type: ReactorComponentType.CHECKBOX,
                identifier: {
                  panel: PLAYGROUND_GUIDE_PANEL_TYPE,
                  label: PLAYGROUND_GUIDE_TARGETS.validate
                }
              })
            )
            .showTooltip(step.generateTooltip());
        }
      })
    );

    this.registerButtonStep(
      PLAYGROUND_GUIDE_TARGETS.preview,
      'Run the **preview** to verify the sandbox with live validation enabled.'
    );

    this.registerButtonStep(
      PLAYGROUND_GUIDE_TARGETS.apply,
      'Everything looks good. Click **Apply changes** to complete the guide.'
    );
  }

  private registerButtonStep(label: PlaygroundGuideTarget, desc: string) {
    this.registerStep(
      new GuideStep({
        label,
        desc,
        activated: (step) => {
          step
            .select()
            .btn({
              panel: PLAYGROUND_GUIDE_PANEL_TYPE,
              label
            })
            .showTooltip(step.generateTooltip());
        }
      })
    );
  }
}
