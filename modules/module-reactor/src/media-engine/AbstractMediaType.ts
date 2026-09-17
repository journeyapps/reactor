import * as _ from 'lodash';
import { AbstractMedia, AbstractMediaOptions } from './AbstractMedia';
import { WorkspaceStore } from '../stores/workspace/WorkspaceStore';
import { inject } from '../inversify.config';
import { ReactorIcon } from '../widgets/icons/IconWidget';
import { ReactorPanelFactory } from '../stores/workspace/react-workspaces/ReactorPanelFactory';
import { ReactorPanelModel } from '../stores/workspace/react-workspaces/ReactorPanelModel';

export interface AbstractMediaTypeOptions {
  mime: string;
  extensions: string[];
  displayName: string;
  icon: ReactorIcon;
}

export type GenerateMediaOptions = Omit<AbstractMediaOptions, 'type'>;

export interface MediaTypeMatcher {
  path?: string;
  mime?: string;
}

export abstract class AbstractMediaType<T extends AbstractMedia = AbstractMedia> {
  readonly options: AbstractMediaTypeOptions;

  @inject(WorkspaceStore)
  accessor workspaceStore: WorkspaceStore;

  constructor(options: AbstractMediaTypeOptions) {
    this.options = options;
  }

  matchesMime(mime?: string): boolean {
    return !!mime && mime.split(';')[0].trim().toLowerCase() === this.options.mime.trim().toLowerCase();
  }

  matches(options: MediaTypeMatcher): boolean {
    if (this.matchesMime(options.mime)) {
      return true;
    }
    const name = (options.path || '').split(/[\\/]/).pop();
    const dot = name.lastIndexOf('.');
    if (dot === -1) {
      return false;
    }
    const suffix = `.${name
      .slice(dot + 1)
      .trim()
      .toLowerCase()}`;
    return _.some(this.options.extensions, (extension) => {
      return suffix === extension.trim().toLowerCase();
    });
  }

  abstract generatePanelFactory(): ReactorPanelFactory;

  abstract generateModel(media: T): ReactorPanelModel;

  abstract generateMedia(options: GenerateMediaOptions): T;

  openMedia(media: T) {
    const model = this.generateModel(media);
    this.workspaceStore.addModel(model);
  }
}
