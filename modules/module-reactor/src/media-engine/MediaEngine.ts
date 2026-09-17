import { AbstractMediaType, MediaTypeMatcher } from './AbstractMediaType';
import { WorkspaceStore } from '../stores/workspace/WorkspaceStore';
import { AbstractMedia } from './AbstractMedia';
import * as _ from 'lodash';

export interface MediaLoader {
  canLoadMedia: (uid: string) => boolean;
  loadMedia: (uid: string) => Promise<AbstractMedia>;
}

/**
 * Stores media types which handle their own capabilities
 */
export class MediaEngine {
  protected types: { [mime: string]: AbstractMediaType };
  protected mediaLoaders: Set<MediaLoader>;

  constructor(protected workspaceStore: WorkspaceStore) {
    this.types = {};
    this.mediaLoaders = new Set();
  }

  registerMediaType(type: AbstractMediaType) {
    this.types[type.options.mime] = type;
    this.workspaceStore.registerFactory(type.generatePanelFactory());
  }

  getMediaTypeForPath = _.memoize((path: string) => {
    return this.getMediaType({ path });
  });

  getMediaTypes() {
    return this.types;
  }

  getMediaType(matcher: MediaTypeMatcher): AbstractMediaType | null {
    const mimeType = Object.values(this.types).find((type) => type.matchesMime(matcher.mime));
    if (mimeType) {
      return mimeType;
    }
    for (let mime in this.types) {
      const type = this.types[mime];
      if (type.matches(matcher)) {
        return type;
      }
    }
    return null;
  }

  async loadMediaForID<M extends AbstractMedia>(id: string): Promise<M> {
    const loaded = await Promise.all(
      Array.from(this.mediaLoaders.values())
        .filter((l) => l.canLoadMedia(id))
        .map((l) => l.loadMedia(id))
    );
    return loaded.find((l) => !!l) as M;
  }

  registerMediaLoader(loader: MediaLoader) {
    this.mediaLoaders.add(loader);
  }
}
