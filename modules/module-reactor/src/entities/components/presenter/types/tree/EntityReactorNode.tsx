import { CoreTreeWidgetProps } from '../../../../../widgets/core-tree/CoreTreeWidget';
import { ReactorTreeNode } from '../../../../../widgets/core-tree/reactor-tree/ReactorTreeNode';
import * as React from 'react';
import { EntityDefinition } from '../../../../EntityDefinition';
import { ReactorEntityDnDWrapper } from './widgets/ReactorEntityDnDWrapperWidget';
import { SelectEntityListener } from '../../EntityPresenterComponent';
import { ReactorEntityWrapperWidget } from './widgets/ReactorEntityWrapperWidget';
import { AbstractEntityTreePresenterContext } from './presenter-contexts/AbstractEntityTreePresenterContext';
import { EntityTreePresenterComponent } from './EntityTreePresenterComponent';
import { System } from '../../../../../core/System';
import { inject } from '../../../../../inversify.config';
import { BaseObserverInterface } from '@journeyapps/common-utils';
import { AbstractDescendentContext } from './descendent/AbstractDescendentContext';
import { RenderTreeChild } from '../../../../../widgets/core-tree/reactor-tree/widgets/useTreeChildren';

export interface EntityReactorNodeOptions<E extends any = any> {
  definition: EntityDefinition;
  entity: E;
  events?: BaseObserverInterface<SelectEntityListener<E>>;
}

export class EntityReactorNode<E extends any = any> extends ReactorTreeNode {
  @inject(System)
  accessor system: System;

  descendants: Set<AbstractDescendentContext<E>>;
  context: AbstractEntityTreePresenterContext;

  constructor(protected options2: EntityReactorNodeOptions<E>) {
    super({
      key: options2.definition.getEntityUID(options2.entity),
      match: (event) => {
        return event.matches(options2.definition.describeEntity(options2.entity).simpleName);
      }
    });
    this.descendants = new Set();
  }

  activate() {
    this.descendants.forEach((d) => {
      d.activate();
    });
  }

  deactivate() {
    this.descendants.forEach((d) => {
      d.deactivate();
    });
  }

  setAttached(attached: boolean): any {
    super.setAttached(attached);
    if (attached) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  attachDescendents() {
    this.options2.definition.getExposers().forEach((e) => {
      const presenter = this.system
        .getDefinition(e.descendantType)
        .getPresenters()
        .find((p) => p instanceof EntityTreePresenterComponent) as EntityTreePresenterComponent<any>;
      if (!presenter) {
        return;
      }
      this.descendants.add(
        this.context.generateDescendentContext({
          presenter,
          rootContext: this.context,
          descendant: e,
          node: this
        })
      );
    });
    this.deserialize(this.context.state.trees);
  }

  setRootPresenterContext(context: AbstractEntityTreePresenterContext) {
    this.context = context;
    if (this.descendants.size === 0) {
      this.attachDescendents();
    }
  }

  get entity() {
    return this.options2.entity;
  }

  renderWidget(event: CoreTreeWidgetProps, renderChild: RenderTreeChild): React.JSX.Element {
    return (
      <ReactorEntityDnDWrapper definition={this.options2.definition} node={this} entity={this.options2.entity}>
        {(ref) => {
          return (
            <ReactorEntityWrapperWidget forwardRef={ref} node={this} options={this.options2}>
              {super.renderWidget(
                {
                  ...event,
                  forwardRef: ref
                },
                renderChild
              )}
            </ReactorEntityWrapperWidget>
          );
        }}
      </ReactorEntityDnDWrapper>
    );
  }
}
