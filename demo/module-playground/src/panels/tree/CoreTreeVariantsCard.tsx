import * as React from 'react';
import { observer } from 'mobx-react';
import {
  CardWidget,
  ControlledSearchWidget,
  SearchableCoreTreeWidget,
  SurfaceWidget,
  getScrollableCSS,
  styled
} from '@journeyapps/reactor-mod';
import { buildCoreTreeVariants } from './coreTreeBuilders';

export type CoreTreeVariantsCardProps = object;

export const CoreTreeVariantsCard: React.FC<CoreTreeVariantsCardProps> = observer(() => {
  const [coreTreeVariants] = React.useState(() => buildCoreTreeVariants());
  const [search, setSearch] = React.useState<string>(null);

  return (
    <CardWidget
      title="Core Tree Permutations"
      subHeading="Non-entity tree behaviors"
      sections={[
        {
          key: 'core-tree-search',
          content: () => {
            return (
              <S.SearchRow>
                <S.SearchLabel>Core tree search</S.SearchLabel>
                <S.Search
                  historyContext="playground-tree-search-core"
                  searchChanged={setSearch}
                  initialValue={search}
                />
              </S.SearchRow>
            );
          }
        },
        {
          key: 'core-tree-variants',
          content: () => {
            return (
              <S.Grid>
                {coreTreeVariants.map((variant) => {
                  return (
                    <React.Fragment key={variant.key}>
                      <CardWidget
                        title={variant.title}
                        subHeading={variant.subtitle}
                        sections={[
                          {
                            key: `core-tree-${variant.key}`,
                            content: () => {
                              return (
                                <S.TreeFrame>
                                  <SearchableCoreTreeWidget
                                    tree={variant.tree}
                                    search={search}
                                    searchScope={variant.searchScope}
                                  />
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  export const SearchLabel = styled.div`
    color: ${(p) => p.theme.text.secondary};
    font-size: 12px;
  `;
}
