import React from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { MetaBarWidget } from '../../../../../widgets/meta/MetaBarWidget';
import { CardWidget } from '../../../../../widgets/cards/CardWidget';
import { themed } from '../../../../../stores/themes/reactor-theme-fragment';
import { ActionSource } from '../../../../../actions/Action';
import { SearchEvent } from '@journeyapps/reactor-lib-search';
import { EntityCardsPresenterContext } from './EntityCardsPresenterComponent';
import { TagsSectionWidget } from './TagsSectionWidget';
import { NestedTreesSectionWidget } from './NestedTreesSectionWidget';
import { EntityCardTitleWidget } from './EntityCardTitleWidget';
import { ContextMenuTriggerWidget } from '../../../../../widgets/context-menu/ContextMenuTriggerWidget';

export interface EntityCardWidgetProps<T> {
  entity: T;
  presenterContext: EntityCardsPresenterContext<T>;
  searchEvent?: SearchEvent;
}

namespace S {
  export const Card = themed(CardWidget)`
    cursor: pointer;
    overflow: hidden;
    min-width: 0;
    flex: 1;
  `;

  export const CardWrapper = styled(ContextMenuTriggerWidget)`
    cursor: pointer;
    min-width: 0;
    display: flex;
  `;

  export const Labels = styled(MetaBarWidget)``;
}

export const EntityCardWidget = observer(function <T>(props: EntityCardWidgetProps<T>) {
  const { entity, presenterContext, searchEvent } = props;
  const theme = useTheme() as any;
  const encoded = presenterContext.definition.encode(entity, false);
  const selected = presenterContext.batchStore.isSelected(encoded);
  const description = presenterContext.definition.describeEntity(entity);
  let titleMatch = null;
  if (description.simpleName) {
    titleMatch =
      searchEvent?.matches?.(description.simpleName, {
        nullIsTrue: false
      }) || null;
  }
  const labels = description.labels || [];
  const tags = description.tags || [];
  const nestedTrees = presenterContext.getNestedTreeRenderOptions(entity);

  return (
    <S.CardWrapper
      onClick={(event) => {
        event.stopPropagation();
        presenterContext.handleClick(entity, event as any, ActionSource.CARD);
      }}
      onContextMenu={(position) => {
        presenterContext.handleContextMenu(entity, position);
      }}
    >
      <S.Card
        btns={presenterContext.getCardButtons(entity)}
        selected={selected}
        title={<EntityCardTitleWidget description={description} titleMatch={titleMatch} />}
        subHeading={description.complexName}
        color={description.iconColor}
        sections={[
          labels.length > 0
            ? {
                key: 'labels',
                grow: false,
                content: () => {
                  return <S.Labels meta={labels} />;
                }
              }
            : null,
          tags.length > 0
            ? {
                key: 'tags',
                grow: false,
                content: () => {
                  return <TagsSectionWidget tags={tags} theme={theme} />;
                }
              }
            : null,
          nestedTrees.length > 0
            ? {
                key: 'nested-trees',
                grow: false,
                content: () => {
                  return <NestedTreesSectionWidget nestedTrees={nestedTrees} />;
                }
              }
            : null
        ].filter((f) => !!f)}
      />
    </S.CardWrapper>
  );
});
