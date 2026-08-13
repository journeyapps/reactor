import * as React from 'react';
import { MouseEvent } from 'react';
import { observer } from 'mobx-react';
import {
  CardWidget,
  ReactorPanelModel,
  SurfaceWidget,
  TabDirective,
  TabSelectionWidget,
  styled
} from '@journeyapps/reactor-mod';

export interface PlaygroundTabsPanelWidgetProps {
  model: ReactorPanelModel;
}

const baseTabs: TabDirective[] = [
  { key: 'overview', name: 'Overview', icon: 'home' },
  { key: 'schema', name: 'Schema', icon: 'file-alt' },
  { key: 'views', name: 'Views', icon: 'mobile-alt' },
  { key: 'deploy', name: 'Deploy', icon: 'rocket' }
];

const stateTabs: TabDirective[] = [
  { key: 'everything', name: 'Everything' },
  { key: 'actions', name: 'Actions', badge: { content: '!', color: '#00c0ff' } },
  { key: 'disabled', name: 'Disabled', disabled: true },
  { key: 'history', name: 'History', badge: { content: '2', color: '#ff6a1a' } }
];

const contentTabs: TabDirective[] = [
  {
    key: 'model',
    name: 'Model',
    icon: 'cube',
    rightContent: () => <S.TrailingItem>12</S.TrailingItem>
  },
  {
    key: 'views',
    name: 'Views',
    icon: 'mobile-alt',
    rightContent: () => <S.TrailingItem>3</S.TrailingItem>
  },
  {
    key: 'deploy',
    name: 'Deploy',
    icon: 'rocket',
    rightContent: () => <S.StatusDot />
  }
];

const customTabs: TabDirective[] = [
  {
    key: 'custom',
    name: 'Custom',
    tabContent: () => (
      <S.CustomTabContent>
        <S.StatusDot />
        <span>Custom render</span>
      </S.CustomTabContent>
    )
  },
  {
    key: 'plain',
    name: 'Plain fallback'
  }
];

export const PlaygroundTabsPanelWidget: React.FC<PlaygroundTabsPanelWidgetProps> = observer(() => {
  const [horizontal, setHorizontal] = React.useState('overview');
  const [vertical, setVertical] = React.useState('schema');
  const [compact, setCompact] = React.useState('everything');
  const [defaultSize, setDefaultSize] = React.useState('actions');
  const [customContent, setCustomContent] = React.useState('model');
  const [customOverride, setCustomOverride] = React.useState('custom');
  const [lastEvent, setLastEvent] = React.useState('None yet');

  const handleRightClick = (event: MouseEvent, tab: TabDirective) => {
    event.preventDefault();
    setLastEvent(`Right clicked ${tab.name}`);
  };

  return (
    <S.Container>
      <CardWidget
        title="Tabs"
        subHeading="Shared tab system in horizontal and vertical orientations"
        sections={[
          {
            key: 'tab-orientations',
            content: () => {
              return (
                <S.Examples>
                  <S.Example>
                    <S.Label>Horizontal</S.Label>
                    <S.Surface>
                      <TabSelectionWidget tabs={baseTabs} selected={horizontal} tabSelected={setHorizontal} />
                    </S.Surface>
                  </S.Example>

                  <S.Example>
                    <S.Label>Vertical</S.Label>
                    <S.VerticalSurface>
                      <TabSelectionWidget vertical tabs={baseTabs} selected={vertical} tabSelected={setVertical} />
                    </S.VerticalSurface>
                  </S.Example>
                </S.Examples>
              );
            }
          }
        ]}
      />

      <CardWidget
        title="Density + States"
        subHeading="Default, compact, disabled tabs, badges and context clicks"
        sections={[
          {
            key: 'tab-density-states',
            content: () => {
              return (
                <S.Examples>
                  <S.Example>
                    <S.Label>Default</S.Label>
                    <S.Surface>
                      <TabSelectionWidget
                        tabs={stateTabs}
                        selected={defaultSize}
                        tabSelected={setDefaultSize}
                        tabRightClick={handleRightClick}
                      />
                    </S.Surface>
                  </S.Example>

                  <S.Example>
                    <S.Label>Compact</S.Label>
                    <S.Surface>
                      <TabSelectionWidget
                        compact
                        tabs={stateTabs}
                        selected={compact}
                        tabSelected={setCompact}
                        tabRightClick={handleRightClick}
                        badgeProvider={(key) => (key === 'history' ? { content: '4', color: '#9370db' } : null)}
                      />
                    </S.Surface>
                  </S.Example>

                  <S.EventLog>{lastEvent}</S.EventLog>
                </S.Examples>
              );
            }
          }
        ]}
      />

      <CardWidget
        title="Custom Content"
        subHeading="Structured icons and trailing content, with custom rendering as an escape hatch"
        sections={[
          {
            key: 'tab-custom-content',
            content: () => {
              return (
                <S.Examples>
                  <S.Example>
                    <S.Label>Icons + trailing items</S.Label>
                    <S.Surface>
                      <TabSelectionWidget
                        tabs={contentTabs}
                        selected={customContent}
                        tabSelected={setCustomContent}
                        tabRightClick={handleRightClick}
                      />
                    </S.Surface>
                  </S.Example>

                  <S.Example>
                    <S.Label>Vertical compact + trailing items</S.Label>
                    <S.VerticalSurface>
                      <TabSelectionWidget
                        vertical
                        compact
                        tabs={contentTabs}
                        selected={customContent}
                        tabSelected={setCustomContent}
                        tabRightClick={handleRightClick}
                      />
                    </S.VerticalSurface>
                  </S.Example>

                  <S.Example>
                    <S.Label>Custom override</S.Label>
                    <S.Surface>
                      <TabSelectionWidget
                        tabs={customTabs}
                        selected={customOverride}
                        tabSelected={setCustomOverride}
                        tabRightClick={handleRightClick}
                      />
                    </S.Surface>
                  </S.Example>
                </S.Examples>
              );
            }
          }
        ]}
      />
    </S.Container>
  );
});

namespace S {
  export const Container = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
  `;

  export const Examples = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: flex-start;
  `;

  export const Example = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 220px;
  `;

  export const Label = styled.div`
    color: ${(p) => p.theme.text.secondary};
    font-size: 13px;
  `;

  export const Surface = styled(SurfaceWidget)`
    display: inline-flex;
    overflow: hidden;
  `;

  export const VerticalSurface = styled(Surface)`
    min-width: 150px;
  `;

  export const CustomTabContent = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 7px;
  `;

  export const TrailingItem = styled.span`
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 18px;
    background: ${(p) => p.theme.meta.background};
    color: ${(p) => p.theme.meta.foreground};
  `;

  export const StatusDot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${(p) => p.theme.status.success};
  `;

  export const EventLog = styled(SurfaceWidget)`
    align-self: flex-end;
    min-height: 26px;
    padding: 5px 8px;
    box-sizing: border-box;
    color: ${(p) => p.theme.text.secondary};
    font-size: 13px;
  `;
}
