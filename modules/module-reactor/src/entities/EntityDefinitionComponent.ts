import { EntityDefinition } from './EntityDefinition';
import { BaseObserver } from '@journeyapps/common-utils';

export abstract class EntityDefinitionComponent<T = any> extends BaseObserver<T> {
  definition: EntityDefinition;

  constructor(public type: string) {
    super();
  }

  get system() {
    return this.definition.system;
  }

  setDefinition(definition: EntityDefinition) {
    this.definition = definition;
  }
}
