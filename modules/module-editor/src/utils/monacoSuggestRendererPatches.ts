import { ItemRenderer as MonacoSuggestItemRenderer } from 'monaco-editor/editor/contrib/suggest/browser/suggestWidgetRenderer';
import { ReactorIcon } from '@journeyapps/reactor-mod';

export interface MonacoSuggestRendererPatchEvent {
  element: any;
  index: number;
  data: any;
}

export interface ReactorSuggestCompletionItem {
  reactorIcon?: ReactorIcon;
  reactorIconColor?: string;
}

export interface MonacoSuggestIconOverrideResult {
  iconClass: string;
  iconColor?: string;
}

export type MonacoSuggestIconOverrideTransform<T extends ReactorSuggestCompletionItem = ReactorSuggestCompletionItem> =
  (completion: T) => MonacoSuggestIconOverrideResult | null | undefined;

export type MonacoSuggestRendererPatch = (event: MonacoSuggestRendererPatchEvent) => void;

const patches: MonacoSuggestRendererPatch[] = [];
let installed = false;

function installRendererPatchIfNeeded() {
  if (installed) {
    return;
  }
  installed = true;

  const rendererPrototype = MonacoSuggestItemRenderer?.prototype as any;
  if (!rendererPrototype || rendererPrototype.__reactorSuggestRendererPatchesInstalled) {
    return;
  }

  const originalRenderElement = rendererPrototype.renderElement;
  rendererPrototype.renderElement = function (element: any, index: number, data: any) {
    originalRenderElement.call(this, element, index, data);
    for (const patch of patches) {
      try {
        patch({ element, index, data });
      } catch (error) {
        // Individual patch errors should never break Monaco suggest rendering.
      }
    }
  };

  rendererPrototype.__reactorSuggestRendererPatchesInstalled = true;
}

export function registerMonacoSuggestRendererPatch(patch: MonacoSuggestRendererPatch): () => void {
  patches.push(patch);
  installRendererPatchIfNeeded();

  return () => {
    const index = patches.indexOf(patch);
    if (index >= 0) {
      patches.splice(index, 1);
    }
  };
}

export function registerMonacoSuggestIconOverride<
  T extends ReactorSuggestCompletionItem = ReactorSuggestCompletionItem
>(transform: MonacoSuggestIconOverrideTransform<T>): () => void {
  return registerMonacoSuggestRendererPatch(({ element, data }) => {
    const completion = element?.completion as T | undefined;
    const iconContainer = data?.iconContainer as HTMLElement | undefined;
    if (!iconContainer) {
      return;
    }
    // Monaco reuses list row DOM nodes. Remove previously injected custom icon markup
    // so non-reactor items render with Monaco's default icon classes.
    if (iconContainer.childElementCount > 0) {
      iconContainer.innerHTML = '';
    }
    iconContainer.style.color = '';

    if (!completion) {
      return;
    }

    const iconOverride = transform(completion);
    if (!iconOverride?.iconClass) {
      return;
    }

    iconContainer.className = 'icon-label reactor-suggest-icon';
    iconContainer.style.display = 'inline-flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = '16px';
    iconContainer.style.height = '16px';
    iconContainer.style.color = iconOverride.iconColor || '';
    iconContainer.innerHTML = `<i class="${iconOverride.iconClass}"></i>`;
  });
}
