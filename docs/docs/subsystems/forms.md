---
title: Forms
description: Model named inputs, validation, visibility, grouped values, and form rendering.
---

# Forms

Reactor forms are modeled objects rather than collections of unrelated React input state. `FormModel` coordinates named `FormInput` instances, while each input owns its current value, validation error, visibility, and standard Reactor rendering.

Forms embed [controls](./controls.md) when an existing Reactor interaction should become an input. Forms add field names, labels, descriptions, required state, validation, and submission values.

## Create a form model

```ts
type TodoValues = {
  name: string;
  enabled: boolean;
};

const form = new FormModel<TodoValues>();

form.addInput(
  new TextInput({
    name: 'name',
    label: 'Todo name',
    required: true
  })
);

form.addInput(
  new BooleanInput({
    name: 'enabled',
    label: 'Enabled',
    value: true
  })
);
```

Use `form.value()` for visible top-level values, `form.errors()` for the values of invalid visible fields, and `form.isValid()` before submission. `errors()` returns a map of field names to their current values, not error messages; an invalid group or collection appears under its top-level name. Read individual inputs’ `error` properties for messages. The model forwards value and error changes from its inputs:

```ts
form.registerListener({
  valueChanged: ({ input }) => {
    logger.debug('Form value changed', input.name, input.value);
  },
  errorsChanged: ({ input }) => {
    logger.debug('Form validation changed', input.name, input.error);
  }
});
```

## Input types

Reactor includes:

- `TextInput` and `TextAreaInput`
- `NumberInput`
- `BooleanInput`
- `DateInput`
- `SelectInput` and `MultiSelectInput`
- `EntityInput`
- `FileInput` and `ImageInput`
- `ArrayInput` and `ArraySetInput`
- `GroupInput`

`ControlInput` wraps an existing [control](./controls.md) when the form should reuse an application interaction. `EntityInput` resolves values through the entity definition's [search behavior](./entity-definitions/search.md).

## Values and validation

Every input has a `value` and optional error. Required inputs validate empty values automatically:

- Text and single-select inputs reject missing, empty, and whitespace-only values.
- Multi-select and array inputs require at least one item; keyed collections require at least one key.
- `false` and `0` count as supplied values.
- Optional numeric inputs allow an absent value, but supplied values must be finite and within inclusive `min` and `max` bounds.

Text validators run for nonblank initial values, value changes, and `update()` calls that change validation options. Return `true` to accept the value, a string for an error message, or `false` for the default message. Blank optional text skips the custom validator; blank required text reports `Required`.

```ts
new TextInput({
  name: 'tag',
  label: 'Todo tag',
  required: true,
  validator: (value) => /^[a-z0-9-]+$/.test(value) || 'Use lowercase letters, numbers, and hyphens'
});
```

Use `setValues()` to populate several fields and `getInput()` when one field depends on another. Keep cross-field behavior in the form owner or a dedicated form model rather than hiding it inside a React widget.

`input.valid` checks the field’s own error and any nested inputs. `input.isValid()` also accounts for visibility: hidden inputs do not block submission. `form.isValid()` uses this visibility-aware check recursively. Disabling an input does not exempt it from validation.

Visibility also participates in form output: hidden top-level inputs are not returned by `form.value()` or `form.errors()`. Group and collection values retain their nested shape, including hidden child values. Hiding a field does not erase its stored value or error.

Use `input.update({ visible: false })` or `input.update({ required: true })` to change options. The form emits `errorsChanged` for option changes and removal, and composite inputs forward nested validation changes. Consumers should recompute validity from the model; a composite can be invalid while its own `error` is null.

## Labels, hints, placeholders, and errors

`InputContainerWidget` provides the standard field shell. It renders the input label, description, tooltip, and validation message using the active Reactor theme and size.

Text and number inputs default their placeholder to the field label when no explicit placeholder is provided:

```ts
new TextInput({
  name: 'title',
  label: 'Todo title'
});
```

Single-select inputs display “Select a value” when options exist but no value is selected, and “(No values)” when no options exist.

Use `hideError` when a composite input renders the underlying validation message itself. Avoid rendering the same error in both the nested control and its containing field.

## Grouped and repeated values

`GroupInput` models a nested object. Collection inputs model repeated values. They remain normal `FormInput` instances, so their containing form receives value and error notifications.

Groups and collections are invalid when any visible child is invalid, even if the container itself is optional. Required collections also reject empty values. Collection rows render the standard input shell so each child can display its validation message.

Use grouped inputs when the nested values form one conceptual field. Use a separate `FormModel` when the nested section has its own lifecycle, submission, or ownership boundary.

## Rendering

For a standard vertical form:

```tsx
{
  form.render({ spacing: 10 });
}
```

For custom layouts, render individual inputs:

```tsx
<TwoColumnLayout>
  {form.getInput('name').renderInputWidget({ inline: false })}
  {form.getInput('enabled').renderInputWidget({ inline: false })}
</TwoColumnLayout>
```

The layout may change, but each `FormInput` should remain the source of value and validation state.

The Playground **Forms** panel includes a **Validation playground** and the full **Input catalog**. Start with **Fill valid example**, then clear the owner name, add an empty reference, remove all milestones, or turn on **Require approval**. Watch validity, live values, and the Submit button respond. The dialog example demonstrates the same checks on Save. Submissions stay in the panel and do not write to a server.

See `demo/module-playground/src/forms/ValidationDemoFormModel.ts` for the modeled example and `PlaygroundFormsPanelWidget.tsx` for subscriptions and rendering.

:::note[Mental model]
A form model owns named values and validation. The rendered fields read from that model.
:::

:::warning[Common pitfall]
Do not rebuild a `FormModel` on every React render. Reuse the same model until the form closes so it does not lose values, errors, or listeners.
:::

## Go deeper

<div className="doc-links">
  <a href="./controls">Embed controls</a>
  <a href="../runtime/interaction-layers">Form-backed dialogs</a>
  <a href="./ui-system">Responsive form rendering</a>
</div>
