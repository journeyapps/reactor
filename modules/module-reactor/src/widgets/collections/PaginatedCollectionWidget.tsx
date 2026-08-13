import * as React from 'react';
import { useCallback, useRef } from 'react';

import * as _ from 'lodash';
import { BarLoader } from 'react-spinners';
import { PaginatedCollection } from '@journeyapps/reactor-lib-data-layer';
import { ioc } from '../../inversify.config';
import { observer } from 'mobx-react';
import { ThemeStore } from '../../stores/themes/ThemeStore';
import { styled, theme, themed } from '../../stores/themes/reactor-theme-fragment';
import { PanelPlaceholderWidget } from '../panel/panel/PanelPlaceholderWidget';
import { getScrollableCSS } from '../panel/panel/PanelWidget';

export interface PaginatedCollectionWidgetProps {
  collection?: PaginatedCollection;
  className?: any;
}

namespace S {
  export const LoadMore = themed.i`
    text-align: center;
    color: ${(p) => p.theme.combobox.text};
    opacity: 0.5;
    font-size: 12px;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  export const PlaceholderContainer = styled.div`
    display: flex;
    justify-content: center;
  `;

  export const Results = styled.div`
    overflow: auto;
    ${(p) => getScrollableCSS(p.theme)};
  `;
}

const SCROLL_DEBOUNCE = 500;

export const PaginatedCollectionWidget: React.FC<React.PropsWithChildren<PaginatedCollectionWidgetProps>> = observer(
  (props) => {
    const { collection } = props;
    const themeStore = ioc.get(ThemeStore);
    const ref = useRef<HTMLDivElement>(null);

    const onScroll = useCallback(
      _.debounce(
        () => {
          if (!ref.current) {
            return;
          }
          requestAnimationFrame(() => {
            const height = ref.current.getBoundingClientRect().height;
            const top = ref.current.scrollTop;
            const scrollBottom = height + top;
            // 5px here is for safe threshold
            if (scrollBottom > ref.current.scrollHeight - 30) {
              props.collection.loadMore();
            }
          });
        },
        SCROLL_DEBOUNCE,
        {
          leading: true
        }
      ),
      [props.collection]
    );

    const getLabel = () => {
      if (props.collection.loading) {
        return <S.LoadMore>loading more...</S.LoadMore>;
      }

      if (!props.collection.hasMore) {
        return <S.LoadMore>No more results</S.LoadMore>;
      }

      return (
        <S.LoadMore
          onClick={() => {
            props.collection.loadMore();
          }}
        >
          Scroll or click for more items
        </S.LoadMore>
      );
    };

    if (!collection || collection.items.length === 0) {
      return (
        <S.PlaceholderContainer>
          {!collection || collection.loading ? (
            <BarLoader width={100} height={5} color={themeStore.getCurrentTheme(theme).header.primary} loading={true} />
          ) : (
            <PanelPlaceholderWidget icon="list" text="Results will be displayed here" />
          )}
        </S.PlaceholderContainer>
      );
    }
    return (
      <S.Results className={props.className} onScroll={onScroll} ref={ref}>
        {props.children}
        {getLabel()}
      </S.Results>
    );
  }
);
