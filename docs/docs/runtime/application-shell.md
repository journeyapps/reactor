---
title: Application shell
description: Brand Reactor, choose the root experience, and extend shared application chrome.
---

# Application shell

Reactor supplies the shared frame around installed [modules](../subsystems/modules-and-stores.md). Product modules can choose the root UI, branding, headers, favicons, shared toolbars, and settings-menu items without replacing [workspaces](../subsystems/workspaces-and-panels.md).

:::note Mental model
The shell owns application-wide chrome. Panels own feature content. Keep domain workflows out of the shell so they remain usable from workspaces, windows, command palettes, and mobile layouts.
:::

## Configure the shell

`UXStore` owns the product-level presentation choices:

```ts
register({ ioc }: ReactorModuleRegisterEvent) {
  const uxStore = ioc.get(UXStore);

  uxStore.primaryLogo = logo;
  uxStore.primaryHeader = {
    label: 'Todo workspace',
    action: () => {}
  };
  uxStore.setFavicons(lightIcon, darkIcon);
  uxStore.setRootComponent(TodoBodyWidget);
}
```

The root component normally composes Reactor's standard body and adds only application-specific framing. A focused application can replace more of the shell, while still using the same stores and layers underneath.

## Extend shared chrome

Modules can contribute:

- header and account menu items;
- settings-menu entries;
- top, left, or right toolbars;
- application-wide CSS fragments;
- theme fragments;
- primary and secondary product identity.

Run any cleanup callback returned by a registration when its module is removed.

:::tip Pro tip
Register each shell item from the module that provides the feature. This keeps the root application module from becoming a list of every product menu item.
:::

## Locking the application

`UXStore.lockReactor()` can prevent all interaction during a transition that must not be interrupted. To prevent one action from running, use its exclusive execution lock instead.

See [Actions and validation](../subsystems/actions-and-validation.md) for action locks and [Guided workflows](../advanced/guided-workflows.md) for multi-step guidance.

:::warning Common pitfall
A global lock is a strong instrument. Do not use it as a substitute for `PENDING`, `DISABLED`, or `BLOCKED` action validation.
:::

## Shell state versus feature state

Keep these concerns in `UXStore`:

- branding and favicons;
- application-level headers;
- shared toolbar registration;
- root composition;
- temporary application locking.

Keep these elsewhere:

- active domain selections in a domain store;
- feature commands in actions;
- panel-specific navigation in panel models;
- user choices in settings;
- progress in the Visor.

## Go deeper

<div className="doc-links">
  <a href="../subsystems/themes">Theme the application</a>
  <a href="../subsystems/workspaces-and-panels">Compose workspaces</a>
  <a href="./interaction-layers">Add temporary interaction</a>
  <a href="./responsive-applications">Adapt the runtime</a>
</div>
