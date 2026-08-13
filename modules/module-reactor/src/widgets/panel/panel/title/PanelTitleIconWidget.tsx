import * as React from 'react';
import { ReactorIcon, IconWidget } from '../../../icons/IconWidget';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DualIconWidget } from '../../../icons/DualIconWidget';
import { ioc } from '../../../../inversify.config';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { styled, theme } from '../../../../stores/themes/reactor-theme-fragment';
import { ThemeStore } from '../../../../stores/themes/ThemeStore';

export interface PanelTitleIconWidgetProps {
  icon: ReactorIcon;
  icon2?: ReactorIcon;
  color: string;
}

namespace S {
  export const Container = styled.div`
    position: relative;
    width: 48px;
    height: 30px;
    cursor: pointer;
  `;

  export const Svg = styled.svg`
    height: 100%;
    width: 100%;
  `;

  export const Polygon = styled.polygon<{ selected: boolean }>`
    fill: ${(p) => p.theme.panels.iconBackground};
  `;

  export const Icon = styled.div`
    left: 7px;
    top: 50%;
    transform: translateY(-50%);
    position: absolute;
    color: ${(p) => p.theme.panels.titleForeground};
  `;

  export const Angle = styled(FontAwesomeIcon)<{ selected: boolean }>`
    font-size: 10px;
    color: ${(p) => p.theme.panels.titleForeground};
    opacity: ${(p) => (p.selected ? 1 : 0.1)};
    position: absolute;
    right: 9px;
    bottom: 1px;
  `;

  export const SingleIcon = styled(IconWidget)<{ color: string }>`
    color: ${(p) => p.color};
    max-width: 20px;
  `;
}

export const PanelTitleIconSimpleWidget: React.FC<PanelTitleIconWidgetProps> = (props) => {
  const themeOb = ioc.get(ThemeStore).getCurrentTheme(theme);
  return (
    <S.Icon>
      {props.icon2 ? (
        <DualIconWidget
          color1={getTransparentColor(themeOb.panels.titleForeground, 0.3)}
          color2={props.color}
          icon1={props.icon}
          icon2={props.icon2}
        />
      ) : (
        <S.SingleIcon color={props.color} icon={props.icon} />
      )}
    </S.Icon>
  );
};

export const PanelTitleIconWidget: React.FC<PanelTitleIconWidgetProps> = (props) => {
  const [hover, setHover] = React.useState(false);
  return (
    <S.Container
      onMouseOver={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <S.Svg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <S.Polygon selected={hover} points="0,0 78,0 100,100 0,100" />
      </S.Svg>
      <PanelTitleIconSimpleWidget {...props} />
      <S.Angle selected={hover} icon="angle-down" />
    </S.Container>
  );
};
