import * as React from 'react';
import { css, keyframes } from '@emotion/react';
import { SmartWorkspaceWidget } from '../workspace/SmartWorkspaceWidget';
import { inject } from '../../inversify.config';
import { System } from '../../core/System';
import { observer } from 'mobx-react';
import { SmartHeaderWidget } from '../header/SmartHeaderWidget';
import { FooterWidget } from '../footer/FooterWidget';
import { PrefsStore } from '../../stores/PrefsStore';
import { Alignment, UXStore } from '../../stores/UXStore';
import * as _ from 'lodash';
import { WorkspaceStore } from '../../stores/workspace/WorkspaceStore';
import { Btn } from '../../definitions/common';
import { LayerDirective } from '../../stores/layer/LayerDirective';
import { ThemeStore } from '../../stores/themes/ThemeStore';
import { styled } from '../../stores/themes/reactor-theme-fragment';
import { BatchIconWidget } from '../../stores/batch/BatchIconWidget';
import { RawBodyWidget } from './RawBodyWidget';
import { ReactorViewportMode, useReactorViewportMode } from '../../hooks/useReactorViewportMode';
import { MobileReactorShell } from '../mobile/MobileReactorShell';

namespace S {
  export const fadein = keyframes`
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    `;

  const locked = css`
    filter: blur(5px);
    pointer-events: none;
  `;

  export const Body = styled.div`
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    background: ${(p) => p.theme.workspace.background};
    animation: ${fadein} 0.3s;
  `;

  export const Content = styled.div<{ locked: boolean }>`
    display: flex;
    flex-grow: 1;
    max-width: 100%;
    width: 100%;
    max-height: 100%;
    ${(p) => (p.locked ? locked : '')};
  `;

  export const HeaderWrapped = styled(SmartHeaderWidget)<{ locked: boolean }>`
    ${(p) => (p.locked ? locked : '')};
  `;

  export const ChildrenInner = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    position: relative;
  `;

  export const FooterWrapped = styled.div<{ locked: boolean }>`
    flex-shrink: 0;
    ${(p) => (p.locked ? locked : '')};
  `;
}

export interface BodyWidgetProps {
  additionalLayers?: LayerDirective[];
  additionalFooterContent?: React.JSX.Element;
  additionalFooterRightBtns?: Btn[];
  additionalLeftHeaderButtons?: Btn[];
  additionalRightHeaderContent?: React.JSX.Element;
  logoClicked: (event: React.MouseEvent) => any;
  wrapFooter?: (getFooter: () => React.JSX.Element) => React.JSX.Element;
  lock?: boolean;
  logo: string;
}

interface BodyContentProps {
  additionalLeftHeaderButtons?: Btn[];
  additionalRightHeaderContent?: React.JSX.Element;
  email: string;
  footerRef: React.RefObject<HTMLDivElement>;
  getFooter: () => React.JSX.Element;
  headerRef: React.RefObject<HTMLDivElement>;
  leftToolbars: React.JSX.Element[];
  locked: boolean;
  logoClicked: (event: React.MouseEvent) => any;
  name: string;
  rightToolbars: React.JSX.Element[];
  workspaceRef: React.RefObject<HTMLDivElement>;
}

const BodyContent: React.FC<BodyContentProps> = (props) => {
  const viewportMode = useReactorViewportMode();

  if (viewportMode === ReactorViewportMode.MOBILE) {
    return (
      <MobileReactorShell locked={props.locked} logoClicked={props.logoClicked} workspaceRef={props.workspaceRef} />
    );
  }

  return (
    <>
      <S.HeaderWrapped
        locked={props.locked}
        email={props.email}
        name={props.name}
        additionalLeftButtons={props.additionalLeftHeaderButtons}
        forwardRef={props.headerRef}
        logoClicked={props.logoClicked}
        rightContent={props.additionalRightHeaderContent}
      />
      <S.Content locked={props.locked}>
        {props.leftToolbars}
        <S.ChildrenInner>
          <SmartWorkspaceWidget forwardRef={props.workspaceRef} />
        </S.ChildrenInner>
        {props.rightToolbars}
      </S.Content>
      <S.FooterWrapped locked={props.locked} ref={props.footerRef}>
        {props.getFooter()}
      </S.FooterWrapped>
    </>
  );
};

@observer
export class BodyWidget extends React.Component<BodyWidgetProps> {
  @inject(System)
  accessor application: System;

  @inject(PrefsStore)
  accessor prefsStore: PrefsStore;

  @inject(UXStore)
  accessor uxStore: UXStore;

  @inject(ThemeStore)
  accessor themeStore: ThemeStore;

  @inject(WorkspaceStore)
  accessor workspaceStore: WorkspaceStore;

  headerRef: React.RefObject<HTMLDivElement>;
  footerRef: React.RefObject<HTMLDivElement>;
  workspaceRef: React.RefObject<HTMLDivElement>;

  constructor(props: BodyWidgetProps) {
    super(props);
    this.headerRef = React.createRef();
    this.footerRef = React.createRef();
    this.workspaceRef = React.createRef();
  }

  getToolbars(allignment: Alignment) {
    return _.map(this.uxStore.getToolbars(allignment), (toolbar) => {
      return <React.Fragment key={toolbar.key}>{toolbar.getWidget()}</React.Fragment>;
    });
  }

  componentDidMount(): void {
    // install all the layers
    (this.props.additionalLayers || []).forEach((f) => {
      f.install();
    });
  }

  getRawFooter = () => {
    return (
      <FooterWidget btns={this.props.additionalFooterRightBtns}>{this.props.additionalFooterContent}</FooterWidget>
    );
  };

  getFooter() {
    if (this.props.wrapFooter) {
      return this.props.wrapFooter(this.getRawFooter);
    }
    return this.getRawFooter();
  }

  isLocked() {
    return this.uxStore.locked || this.props.lock;
  }

  render() {
    return (
      <RawBodyWidget logo={this.props.logo}>
        <BatchIconWidget />
        <S.Body>
          <BodyContent
            additionalLeftHeaderButtons={this.props.additionalLeftHeaderButtons}
            additionalRightHeaderContent={this.props.additionalRightHeaderContent}
            email={this.uxStore.account?.email}
            footerRef={this.footerRef}
            getFooter={() => this.getFooter()}
            headerRef={this.headerRef}
            leftToolbars={this.getToolbars(Alignment.LEFT)}
            locked={this.isLocked()}
            logoClicked={this.props.logoClicked}
            name={this.uxStore.account?.name}
            rightToolbars={this.getToolbars(Alignment.RIGHT)}
            workspaceRef={this.workspaceRef}
          />
        </S.Body>
      </RawBodyWidget>
    );
  }
}
