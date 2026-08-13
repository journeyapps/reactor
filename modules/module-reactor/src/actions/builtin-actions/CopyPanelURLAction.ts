import { Action, ActionEvent } from '../Action';
import { inject } from '../../inversify.config';
import { WorkspaceStore } from '../../stores/workspace/WorkspaceStore';
import { copyTextToClipboard } from '@journeyapps/reactor-lib-utils';

export class CopyPanelURLAction extends Action {
  @inject(WorkspaceStore)
  accessor workspaceStore: WorkspaceStore;

  constructor() {
    super({
      id: 'COPY_URL',
      name: 'Copy URL',
      tags: ['internal', 'workspace', 'sharing'],
      icon: 'clipboard'
    });
  }

  async fireEvent(event: ActionEvent): Promise<any> {
    const myURL = new URL(window.location.href);
    myURL.hash = this.workspaceStore.getActivePanelHash();
    const url = myURL.toString();
    copyTextToClipboard(url);
  }
}
