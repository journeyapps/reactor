import * as React from 'react';
import { MouseEvent, useRef } from 'react';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconWidget, ReactorIcon } from '../icons/IconWidget';
import { DualIconWidget } from '../icons/DualIconWidget';
import { TreeContentWidget } from './TreeContentWidget';
import { SearchEventMatch } from '@journeyapps-labs/lib-reactor-search';
import { MatchesWidget } from '../search/MatchesWidget';
import { AttentionWrapperWidget } from '../guide/AttentionWrapperWidget';
import { ButtonComponentSelection, ReactorComponentType } from '../../stores/guide/selections/common';
import { getTransparentColor } from '@journeyapps-labs/lib-reactor-utils';
import { themed } from '../../stores/themes/reactor-theme-fragment';
import { REACTOR_MOBILE_MEDIA_QUERY } from '../../hooks/useReactorViewportMode';
import { ContextMenuTriggerWidget } from '../context-menu/ContextMenuTriggerWidget';
import { MousePosition } from '../../layers/combo/SmartPositionWidget';
import { TreeEntityDetailsWidget } from './TreeEntityDetailsWidget';
import type { MetadataWidgetProps } from '../meta/MetadataWidget';
import { MetadataDisplayOptions, TagDisplayMode } from './TreeEntityDisplayMode';

export interface TreeLeafWidgetCommonProps {
  rightChildren?: React.JSX.Element;
  rightChildrenWrap?: boolean;
  rightClick?: (event: MousePosition) => any;
  normalClick?: (event: MouseEvent) => any;
  mouseOver?: (event: MouseEvent, hover: boolean) => any;
  dropZoneHint?: boolean;
  dropZoneHover?: boolean;
  depth?: number;
  reserveNodeToggleSpace?: boolean;
  label: string;
  label2?: string;
  tooltip?: string;
  labelColor?: string;
  icon?: ReactorIcon;
  icon2?: ReactorIcon;
  iconSpin?: boolean;
  iconColor?: string;
  icon2Color?: string;
  selected?: boolean;
  deactivated?: boolean;
  forwardRef?: React.RefObject<HTMLDivElement>;
  wrap?: boolean;
  matches?: SearchEventMatch;
  tags?: string[];
  metadata?: MetadataWidgetProps[];
  tagDisplayMode?: TagDisplayMode;
  metadataDisplayOptions?: MetadataDisplayOptions;
  maxTags?: number;
}

export interface TreeLeafWidgetProps extends TreeLeafWidgetCommonProps {
  collapse?: {
    collapsed: boolean;
    changed: (collapsed: boolean, deep?: boolean) => any;
    enabled?: boolean;
  };
}

namespace S {
  export const Top = themed(ContextMenuTriggerWidget)<{
    $selected: boolean;
    $deactivated: boolean;
    $attention: boolean;
    $dropzoneHint: boolean;
    $dropzoneHover: boolean;
  }>`

    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
    min-height: 23px;
    user-select: none;
    cursor: pointer;
    border: solid 1px transparent;
    background: ${(p) => (p.$selected ? p.theme.trees.selectedBackground : 'transparent')};
    border-radius: 5px;
    margin-bottom: 1px;
    color: ${(p) => (p.$selected ? p.theme.trees.labelColor : getTransparentColor(p.theme.trees.labelColor, 0.76))};
    opacity: ${(p) => (p.$deactivated ? 0.3 : 1)};

    ${(p) => (p.$attention ? `border-color: ${p.theme.guide.accent};` : ``)};
    ${(p) => (p.$dropzoneHint ? `border-color: ${p.theme.dnd.hintColor};` : '')}
    ${(p) => (p.$dropzoneHover ? `background: ${p.theme.dnd.hoverColor};` : '')};

    &:hover {
      color: ${(p) => p.theme.trees.labelColor};
    }

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      min-height: 30px;
    }
  `;

  export const TopLeft = styled(TreeContentWidget)`
    flex-grow: 0;
  `;

  export const Title = styled.div<{ selected: boolean; $wrap: boolean; color: string }>`
    font-size: 15px;
    user-select: none;
    ${(p) => (p.$wrap ? '' : 'white-space: nowrap')};
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: -1px;
    display: flex;
    align-items: center;
    padding-right: 10px;
    ${(p) => (p.color ? `color: ${p.color}` : '')};

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      font-size: 17px;
      padding-right: 12px;
    }
  `;

  export const Label2 = themed.div`
    color: ${(p) => p.theme.text.secondary};
    margin-left: 5px;
    white-space: nowrap;
  `;

  export const RightContent = styled.div`
    display: flex;
    justify-content: flex-end;
    flex-shrink: 1;
    flex-grow: 1;
    min-width: 0;
  `;

  export const Actions = styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
  `;

  export const Icon = styled.div<{ deactivated?: boolean }>`
    margin-right: 6px;
    font-size: 12px;
    min-width: 14px;
    flex-shrink: 0;
    text-align: center;
    align-items: center;
    display: flex;
    opacity: ${(p) => (p.deactivated == null ? 1 : p.deactivated ? 0.2 : 0.62)};

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      margin-right: 8px;
      font-size: 14px;
      min-width: 17px;
    }
  `;

  export const NestedIcon = styled(IconWidget)`
    max-height: 13px;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      max-height: 16px;
    }
  `;

  export const Arrow = themed(FontAwesomeIcon)<{ open: boolean }>`
    color: ${(p) => p.theme.trees.labelColor};
    font-size: 11px;

    transition: transform 0.2s;
    width: 14px;
    text-align: center;

    ${(p) => (p.open ? `transform: rotateZ(90deg);` : '')}

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      font-size: 13px;
      width: 17px;
    }

    &:hover {
      opacity: 1;
    }
  `;
}

export const TreeLeafWidget: React.FC<TreeLeafWidgetProps> = (props) => {
  const localRef = useRef<HTMLDivElement>(null);
  const forwardRef = props.forwardRef || localRef;
  const hasDetails = (props.tags?.length || 0) > 0 || (props.metadata?.length || 0) > 0;

  const getTitle = () => {
    if (!props.label) {
      return null;
    }
    if (!props.matches) {
      return props.label;
    }
    return <MatchesWidget locators={props.matches.locators} text={props.label as string} />;
  };

  const getNormalIcon = () => {
    if (!props.icon) {
      return null;
    }
    return (
      <S.Icon style={{ color: props.iconColor }}>
        {props.icon2 ? (
          <DualIconWidget icon1={props.icon} icon2={props.icon2} color1={props.iconColor} color2={props.icon2Color} />
        ) : (
          <S.NestedIcon icon={props.icon as any} spin={props.iconSpin} />
        )}
      </S.Icon>
    );
  };

  const getPlayIcon = () => {
    if (!props.collapse) {
      return null;
    }
    return (
      <S.Icon
        deactivated={!props.collapse.enabled}
        onClick={(event) => {
          event.stopPropagation();
          event.persist();
          props.collapse.changed(!props.collapse.collapsed, event.altKey);
        }}
      >
        <S.Arrow open={!props.collapse.collapsed} icon="play" />
      </S.Icon>
    );
  };

  let depth = props.depth || 0;
  if (!props.collapse && props.reserveNodeToggleSpace !== false) {
    depth++;
  }

  return (
    <AttentionWrapperWidget<ButtonComponentSelection>
      forwardRef={forwardRef}
      selection={{ label: props.label }}
      type={ReactorComponentType.TREE_LEAF}
      activated={(selected) => (
        <S.Top
          title={props.tooltip}
          $dropzoneHover={!!props.dropZoneHover}
          $dropzoneHint={!!props.dropZoneHint}
          $attention={!!selected}
          $deactivated={!!props.deactivated}
          onClick={(event) => {
            if (props.normalClick) {
              event.stopPropagation();
              props.normalClick(event);
            }
          }}
          onContextMenu={(position) => props.rightClick?.(position)}
          onMouseEnter={(event) => props.mouseOver?.(event, true)}
          onMouseLeave={(event) => props.mouseOver?.(event, false)}
          ref={forwardRef}
          $selected={!!props.selected}
        >
          <S.TopLeft depth={depth}>
            {getPlayIcon()}
            {getNormalIcon()}
            <S.Title color={props.labelColor} $wrap={props.wrap} selected={props.selected}>
              {getTitle()}
              {props.label2 ? <S.Label2>{props.label2}</S.Label2> : null}
            </S.Title>
          </S.TopLeft>
          {hasDetails ? (
            <S.RightContent>
              <TreeEntityDetailsWidget
                tags={props.tags}
                metadata={props.metadata}
                tagDisplayMode={props.tagDisplayMode}
                metadataDisplayOptions={props.metadataDisplayOptions}
                maxTags={props.maxTags}
              />
            </S.RightContent>
          ) : null}
          {props.rightChildren ? (
            hasDetails ? (
              <S.Actions>{props.rightChildren}</S.Actions>
            ) : (
              <S.RightContent>{props.rightChildren}</S.RightContent>
            )
          ) : null}
        </S.Top>
      )}
    />
  );
};
