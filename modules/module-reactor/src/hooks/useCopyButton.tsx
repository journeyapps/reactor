import { useEffect, useState } from 'react';
import { Btn } from '../definitions/common';
import { copyTextToClipboard } from '@journeyapps/reactor-lib-utils';
import { TooltipState } from '../widgets/info/tooltips';

export interface UseCopyButtonProps {
  value: string;
}

export const useCopyButton = (props: UseCopyButtonProps): Partial<Btn> => {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (copied) {
      const res = setTimeout(() => {
        setCopied(false);
      }, 1000);
      return () => {
        clearTimeout(res);
      };
    }
  }, [copied]);

  return {
    action: () => {
      copyTextToClipboard(props.value);
      setCopied(true);
    },
    tooltip: copied ? 'Copied!' : 'Copy value',
    tooltipState: copied ? TooltipState.SHOW : null
  };
};
