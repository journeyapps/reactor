import { GuideStore } from './GuideStore';
import { observable } from 'mobx';
import { GuideStep } from './steps/GuideStep';
import {
  ComponentSelectorGenerator,
  generateReactorComponentSelections,
  ReactorComponentSelections
} from './selections/common';
import { inject } from '../../inversify.config';
import { System } from '../../core/System';
import { BaseObserver } from '@journeyapps/common-utils';

export interface GuideWorkflowListener {
  activated?: () => any;
  deActivated?: () => any;
  complete?: () => any;
}

export interface GuideWorkflowOptions {
  id: string;
  label: string;
  description: string;
}

export class GuideWorkflow<
  O extends GuideWorkflowOptions = GuideWorkflowOptions,
  E extends ReactorComponentSelections = ReactorComponentSelections,
  S extends any = any
> extends BaseObserver<GuideWorkflowListener> {
  @observable
  accessor ready: boolean;

  @observable
  private accessor _currentStep: number;

  @inject(System)
  accessor system: System;

  steps: GuideStep[];
  guideStore: GuideStore;
  options: O;
  state: Partial<S>;
  listener: any;

  constructor(options: O) {
    super();
    this.steps = [];
    this._currentStep = -1;
    this.options = options;
    this.ready = false;
  }

  currentStepIndex() {
    return this._currentStep;
  }

  currentStep() {
    return this.steps[this._currentStep] || null;
  }

  setGuideStore(store: GuideStore) {
    this.guideStore = store;
  }

  activate(step: number = 0, state: Partial<S> = {}) {
    this._currentStep = -1;
    this.ready = false;
    this.state = {
      ...state
    };
    this.activateStep(this.steps[step]);
    this.iterateListeners((l) => l.activated?.());
    this.ready = true;
  }

  getEventGenerators(): ComponentSelectorGenerator[] {
    return [generateReactorComponentSelections];
  }

  generateSelectionEvent(step: GuideStep): E {
    return this.getEventGenerators().reduce((acc, item) => {
      return {
        ...acc,
        ...item(step)
      };
    }, {}) as E;
  }

  protected end() {
    this.activateStep(null);
    this.iterateListeners((l) => l.deActivated?.());
    this.steps = [];
  }

  exit() {
    this.end();
  }

  complete() {
    this.iterateListeners((l) => l.complete?.());
    this.end();
  }

  setState(s: Partial<S>) {
    this.state = {
      ...this.state,
      ...s
    };
  }

  next(s: Partial<S> = {}) {
    this.state = {
      ...this.state,
      ...s
    };
    const nextStep = this.steps[this._currentStep + 1];
    if (!nextStep) {
      this.complete();
      return;
    }
    this.activateStep(nextStep);
  }

  canGoNext() {
    // if there is no resolver, we can go next
    return !this.currentStep()?.completed;
  }

  activateStep(step: GuideStep) {
    this.currentStep()?.deactivated();

    if (!step) {
      return;
    }
    this._currentStep = this.steps.indexOf(step);
    this.listener = step.registerListener({
      completed: () => {
        this.listener?.();
        this.listener = null;
        this.next();
      }
    });
    step.activated();
  }

  registerStep(step: GuideStep) {
    step.setWorkflow(this);
    this.steps.push(step);
  }
}
