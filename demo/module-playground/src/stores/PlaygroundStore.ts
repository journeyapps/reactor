import { AbstractStore } from '@journeyapps/reactor-mod';

export class PlaygroundStore extends AbstractStore {
  constructor() {
    super({ name: 'PLAYGROUND_STORE' });
  }
}
