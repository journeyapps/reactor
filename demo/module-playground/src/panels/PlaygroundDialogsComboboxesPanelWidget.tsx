import * as React from 'react';
import { observer } from 'mobx-react';
import {
  CardWidget,
  ComboBoxItem,
  ComboBoxStore2,
  DialogStore,
  DialogStore2,
  FormDialogDirective,
  InlineDialogDirective,
  NotificationStore,
  NotificationType,
  PanelButtonMode,
  PanelButtonWidget,
  ReactorPanelModel,
  SearchEngine,
  SearchEngineComboBoxDirective,
  SimpleComboBoxDirective,
  System,
  TableRow,
  TableWidget,
  ioc,
  styled
} from '@journeyapps-labs/reactor-mod';
import { PaginatedCollection, PaginatedSearchResultEntry } from '@journeyapps-labs/lib-reactor-data-layer';
import { createSearchEventMatcherBool, SearchResult } from '@journeyapps-labs/lib-reactor-search';
import { TodoEntities, TodoModel, TodoStore } from '@journeyapps-labs/reactor-mod-todos';
import { DemoFormModel } from '../forms/DemoFormModel';
import { PlaygroundStore } from '../stores/PlaygroundStore';

export interface PlaygroundDialogsComboboxesPanelWidgetProps {
  model: ReactorPanelModel;
}

const TOP_LEVEL_ITEMS: ComboBoxItem[] = [
  {
    key: 'coffee',
    title: 'Coffee',
    group: 'Drinks',
    right: <span style={{ fontSize: 11, opacity: 0.6 }}>42</span>,
    children: [
      {
        key: 'coffee-hot',
        title: 'Hot',
        group: 'Temperature',
        children: [
          { key: 'coffee-hot-americano', title: 'Americano', group: 'Espresso bar' },
          { key: 'coffee-hot-flat-white', title: 'Flat White', group: 'Espresso bar' },
          { key: 'coffee-hot-cappuccino', title: 'Cappuccino', group: 'Espresso bar' }
        ]
      },
      {
        key: 'coffee-iced',
        title: 'Iced',
        group: 'Temperature',
        children: [
          { key: 'coffee-iced-latte', title: 'Iced Latte', group: 'Cold espresso' },
          { key: 'coffee-iced-mocha', title: 'Iced Mocha', group: 'Cold espresso' },
          { key: 'coffee-iced-cold-brew', title: 'Cold brew', group: 'Cold espresso' }
        ]
      },
      { key: 'coffee-drip', title: 'Filter / Drip', group: 'Brew method' },
      { key: 'coffee-espresso-shot', title: 'Espresso shot', group: 'Brew method' }
    ]
  },
  {
    key: 'tea',
    title: 'Tea',
    group: 'Drinks',
    right: <span style={{ fontSize: 11, opacity: 0.6 }}>33</span>,
    children: [
      { key: 'tea-green', title: 'Green', group: 'Tea family' },
      { key: 'tea-black', title: 'Black', group: 'Tea family' },
      { key: 'tea-herbal', title: 'Herbal', group: 'Tea family' }
    ]
  },
  {
    key: 'pastry',
    title: 'Pastry',
    group: 'Food',
    right: <span style={{ fontSize: 11, opacity: 0.6 }}>12</span>
  },
  {
    key: 'retail-mug',
    title: 'House mug',
    group: 'Retail',
    right: <span style={{ fontSize: 11, opacity: 0.6 }}>leaf</span>
  }
];

const COMPACT_NESTED_ITEMS: ComboBoxItem[] = [
  {
    key: 'compact-projects',
    title: 'Projects',
    children: [
      { key: 'compact-create-project', title: 'Create project' },
      { key: 'compact-import-project', title: 'Import project' }
    ]
  },
  {
    key: 'compact-developers',
    title: 'Developers',
    children: [
      { key: 'compact-create-developer', title: 'Create developer' },
      { key: 'compact-invite-developer', title: 'Invite developer' }
    ]
  }
];

const PROGRESSIVE_SEARCH_PAGES: ComboBoxItem[][] = [
  [
    { key: 'deployment-cape-town', title: 'Cape Town production' },
    { key: 'deployment-denver', title: 'Denver production' }
  ],
  [
    { key: 'deployment-london', title: 'London staging' },
    { key: 'deployment-sydney', title: 'Sydney staging' }
  ],
  [
    { key: 'deployment-tokyo', title: 'Tokyo development' },
    { key: 'deployment-toronto', title: 'Toronto development' }
  ]
];

interface ProgressiveSearchPage {
  items: ComboBoxItem[];
  more: boolean;
}

const waitForPage = (abort: AbortSignal) => {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, 900);
    abort.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true }
    );
  });
};

async function* loadProgressiveSearchPages(abort: AbortSignal): AsyncGenerator<ProgressiveSearchPage> {
  for (const [index, items] of PROGRESSIVE_SEARCH_PAGES.entries()) {
    await waitForPage(abort);
    if (abort.aborted) return;
    yield {
      items,
      more: index < PROGRESSIVE_SEARCH_PAGES.length - 1
    };
  }
}

class ProgressiveComboBoxSearchEngine extends SearchEngine<SearchResult<PaginatedSearchResultEntry<ComboBoxItem>>> {
  search(event) {
    const abort = new AbortController();
    const collection = new PaginatedCollection<ComboBoxItem, ProgressiveSearchPage>({
      loaderIterator: () => loadProgressiveSearchPages(abort.signal),
      transformer: (page) => page.items,
      hasMore: (page) => page.more
    });
    const matcher = createSearchEventMatcherBool(event.value, { nullIsTrue: true });

    void collection.loadAll(undefined, { abort });
    const result = collection.asSearchResult({
      idTransformer: (item) => item.key,
      match: (item) => matcher(item.title)
    });
    result.registerListener({
      dispose: () => abort.abort()
    });
    return result;
  }
}

interface DialogTableRow extends TableRow {
  cells: {
    row: number;
    name: string;
    status: string;
  };
}

const DIALOG_TABLE_ROWS: DialogTableRow[] = Array.from({ length: 400 }, (_, index) => ({
  key: `dialog-table-row-${index + 1}`,
  cells: {
    row: index + 1,
    name: `Dialog table row ${index + 1}`,
    status: index % 3 === 0 ? 'Pending' : index % 3 === 1 ? 'Processing' : 'Complete'
  }
}));

export const PlaygroundDialogsComboboxesPanelWidget: React.FC<PlaygroundDialogsComboboxesPanelWidgetProps> = observer(
  () => {
    const dialogStore = ioc.get(DialogStore);
    const dialogStore2 = ioc.get(DialogStore2);
    const comboBoxStore2 = ioc.get(ComboBoxStore2);
    const notificationStore = ioc.get(NotificationStore);
    const logger = ioc.get(PlaygroundStore).logger.childLogger('Dialogs');

    const runMessageDialog = async () => {
      await dialogStore.showMessageDialog({
        title: 'Message dialog',
        message: 'This is a basic message dialog from the legacy dialog store.'
      });
    };

    const runConfirmDialog = async () => {
      const confirmed = await dialogStore.showConfirmDialog({
        title: 'Confirm dialog',
        message: 'Do you want to keep testing dialog flows?'
      });

      await dialogStore.showMessageDialog({
        title: 'Confirm result',
        message: confirmed ? 'Confirmed' : 'Canceled'
      });
    };

    const runInputDialog = async () => {
      const value = await dialogStore.showInputDialog({
        title: 'Input dialog',
        message: 'Provide a value to test input dialog behavior',
        initialValue: 'example-value'
      });

      await dialogStore.showMessageDialog({
        title: 'Input result',
        message: value == null ? 'No value entered' : `Input: ${value}`
      });
    };

    const runFormDialog = async () => {
      const directive = new FormDialogDirective({
        title: 'Demo form dialog',
        form: new DemoFormModel(),
        handler: async (form) => logger.info('Demo form submitted', form.value())
      });

      await dialogStore2.showDialog(directive);
    };

    const runTableDialog = async () => {
      await dialogStore2.showDialog(
        new InlineDialogDirective({
          title: 'Large table dialog',
          markdown: '400 rows to test a dialog larger than the OXIDE viewport.',
          generateContent: () => (
            <S.TableDialogContent>
              <TableWidget
                columns={[
                  { key: 'row', display: 'Row', shrink: true },
                  { key: 'name', display: 'Name' },
                  { key: 'status', display: 'Status', shrink: true }
                ]}
                rows={DIALOG_TABLE_ROWS}
              />
            </S.TableDialogContent>
          )
        })
      );
    };

    const runFlattenedSearchDemo = async (position: any) => {
      await comboBoxStore2.show(
        new SimpleComboBoxDirective({
          title: 'Flattened nested search',
          subtitle: 'Search for “Americano” or “Cold brew”',
          event: position,
          items: TOP_LEVEL_ITEMS
        })
      );
    };

    const runCompactNestedDemo = async (position: any) => {
      await comboBoxStore2.show(
        new SimpleComboBoxDirective({
          title: 'Compact nested menu',
          subtitle: 'Four leaf actions do not warrant search',
          event: position,
          items: COMPACT_NESTED_ITEMS
        })
      );
    };

    const runProgressiveSearchDemo = async (position: any) => {
      await comboBoxStore2.show(
        new SearchEngineComboBoxDirective<PaginatedSearchResultEntry<ComboBoxItem>, ComboBoxItem>({
          title: 'Progressive deployment search',
          event: position,
          engine: new ProgressiveComboBoxSearchEngine(),
          transformResult: (result) => result.item,
          loadingMessage: 'Loading deployments...',
          loadingMoreMessage: 'Loading more deployments...'
        })
      );
    };

    const runEntityContextComboDemo = async (position: any) => {
      const todoStore = ioc.get<TodoStore>(TodoStore);
      const entity = todoStore.activeTodo || todoStore.todos[0];
      if (!entity) {
        await dialogStore.showMessageDialog({
          title: 'No todo items',
          message: 'Create at least one todo item first.'
        });
        return;
      }

      const definition = ioc.get(System).getDefinition<TodoModel>(TodoEntities.TODO_ITEM);
      definition.showContextMenuForEntity(entity, position);
    };

    const showInfoNotification = () => {
      notificationStore.showNotification({
        type: NotificationType.INFO,
        title: 'Info notification',
        description: 'This is a standard info notification from NotificationStore.'
      });
    };

    const showSuccessNotification = () => {
      notificationStore.showNotification({
        type: NotificationType.SUCCESS,
        title: 'Success notification',
        description: 'The action completed successfully.'
      });
    };

    const showErrorNotification = () => {
      notificationStore.showNotification({
        type: NotificationType.ERROR,
        title: 'Error notification',
        description: 'Something went wrong while processing the action.'
      });
    };

    const showValidationNotification = () => {
      notificationStore.showNotification({
        type: NotificationType.VALIDATION,
        title: 'Validation notification',
        description: 'Validation produced warnings and errors.',
        validationResult: {
          errors: ['Todo title is required', 'Owner must be selected'],
          warnings: ['Description is shorter than recommended minimum']
        }
      });
    };

    return (
      <S.Container>
        <CardWidget
          title="Dialogs"
          subHeading="Legacy + directive dialog test flows"
          sections={[
            {
              key: 'dialog-actions',
              content: () => {
                return (
                  <S.Buttons>
                    <PanelButtonWidget label="Message" icon="comment" action={runMessageDialog} />
                    <PanelButtonWidget label="Confirm" icon="question-circle" action={runConfirmDialog} />
                    <PanelButtonWidget label="Input" icon="keyboard" action={runInputDialog} />
                    <PanelButtonWidget
                      label="Form dialog"
                      icon="list"
                      action={runFormDialog}
                      mode={PanelButtonMode.PRIMARY}
                    />
                    <PanelButtonWidget label="Large table dialog" icon="table" action={runTableDialog} />
                  </S.Buttons>
                );
              }
            }
          ]}
        />

        <CardWidget
          title="Comboboxes"
          subHeading="Hierarchical browsing with threshold-based flattened search"
          sections={[
            {
              key: 'flattened-search-demo',
              content: () => {
                return (
                  <S.Demo>
                    <S.DemoCopy>
                      <strong>Flattened descendant search</strong>
                      <span>
                        The empty menu stays hierarchical. Searching returns leaf results such as “Coffee › Hot ›
                        Americano”.
                      </span>
                    </S.DemoCopy>
                    <S.Buttons>
                      <PanelButtonWidget
                        label="Open flattened search"
                        icon="search"
                        action={runFlattenedSearchDemo}
                        mode={PanelButtonMode.PRIMARY}
                      />
                      <PanelButtonWidget
                        label="Open entity context menu"
                        icon="cube"
                        action={runEntityContextComboDemo}
                      />
                    </S.Buttons>
                  </S.Demo>
                );
              }
            },
            {
              key: 'progressive-search-demo',
              content: () => {
                return (
                  <S.Demo>
                    <S.DemoCopy>
                      <strong>Progressive search results</strong>
                      <span>
                        <code>PaginatedCollection.asSearchResult()</code> keeps earlier pages usable while more results
                        load.
                      </span>
                    </S.DemoCopy>
                    <S.Buttons>
                      <PanelButtonWidget
                        label="Open progressive search"
                        icon="spinner"
                        action={runProgressiveSearchDemo}
                        mode={PanelButtonMode.PRIMARY}
                      />
                    </S.Buttons>
                  </S.Demo>
                );
              }
            },
            {
              key: 'compact-hierarchy-demo',
              content: () => {
                return (
                  <S.Demo>
                    <S.DemoCopy>
                      <strong>Compact hierarchy</strong>
                      <span>With only four descendant leaves, the same directive omits the search field.</span>
                    </S.DemoCopy>
                    <S.Buttons>
                      <PanelButtonWidget label="Open compact hierarchy" icon="sitemap" action={runCompactNestedDemo} />
                    </S.Buttons>
                  </S.Demo>
                );
              }
            }
          ]}
        />

        <CardWidget
          title="Notifications"
          subHeading="NotificationStore demo for info, success, error and validation"
          sections={[
            {
              key: 'notification-actions',
              content: () => {
                return (
                  <S.Buttons>
                    <PanelButtonWidget label="Info" icon="info-circle" action={showInfoNotification} />
                    <PanelButtonWidget label="Success" icon="check" action={showSuccessNotification} />
                    <PanelButtonWidget label="Error" icon="warning" action={showErrorNotification} />
                    <PanelButtonWidget
                      label="Validation"
                      icon="list-alt"
                      action={showValidationNotification}
                      mode={PanelButtonMode.PRIMARY}
                    />
                  </S.Buttons>
                );
              }
            }
          ]}
        />
      </S.Container>
    );
  }
);

namespace S {
  export const TableDialogContent = styled.div`
    min-width: 560px;
  `;

  export const Container = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
  `;

  export const Buttons = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `;

  export const Demo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;

  export const DemoCopy = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: ${(p) => p.theme.text.secondary};

    strong {
      color: ${(p) => p.theme.text.primary};
    }
  `;
}
