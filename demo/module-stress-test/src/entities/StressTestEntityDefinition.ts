import {
  DescendantEntityProviderComponent,
  EntityDefinition,
  EntityDescriberComponent,
  EntityPanelComponent,
  InlineTreePresenterComponent,
  SearchableTreeSearchScope,
  SimpleEntitySearchEngineComponent
} from '@journeyapps/reactor-mod';
import { StressTestModel } from '../models/StressTestModel';
import { StressTestEntities } from '../StressTestEntities';
import * as _ from 'lodash';

export class StressTestEntityDefinition extends EntityDefinition<StressTestModel> {
  models: StressTestModel[];

  constructor() {
    super({
      type: StressTestEntities.STRESS_MODEL,
      category: 'Stress Test',
      label: 'Stress Test Item',
      icon: 'bolt',
      iconColor: 'red'
    });
    this.models = _.range(0, 30).map((m) => new StressTestModel());

    // describe todos using the simple name (this is what is used in the tree presenter)
    this.registerComponent(
      new EntityDescriberComponent<StressTestModel>({
        label: 'Simple',
        describe: (entity: StressTestModel) => {
          return {
            simpleName: entity.label
          };
        }
      })
    );

    // provide todos to action parameter resolvers
    this.registerComponent(
      new SimpleEntitySearchEngineComponent<StressTestModel>({
        label: 'Simple',
        getEntities: async () => {
          return this.models;
        }
      })
    );

    // allow the todos to be represented as tree items
    this.registerComponent(
      new InlineTreePresenterComponent<StressTestModel>({
        label: 'uncached',
        cacheTreeEntities: false,
        loadChildrenAsNodesAreOpened: true,
        searchScope: SearchableTreeSearchScope.VISIBLE_ONLY
      })
    );

    this.registerComponent(
      new InlineTreePresenterComponent<StressTestModel>({
        label: 'cached',
        cacheTreeEntities: true,
        loadChildrenAsNodesAreOpened: true,
        searchScope: SearchableTreeSearchScope.VISIBLE_ONLY
      })
    );

    // by default let reactor set up a todos panel and use the tree presenter above
    this.registerComponent(
      new EntityPanelComponent<StressTestModel>({
        label: 'Stress Test',
        getEntities: () => {
          return this.models;
        }
      })
    );

    // by default let reactor set up a todos panel and use the tree presenter above
    this.registerComponent(
      new DescendantEntityProviderComponent<StressTestModel, StressTestModel>({
        descendantType: StressTestEntities.STRESS_MODEL,
        generateOptions: (model) => {
          return {
            category: {
              label: 'children'
            },
            descendants: model.children
          };
        }
      })
    );
  }
  matchEntity(t: any): boolean {
    if (t instanceof StressTestModel) {
      return true;
    }
  }

  getEntityUID(t: StressTestModel) {
    return t.uid;
  }
}
