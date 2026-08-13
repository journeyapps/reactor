import { TreeEntity } from '@journeyapps-labs/common-tree';
import * as React from 'react';
import { CoreTreeWidgetProps } from '../CoreTreeWidget';
import { SearchEvent, SearchEventMatch } from '@journeyapps/reactor-lib-search';
import { PatchTree, ReactorTreeListener } from './PatchTree';
import { ReactorTreeOptions, setupReactorTree } from './reactor-tree-utils';
import { ReactorTreeLeafWidget } from './widgets/ReactorTreeLeafWidget';

export class ReactorTreeLeaf<T extends ReactorTreeListener = ReactorTreeListener> extends PatchTree(TreeEntity)<T> {
  constructor(public options: ReactorTreeOptions) {
    super(options.key || null);
    setupReactorTree(this, options);
  }

  renderWidget(event: CoreTreeWidgetProps): React.JSX.Element {
    return <ReactorTreeLeafWidget key={this.getKey()} tree={this} event={event} />;
  }

  match(event: SearchEvent): SearchEventMatch {
    return this.options.match?.(event);
  }
}
