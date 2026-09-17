import * as React from 'react';
import { useEffect } from 'react';
import { useDelay } from '../../hooks/useDelay';
import { ioc } from '../../inversify.config';
import { DNDStore } from '../../stores/dnd/DNDStore';

export interface UseDroppableRawOptions<T extends { [key: string]: any } = {}> {
  dropped?: (event: { files: File[]; entities: T; event: DragEvent }) => any;
  dragover?: () => any;
  dragexit?: () => any;
  accepts: (mimes: readonly string[]) => boolean;
  forwardRef: React.RefObject<HTMLDivElement>;
  key?: string;
}

export const useDroppableRaw = <T extends { [key: string]: string } = {}>(
  props: UseDroppableRawOptions<T>,
  deps = []
) => {
  const delay = useDelay();
  useEffect(() => {
    const dragOver = (event: DragEvent) => {
      if (props.accepts(event.dataTransfer.types)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'link';
        if (!delay.isPending()) {
          props.dragover?.();
        }
        delay.schedule(() => {
          props.dragexit?.();
        }, 50);
      }
    };

    const drop = async (event: DragEvent) => {
      let files = [];
      let res = {} as any;
      for (let mime of event.dataTransfer.types) {
        res[mime] = event.dataTransfer.getData(mime);
      }

      if (event.dataTransfer.files) {
        files = Array.from(event.dataTransfer.files);
      }

      try {
        event.preventDefault();
        await props.dropped?.({
          files,
          entities: res,
          event
        });
      } catch (ex) {
        ioc.get(DNDStore).logger.warn('Failed to process dropped data', Array.from(event.dataTransfer.types), ex);
      }
    };

    props.forwardRef.current.addEventListener('dragover', dragOver);
    props.forwardRef.current.addEventListener('drop', drop);

    return () => {
      delay.cancel();
      props.forwardRef.current?.removeEventListener('dragover', dragOver);
      props.forwardRef.current?.removeEventListener('drop', drop);
    };
  }, [props.forwardRef, delay, ...deps]);
};
