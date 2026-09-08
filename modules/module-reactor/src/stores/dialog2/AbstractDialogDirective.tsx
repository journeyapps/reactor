import * as React from 'react';
import { Btn } from '../../definitions/common';
import { DialogWidget } from '../../layers/dialog/DialogWidget';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import styled from '@emotion/styled';
import { v4 } from 'uuid';
import { BaseObserver } from '@journeyapps/common-utils';

export interface AbstractDialogDirectiveListener {
  disposed: (event: { canceled: boolean }) => any;
}

export interface AbstractDialogDirectiveOptions {
  title?: string;
  markdown?: string;
}

export abstract class AbstractDialogDirective<
  T extends AbstractDialogDirectiveOptions = AbstractDialogDirectiveOptions,
  L extends AbstractDialogDirectiveListener = AbstractDialogDirectiveListener
> extends BaseObserver<L> {
  @observable
  accessor title: string;

  @observable
  accessor markdown: string;

  @observable
  accessor loading: boolean;

  public id: string;

  constructor(protected options: T) {
    super();
    this.title = options.title;
    this.markdown = options.markdown;
    this.loading = false;
    this.id = v4();
  }

  dispose(canceled: boolean = true) {
    this.iterateListeners((cb) =>
      cb.disposed?.({
        canceled
      })
    );
  }

  abstract generateContent(): React.JSX.Element;

  abstract getButtons(): Btn[];

  generateWidget() {
    return <DialogWrapperWidget directive={this} />;
  }
}

export interface DialogWrapperWidgetProps {
  directive: AbstractDialogDirective;
}

export const DialogWrapperWidget: React.FC<DialogWrapperWidgetProps> = observer((props) => {
  return (
    <S.Dialog
      loading={props.directive.loading}
      btns={props.directive.getButtons()}
      title={props.directive.title}
      markdown={props.directive.markdown}
    >
      {props.directive.generateContent()}
    </S.Dialog>
  );
});

namespace S {
  export const Dialog = styled(DialogWidget)<{ loading: boolean }>`
    opacity: ${(p) => (p.loading ? 0.5 : 1)};
    filter: ${(p) => (p.loading ? 'blur(1px)' : 'none')};
    transition:
      0.5s filter linear,
      opacity 0.3s linear;
  `;
}
