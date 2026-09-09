import * as React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReactorTooltipWidget, TooltipState } from '../../src/widgets/info/tooltips';

const overlay = vi.hoisted(() => ({ enabled: false }));
vi.mock('../../src/hooks/useAnchoredOverlay', () => ({
  useAnchoredOverlay: (options: { enabled: boolean }) => {
    overlay.enabled = options.enabled;
    return { ref: null };
  }
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function renderTooltip(copied = false) {
  act(() => {
    root.render(
      <ReactorTooltipWidget
        tooltip={copied ? 'Copied!' : 'Copy value'}
        tooltipState={copied ? TooltipState.SHOW : undefined}
      >
        <button>Copy</button>
      </ReactorTooltipWidget>
    );
  });
}

function movePointer(type: 'mouseover' | 'mouseout') {
  act(() => {
    container
      .querySelector('button')!
      .dispatchEvent(new MouseEvent(type, { bubbles: true, relatedTarget: document.body }));
  });
}

describe('copy tooltip visibility', () => {
  it('closes after forced feedback expires when the pointer has already left', () => {
    renderTooltip();
    movePointer('mouseover');
    renderTooltip(true);
    movePointer('mouseout');
    expect(overlay.enabled).toBe(true);

    renderTooltip();
    expect(overlay.enabled).toBe(false);
  });

  it('keeps the normal tooltip while hovered, then closes on leaving', () => {
    renderTooltip();
    movePointer('mouseover');
    renderTooltip(true);
    renderTooltip();
    expect(overlay.enabled).toBe(true);

    movePointer('mouseout');
    expect(overlay.enabled).toBe(false);
  });
});
