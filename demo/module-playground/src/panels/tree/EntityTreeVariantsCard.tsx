import * as React from 'react';
import { observer } from 'mobx-react';
import { createSearchEventMatcher, SearchEvent } from '@journeyapps/reactor-lib-search';
import {
  CardWidget,
  CheckboxLabelWidget,
  ControlledSearchWidget,
  EntityPresenterComponentRenderType,
  SurfaceWidget,
  getScrollableCSS,
  styled
} from '@journeyapps/reactor-mod';
import { TodoModel, TodoStore } from '@journeyapps/reactor-mod-todos';

export interface EntityTreeVariantsCardProps {
  definition: any;
  todoStore: TodoStore;
}

export const EntityTreeVariantsCard: React.FC<EntityTreeVariantsCardProps> = observer((props) => {
  const { definition, todoStore } = props;
  const [search, setSearch] = React.useState<string>(null);
  const searchEvent = React.useMemo<SearchEvent>(() => {
    if (!search) {
      return null;
    }
    return {
      search,
      matches: createSearchEventMatcher(search)
    };
  }, [search]);

  const entityContexts = React.useMemo(() => {
    return definition
      .getPresenters()
      .filter((presenter) => presenter.renderType === EntityPresenterComponentRenderType.TREE)
      .map((presenter) => {
        const context = presenter.generateContext();
        const subtitleParts: string[] = [];
        if (presenter.loadChildrenAsNodesAreOpened) {
          subtitleParts.push('loadChildrenAsNodesAreOpened = true');
        }
        subtitleParts.push(`cacheTreeEntities = ${context.constructor.name.includes('Cached')}`);

        return {
          label: presenter.label,
          title: presenter.label,
          subtitle: subtitleParts.join(', '),
          context
        };
      });
  }, [definition]);

  React.useEffect(() => {
    return () => {
      entityContexts.forEach((entry) => {
        entry.context.dispose();
      });
    };
  }, [entityContexts]);

  return (
    <CardWidget
      title="Entity Tree Presenter Permutations"
      subHeading="Todo entity tree variants"
      sections={[
        {
          key: 'entity-tree-search',
          content: () => {
            return (
              <S.SearchRow>
                <S.SearchLabel>Entity search</S.SearchLabel>
                <S.SearchControls>
                  <S.Search
                    historyContext="playground-tree-search-entity"
                    searchChanged={setSearch}
                    initialValue={search}
                  />
                  <CheckboxLabelWidget
                    checked={todoStore.simulateLoadNotesError}
                    label="Simulate notes load error"
                    onChange={(value) => {
                      todoStore.simulateLoadNotesError = value;
                    }}
                  />
                </S.SearchControls>
              </S.SearchRow>
            );
          }
        },
        {
          key: 'entity-tree-variants',
          content: () => {
            return (
              <S.Grid>
                {entityContexts.map((entry) => {
                  return (
                    <React.Fragment key={entry.label}>
                      <CardWidget
                        title={entry.title}
                        subHeading={entry.subtitle}
                        sections={[
                          {
                            key: `entity-tree-${entry.label}`,
                            content: () => {
                              return (
                                <S.TreeFrame>
                                  {entry.context.renderCollection({
                                    entities: todoStore.rootTodos as TodoModel[],
                                    searchEvent
                                  })}
                                </S.TreeFrame>
                              );
                            }
                          }
                        ]}
                      />
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
});

namespace S {
  export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  `;

  export const TreeFrame = styled(SurfaceWidget)`
    height: 180px;
    overflow: auto;
    ${(p) => getScrollableCSS(p.theme)};
  `;

  export const SearchRow = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 6px;
    width: 100%;
  `;

  export const Search = styled(ControlledSearchWidget)`
    flex-grow: 1;
  `;

  export const SearchControls = styled.div`
    display: flex;
    align-items: center;
    column-gap: 12px;
  `;

  export const SearchLabel = styled.div`
    color: ${(p) => p.theme.text.secondary};
    font-size: 12px;
  `;
}
