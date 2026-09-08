import { ComponentSelection, TooltipObjectDirective } from '../selections/ComponentSelection';
import { GuideWorkflow, GuideWorkflowOptions } from '../GuideWorkflow';
import { ReactorComponentSelections } from '../selections/common';
import { StepTooltipWidget } from '../../../widgets/guide/StepTooltipWidget';
import * as React from 'react';
import { BaseObserver } from '@journeyapps/common-utils';

export interface GuideStepOptions<E extends ReactorComponentSelections = ReactorComponentSelections> {
  label: string;
  desc?: string;
  activated: (step: GuideStep<E>) => (() => any) | void;
}

export interface GuideStepListener {
  completed: () => any;
}

export class GuideStep<
  E extends ReactorComponentSelections = ReactorComponentSelections,
  O extends GuideStepOptions<E> = GuideStepOptions<E>
> extends BaseObserver<GuideStepListener> {
  options: O;
  loadedSelections: ComponentSelection[];
  workflow: GuideWorkflow<GuideWorkflowOptions, E>;
  completed: boolean;
  resolver: () => any;

  constructor(options: O) {
    super();
    this.options = {
      ...options,
      desc: options.desc || options.label
    };
    this.loadedSelections = [];
  }

  getIndexNumber() {
    return this.workflow.steps.indexOf(this) + 1;
  }

  register<T extends ComponentSelection>(c: T): T {
    this.loadedSelections.push(c);
    this.workflow.guideStore.select(c);
    return c;
  }

  select() {
    return this.workflow.generateSelectionEvent(this);
  }

  generateTooltip(): TooltipObjectDirective {
    return {
      gen: () => {
        return <StepTooltipWidget step={this} />;
      },
      hint: null
    };
  }

  setWorkflow(workflow: GuideWorkflow<GuideWorkflowOptions, E>) {
    this.workflow = workflow;
  }

  complete() {
    this.completed = true;
    this.iterateListeners((cb) => cb.completed?.());
  }

  deactivated() {
    this.loadedSelections.forEach((f) => {
      f.dispose();
    });
    this.loadedSelections = [];
    this.resolver?.();
  }

  activated() {
    this.completed = false;
    this.resolver = this.options.activated(this) || null;
  }
}
