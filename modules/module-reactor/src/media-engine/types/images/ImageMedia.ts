import { AbstractMedia, AbstractMediaOptions } from '../../AbstractMedia';
import { v4 } from 'uuid';
import * as _ from 'lodash';
import { Jimp } from 'jimp';

export interface ImageMediaURL {
  url: string;
  dispose();
}

export class ImageMedia extends AbstractMedia {
  private imageURL: string;
  private listeners: { [key: string]: ImageMediaURL };

  constructor(options: AbstractMediaOptions) {
    super(options);
    this.listeners = {};
  }

  getPreview = _.memoize(
    async (options: { maxWidth: number; maxHeight: number }): Promise<string> => {
      const contents = await this.toArrayBuffer();
      const image = await Jimp.fromBuffer(contents.slice().buffer);
      image.scaleToFit({ w: options.maxWidth, h: options.maxHeight });
      return image.getBase64('image/png');
    },
    (options) => `${options.maxWidth}x${options.maxHeight}`
  );

  /**
   * Like `getImageURL` except this also tests the url
   */
  loadImageURL(): Promise<ImageMediaURL> {
    return new Promise<ImageMediaURL>(async (resolve, reject) => {
      const url = await this.getImageURL();
      const tester = new Image();
      tester.onload = () => {
        resolve(url);
      };
      tester.onerror = () => {
        url.dispose();
        reject();
      };
      tester.src = url.url;
    });
  }

  async getImageURL(): Promise<ImageMediaURL> {
    if (!this.imageURL) {
      const contents = await this.toArrayBuffer();
      const blob = new Blob([contents], { type: this.options.type.options.mime });
      this.imageURL = window.URL.createObjectURL(blob);
    }

    const id = v4();
    this.listeners[id] = {
      dispose: () => {
        delete this.listeners[id];
        if (Object.keys(this.listeners).length === 0) {
          // cleanup after all consumers are done with it otherwise memory LEAK :gasp:
          window.URL.revokeObjectURL(this.imageURL);
          this.imageURL = null;
        }
      },
      url: this.imageURL
    };
    return this.listeners[id];
  }
}
