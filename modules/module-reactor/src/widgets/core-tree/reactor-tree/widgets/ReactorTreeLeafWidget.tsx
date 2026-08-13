import * as React from 'react';
import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { TreeLeafWidget } from '../../../tree/TreeLeafWidget';
import { CoreTreeWidgetProps } from '../../CoreTreeWidget';
import { useForceUpdate } from '../../../../hooks/useForceUpdate';
import { useTreeEntity } from './useTreeEntity';
import type { ReactorTreeLeaf } from '../ReactorTreeLeaf';

export interface ReactorTreeLeafWidgetProps {
  tree: ReactorTreeLeaf;
  event: CoreTreeWidgetProps;
}

export const ReactorTreeLeafWidget: React.FC<ReactorTreeLeafWidgetProps> = observer(({ event, tree }) => {
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const disposer = tree.registerListener({
      propGeneratorsChanged: () => {
        forceUpdate({
          defer: true
        });
      }
    });
    forceUpdate({
      defer: true
    });
    return disposer;
  }, [tree]);

  const { render } = useTreeEntity({ tree, event });

  if (!render) {
    return null;
  }

  return (
    <TreeLeafWidget
      forwardRef={event.forwardRef}
      {...tree.getProps(event)}
      depth={event.depth}
      reserveNodeToggleSpace={event.reserveNodeToggleSpace}
    />
  );
});
