import React from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import { SearchEvent } from '@journeyapps/reactor-lib-search';
import { EntityCardsPresenterContext } from './EntityCardsPresenterComponent';
import { CardWidget } from '../../../../../widgets/cards/CardWidget';
import { themed } from '../../../../../stores/themes/reactor-theme-fragment';
import { REACTOR_MOBILE_MEDIA_QUERY } from '../../../../../hooks/useReactorViewportMode';

export interface GroupedEntityCardsWidgetProps<T> {
  entities: T[];
  presenterContext: EntityCardsPresenterContext<T>;
  searchEvent?: SearchEvent;
}

namespace S {
  export const GroupGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 10px;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      flex-direction: column;
      flex-wrap: nowrap;
    }
  `;

  export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    align-items: stretch;
    gap: 10px;
    width: 100%;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      display: flex;
      flex-direction: column;
    }
  `;

  export const GroupCard = themed(CardWidget)`
    overflow: hidden;
    min-width: 0;
    flex: 1 1 420px;
    max-width: 100%;
  `;
}

export const GroupedEntityCardsWidget = observer(function <T>(props: GroupedEntityCardsWidgetProps<T>) {
  const groups = props.presenterContext.groupEntitiesBySelectedSetting({
    entities: props.entities
  });

  return (
    <S.GroupGrid>
      {Object.entries(groups).map(([group, entities]) => {
        if (entities.length === 0) {
          return null;
        }

        return (
          <S.GroupCard
            key={group}
            title={group}
            subHeading={`${entities.length} ${entities.length === 1 ? 'item' : 'items'}`}
            sections={[
              {
                key: 'entities',
                content: () => {
                  return (
                    <S.Grid>
                      {entities.map((entity) => {
                        return (
                          <React.Fragment key={`${group}-${props.presenterContext.definition.getEntityUID(entity)}`}>
                            {props.presenterContext.renderCard({
                              entity,
                              searchEvent: props.searchEvent
                            })}
                          </React.Fragment>
                        );
                      })}
                    </S.Grid>
                  );
                }
              }
            ]}
          />
        );
      })}
    </S.GroupGrid>
  );
});
