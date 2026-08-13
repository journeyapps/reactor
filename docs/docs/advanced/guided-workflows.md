---
title: Guided workflows
description: Build multi-step guidance around real application behavior.
---

# Guided workflows

Reactor guides can walk a user through real work. A guide can find [controls](../subsystems/controls.md), focus attention, wait for [actions](../subsystems/actions-and-validation.md) or store events, pass typed values between steps, and clean up listeners and locks.

:::note Mental model
A guide should observe the application's real actions and controls, not implement a second version of the task.
:::

## Define a workflow

The Playground includes a complete four-step example:

```ts
export class PlaygroundGuideWorkflow extends GuideWorkflow {
  constructor() {
    super({
      id: 'playground.sandbox-guide',
      label: 'Build a sandbox',
      description: 'A four-step workflow inside the playground.'
    });

    this.registerStep(
      new GuideStep({
        label: 'Create the sandbox',
        activated: (step) => {
          step.select().btn({ panel: 'playground.guide', label: 'Create sandbox' }).showTooltip(step.generateTooltip());
        }
      })
    );
  }
}
```

Register the workflow with `GuideStore` during module registration:

```ts
ioc.get(GuideStore).registerGuideWorkflow(new PlaygroundGuideWorkflow());
```

Run Reactor Playground and open the **Guide** panel to see the workflow target actual controls.

## Find a control

A selection describes a Reactor control rather than holding a DOM node:

- component type;
- panel factory type;
- visible label or other identifier;
- optional data defined by the application.

Visible Reactor components register themselves with `GuideStore`. A guide selection can therefore be pending before its target is mounted and resolve after the user opens the correct workspace or panel.

:::note Hidden complexity
Guide tooltips render through the anchored-overlay system. They remain attached as the selected component moves or resizes, and selections are disposed automatically when a step deactivates.
:::

## Complete from real behavior

For a simple step, complete it when the selected control is used. For richer workflows, listen to the action or store that proves the work finished:

```ts
activated: (step) => {
  step.select().btn({ label: createAction.options.name }).showTooltip(step.generateTooltip());

  const removeListener = createAction.registerListener({
    didFire: () => step.complete()
  });
  const releaseLock = createAction.getExclusiveExecutionLock();

  return () => {
    removeListener();
    releaseLock();
  };
};
```

The cleanup callback runs when the step deactivates.

:::tip Pro tip
Complete a step when the application outcome occurs, not merely when the highlighted element receives a click. The action may be canceled, fail validation, or open another parameter interaction first.
:::

## Workflow state

`GuideWorkflow` accepts a typed state parameter. Use `setState()` or pass state to `next()` when later steps need values produced earlier.

Keep application data in stores. Workflow state should contain only the temporary values needed by later guide steps.

## Informative and resolver steps

Use:

- `GuideStep` for an interactive target or custom activation;
- `InformativeGuideStep` for explanation that the user acknowledges;
- `ResolverGuideStep` when completion depends on a promise or external condition.

Applications can add their own target types to the selection generator while keeping Reactor's cleanup and overlay behavior.

## Responsible guidance

Guides can constrain interaction, so design them as a safety system:

- always provide a clear exit;
- release listeners and locks during cleanup;
- tolerate a target that is not mounted yet;
- avoid changing domain state merely to make a step visible;
- restart safely after partial completion;
- do not conceal errors behind the guide layer.

:::warning Common pitfall
Do not identify targets with CSS selectors. Use a Reactor component selection so markup changes do not silently break the guide.
:::

## Go deeper

<div className="doc-links">
  <a href="../runtime/interaction-layers">Layers and anchored overlays</a>
  <a href="../subsystems/actions-and-validation">Action lifecycle and locks</a>
  <a href="../getting-started/exploring-the-sandbox">Explore the live guide</a>
</div>
