import * as React from 'react';
import { observer } from 'mobx-react';
import {
  BorderLayoutWidget,
  CardWidget,
  MetaBarWidget,
  MetadataWidget,
  ReactorPanelModel,
  StatusCardState,
  StatusCardWidget,
  SurfaceWidget,
  ioc,
  styled
} from '@journeyapps/reactor-mod';
import { PlaygroundStore } from '../stores/PlaygroundStore';

export interface PlaygroundCardsPanelWidgetProps {
  model: ReactorPanelModel;
}

export const PlaygroundCardsPanelWidget: React.FC<PlaygroundCardsPanelWidgetProps> = observer(() => {
  const logger = ioc.get(PlaygroundStore).logger.childLogger('Cards');
  return (
    <S.Container>
      <CardWidget
        title="Metadata Permutations"
        subHeading="Single metadata pills and metabar combinations"
        sections={[
          {
            key: 'metadata-single',
            content: () => {
              return (
                <>
                  <S.SectionTitle>Single metadata</S.SectionTitle>
                  <S.Row>
                    <MetadataWidget label="Simple" value="Default" />
                    <MetadataWidget label="Color" value="Cyan" color="cyan" />
                    <MetadataWidget label="Muted" value="Inactive" active={false} />
                  </S.Row>
                </>
              );
            }
          },
          {
            key: 'metadata-bars',
            content: () => {
              return (
                <S.Column>
                  <S.SectionTitle>Meta bar combinations</S.SectionTitle>
                  <MetaBarWidget
                    meta={[
                      { label: 'Environment', value: 'playground', color: 'cyan' },
                      { label: 'Owner', value: 'ui-team', color: 'green' },
                      {
                        label: 'Status',
                        value: 'preview',
                        color: 'orange',
                        icon: {
                          name: 'eye',
                          color: 'currentColor'
                        }
                      }
                    ]}
                  />

                  <MetaBarWidget
                    meta={[
                      { label: 'Build', value: '2026.02.25', color: 'gray' },
                      { label: 'Mode', value: 'readonly', active: false },
                      { label: 'Flag', value: 'enabled', color: 'purple' }
                    ]}
                  />
                </S.Column>
              );
            }
          },
          {
            key: 'metadata-interactive',
            content: () => {
              return (
                <>
                  <S.SectionTitle>Interactive metadata</S.SectionTitle>
                  <S.Row>
                    <MetadataWidget
                      label="Interactive"
                      value="Clickable"
                      color="green"
                      tooltip="MetadataWidget with click handler"
                      onClick={() => logger.info('Interactive metadata clicked')}
                    />
                  </S.Row>
                </>
              );
            }
          }
        ]}
      />

      <CardWidget
        title="Status Cards"
        subHeading="Loading, success and failure variants"
        sections={[
          {
            key: 'cards-status',
            content: () => {
              return (
                <S.Grid>
                  <StatusCardWidget
                    status={StatusCardState.LOADING}
                    label={{ icon: 'sync-alt', label: 'Loading process' }}
                    meta={[
                      { label: 'State', value: 'Running', color: 'cyan' },
                      { label: 'Queue', value: '3 jobs', color: 'orange' }
                    ]}
                  >
                    {() => <MetadataWidget label="Elapsed" value="00:42" color="blue" />}
                  </StatusCardWidget>

                  <StatusCardWidget
                    status={StatusCardState.COMPLETE}
                    label={{ icon: 'check', label: 'Success result' }}
                    meta={[
                      { label: 'State', value: 'Completed', color: 'green' },
                      { label: 'Items', value: '24', color: 'cyan' }
                    ]}
                  >
                    {() => <MetadataWidget label="Duration" value="01:15" color="green" />}
                  </StatusCardWidget>

                  <StatusCardWidget
                    status={StatusCardState.FAILED}
                    label={{ icon: 'warning', label: 'Failure result' }}
                    meta={[
                      { label: 'State', value: 'Degraded', color: 'red' },
                      { label: 'Retries', value: '2', color: 'orange' }
                    ]}
                  >
                    {() => <MetadataWidget label="Hint" value="Inspect logs" color="gray" />}
                  </StatusCardWidget>
                </S.Grid>
              );
            }
          }
        ]}
      />

      <CardWidget
        title="Border Layout Examples"
        subHeading="Top/center/bottom composition with BorderLayoutWidget"
        sections={[
          {
            key: 'border-layout-examples',
            content: () => {
              return (
                <S.LayoutGrid>
                  <S.LayoutFrame>
                    <BorderLayoutWidget
                      top={
                        <S.LayoutHeader>
                          <MetaBarWidget meta={[{ label: 'Top', value: 'Header', color: 'cyan' }]} />
                        </S.LayoutHeader>
                      }
                      bottom={
                        <S.LayoutFooter>
                          <MetadataWidget label="Bottom" value="Footer" color="gray" />
                        </S.LayoutFooter>
                      }
                    >
                      <S.LayoutCenter>
                        <MetadataWidget label="Center" value="Main content" color="green" />
                      </S.LayoutCenter>
                    </BorderLayoutWidget>
                  </S.LayoutFrame>

                  <S.LayoutFrame>
                    <BorderLayoutWidget
                      top={
                        <S.LayoutHeader>
                          <MetadataWidget label="Top" value="Toolbar" color="orange" />
                        </S.LayoutHeader>
                      }
                    >
                      <S.LayoutCenter>
                        <S.Column>
                          <MetadataWidget label="Center" value="Scrollable area" color="blue" />
                          <MetaBarWidget
                            meta={[
                              { label: 'Rows', value: '3', color: 'purple' },
                              { label: 'Pinned', value: 'true', color: 'green' }
                            ]}
                          />
                        </S.Column>
                      </S.LayoutCenter>
                    </BorderLayoutWidget>
                  </S.LayoutFrame>
                </S.LayoutGrid>
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

  export const Column = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;

  export const Row = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `;

  export const SectionTitle = styled.div`
    font-size: 12px;
    color: ${(p) => p.theme.text.secondary};
    margin-bottom: 4px;
  `;

  export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  `;

  export const LayoutGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  `;

  export const LayoutFrame = styled(SurfaceWidget)`
    height: 180px;
    overflow: hidden;
  `;

  export const LayoutHeader = styled.div`
    padding: 8px;
    border-bottom: solid 1px ${(p) => p.theme.panels.divider};
  `;

  export const LayoutFooter = styled.div`
    padding: 8px;
    border-top: solid 1px ${(p) => p.theme.panels.divider};
  `;

  export const LayoutCenter = styled.div`
    padding: 10px;
    height: 100%;
    display: flex;
    align-items: flex-start;
  `;
}
