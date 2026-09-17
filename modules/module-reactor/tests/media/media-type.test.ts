import { describe, expect, it } from 'vitest';
import { AbstractMediaType } from '../../src/media-engine/AbstractMediaType';
import { MediaEngine } from '../../src/media-engine/MediaEngine';

class TestMediaType extends AbstractMediaType {
  generatePanelFactory() {
    return null;
  }

  generateModel() {
    return null;
  }

  generateMedia() {
    return null;
  }
}

describe('media type matching', () => {
  const type = new TestMediaType({
    mime: 'image/jpeg',
    extensions: ['.jpg', ' .JPEG '],
    displayName: 'JPEG',
    icon: 'image'
  });

  it.each([
    'photo.jpg',
    'photo.JPG',
    'photo.JpG',
    'photo.jpeg',
    'photo.JPEG',
    '/images/photo.edit.Jpeg',
    'photo. JPG '
  ])('matches supported extensions regardless of case: %s', (path) => {
    expect(type.matches({ path })).toBe(true);
  });

  it.each(['image/jpeg', ' IMAGE/JPEG ', 'image/jpeg; charset=binary'])(
    'matches MIME without a filename: %s',
    (mime) => {
      expect(type.matches({ mime })).toBe(true);
    }
  );

  it('falls back to the extension when MIME is missing or unrecognized', () => {
    expect(type.matches({ path: 'photo.jpg', mime: '' })).toBe(true);
    expect(type.matches({ path: 'photo.jpg', mime: 'application/octet-stream' })).toBe(true);
    expect(type.matches({ mime: 'image/png' })).toBe(false);
    expect(type.matches({})).toBe(false);
  });

  it('prefers a registered MIME over a conflicting filename extension', () => {
    const engine = new MediaEngine({ registerFactory: () => {} } as any);
    const png = new TestMediaType({
      mime: 'image/png',
      extensions: ['.png'],
      displayName: 'PNG',
      icon: 'image'
    });
    engine.registerMediaType(png);
    engine.registerMediaType(type);

    expect(engine.getMediaType({ path: 'photo.png', mime: ' IMAGE/JPEG ' })).toBe(type);
    expect(engine.getMediaType({ path: 'photo. JPG ', mime: 'application/octet-stream' })).toBe(type);
    expect(engine.getMediaType({ mime: 'image/png' })).toBe(png);
    expect(engine.getMediaType({ path: 'document.txt' })).toBeNull();
  });

  it.each(['photo.png', 'photo', 'photojpg', 'photo.jpg.txt', '/images.jpg/photo.png', ''])(
    'rejects paths without a supported final extension: %s',
    (path) => {
      expect(type.matches({ path })).toBe(false);
    }
  );
});
