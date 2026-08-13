---
sidebar_position: 1
title: Meet Reactor
description: Build stateful web applications that behave like serious installed software.
hide_title: true
---

<div className="capability-hero">
  <div className="capability-hero__eyebrow">Application framework</div>
  <h1>Build ambitious interfaces.</h1>
  <p>
    Reactor allows you to build increadibly ambitious UI software in a fast, scalable and highly declarative way. Much like its name, the more you throw at Reactor,
the more powerful it gets.
  </p>
</div>

Reactor is an application framework designed for web software that behaves more like an IDE or desktop application rather than a collection of routed pages. It powers large development and administration systems, but also works well for focused tools such as data browsers.

Instead of independently assembling routing, commands, panels, persistence, settings, search, keyboard behavior, and mobile adaptations, a Reactor application installs **modules** into a shared runtime.

:::note Mental model
Think of Reactor as an application operating system. Modules add features, stores provide state and services, and Reactor supplies the common UI.
:::

## What you get

<div className="capability-grid">
  <a className="capability-card" href="../subsystems/actions-and-validation">
    <strong>One action, many places</strong>
    <span>Define an action once, then use it in buttons, menus, shortcuts, command palettes, and guides.</span>
  </a>
  <a className="capability-card" href="../subsystems/entity-definitions">
    <strong>UI that understands your data</strong>
    <span>Teach Reactor how to display, find, open, and save references to your objects.</span>
  </a>
  <a className="capability-card" href="../subsystems/workspaces-and-panels">
    <strong>Application workspaces</strong>
    <span>Compose tabs, trays, splits, floating windows, groups, and persistent layouts without coupling features to placement.</span>
  </a>
  <a className="capability-card" href="../advanced/guided-workflows">
    <strong>Guided workflows</strong>
    <span>Coordinate real multi-step work across actions, dialogs, panels, and selected interface elements.</span>
  </a>
  <a className="capability-card" href="../runtime/operational-feedback">
    <strong>Progress and status</strong>
    <span>Give long-running work, application status, errors, and recovery a consistent place in the interface.</span>
  </a>
  <a className="capability-card" href="../runtime/responsive-applications">
    <strong>Desktop and mobile</strong>
    <span>Keep dense desktop workflows while Reactor adapts placement and interaction for smaller viewports.</span>
  </a>
</div>

## The main building blocks

Reactor is more than a component catalog. Its main building blocks are:

- **Modules** install application behavior during a defined boot lifecycle.
- **Stores** own observable state, services, asynchronous readiness, and persistence.
- **Actions** keep an operation, its validation, parameters, and progress together.
- **Entity definitions** tell Reactor how to display, find, open, and save references to your objects.
- **Controls and forms** project behavior and values into consistent interactions.
- **Workspaces and panels** separate a feature's renderable state from application layout policy.
- **Runtime services** provide dialogs, notifications, shortcuts, guides, media, and responsive behavior.

These pieces work together. A command can ask an entity definition to find a todo, validate it, open a panel in the current workspace, and show progress in the Visor.

:::tip Pro tip
Put the operation in an action and the display rules in an entity definition. Reactor can then reuse them across the application.
:::

## Choose your path

- **New to the repository?** Follow [Local development](./local-development.md), then [explore the sandbox](./exploring-the-sandbox.md).
- **Using an application built with Reactor?** Start with [Getting around a Reactor application](../using-reactor/getting-around.md).
- **Ready to build?** [Build your first module](./first-module.md).
- **Evaluating the architecture?** Read [How Reactor fits together](./architecture.md).
- **Looking for a feature?** Use the Manual sidebar or start with [Application model](../subsystems/application-model.md).
- **Need an exact signature?** Use the generated API reference after reading the relevant manual page.

## Living reference applications

This repository contains two main examples:

- `demo/module-todos` is a small domain module with actions, entity definitions, nested entities, search, panels, workspace groups, persistence, dialogs, and Visor metadata.
- `demo/module-playground` is an interactive catalog of controls, forms, cards, surfaces, trees, tables, dialogs, overlays, drag-and-drop, and guided workflows.

The manual uses those examples as its source of truth. Product-specific policy belongs in product modules and case studies, not in Reactor's core explanations.

:::warning Scope
Reactor has many abstractions because it is built for applications with lots of state and connected features. A small routed website may not need it.
:::
