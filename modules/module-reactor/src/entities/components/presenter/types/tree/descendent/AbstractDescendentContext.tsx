import { TreeNode } from '@journeyapps/common-tree';
import { EntityReactorNode } from '../EntityReactorNode';
import { ReactorTreeEntity } from '../../../../../../widgets/core-tree/reactor-tree/reactor-tree-utils';
import { AbstractEntityTreePresenterContext } from '../presenter-contexts/AbstractEntityTreePresenterContext';
import { EntityTreePresenterComponent } from '../EntityTreePresenterComponent';
import { DescendantEntityProviderComponent } from '../../../../exposer/DescendantEntityProviderComponent';
import * as _ from 'lodash';

export interface AbstractDescendentContextOptions<E> {
  presenter: EntityTreePresenterComponent<E>;
  rootContext: AbstractEntityTreePresenterContext;
  descendant: DescendantEntityProviderComponent<E>;
  node: EntityReactorNode<E>;
}

export abstract class AbstractDescendentContext<E> {
  nodes: Set<ReactorTreeEntity>;
  context: AbstractEntityTreePresenterContext;
  listener_parent: () => any;

  constructor(protected options: AbstractDescendentContextOptions<E>) {
    this.nodes = new Set();
    this.context = options.presenter.generateContext();
    this.context.setRootContext(options.rootContext);
  }

  abstract activate();

  deactivate() {
    this.listener_parent?.();
  }

  clearEntities() {
    this.nodes.forEach((n) => {
      n.delete();
    });
    this.nodes.clear();
  }

  protected loadEntities() {
    this.clearEntities();
    const { options, entities } = this.options.descendant.getReactorTreeEntities(
      this.options.node.entity,
      this.context
    );
    this.listener_parent?.();
    this.listener_parent = this.options.descendant.installParentNode(this.options.node, options);
    entities.forEach((e) => {
      this.nodes.add(e);
      this.options.node.addChild(e);
      if (e instanceof TreeNode) {
        e.deserialize(this.options.node.context.state.trees);
      }
    });
  }
}
