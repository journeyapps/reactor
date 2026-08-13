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

Use `form.value()` for visible values, `form.errors()` for invalid fields, and `form.isValid()` before submission. The model forwards value and error changes from its inputs:

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

Every input has a `value` and optional error. Required inputs validate empty values automatically; specialized inputs can add their own validator.

```ts
new TextInput({
  name: 'tag',
  label: 'Todo tag',
  required: true,
  validator: (value) => /^[a-z0-9-]+$/.test(value) || 'Use lowercase letters, numbers, and hyphens'
});
```

Use `setValues()` to populate several fields and `getInput()` when one field depends on another. Keep cross-field behavior in the form owner or a dedicated form model rather than hiding it inside a React widget.

Visibility participates in form output: hidden inputs are not returned by `form.value()`. Disabled inputs remain part of the model unless the application explicitly hides or removes them.

## Labels, hints, placeholders, and errors

`InputContainerWidget` provides the standard field shell. It renders the input label, description, tooltip, required state, and validation message using the active Reactor theme and size.

Text and number inputs default their placeholder to the field label when no explicit placeholder is provided:

```ts
new TextInput({
  name: 'title',
  label: 'Todo title'
});
```

Use `hideError` when a composite input renders the underlying validation message itself. Avoid rendering the same error in both the nested control and its containing field.

## Grouped and repeated values

`GroupInput` models a nested object. Collection inputs model repeated values. They remain normal `FormInput` instances, so their containing form receives value and error notifications.

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

The Playground **Forms** panel demonstrates modeled inputs, grouped fields, errors, default placeholders, and responsive sizing.

:::note Mental model
A form model owns named values and validation. The rendered fields read from that model.
:::

:::warning Common pitfall
Do not rebuild a `FormModel` on every React render. Reuse the same model until the form closes so it does not lose values, errors, or listeners.
:::

## Go deeper

<div className="doc-links">
  <a href="./controls">Embed controls</a>
  <a href="../runtime/interaction-layers">Form-backed dialogs</a>
  <a href="./ui-system">Responsive form rendering</a>
</div>
