import * as React from 'react';
import { DialogWidget } from './DialogWidget';
import { InputTransformedWidget } from './InputTransformedWidget';
import { getTransparentColor } from '@journeyapps/reactor-lib-utils';
import { themed } from '../../stores/themes/reactor-theme-fragment';
import { Btn } from '../../definitions/common';
import { REACTOR_MOBILE_MEDIA_QUERY } from '../../hooks/useReactorViewportMode';

export enum InputDialogType {
  FIELD = 'field',
  TEXT_AREA = 'textarea'
}

export interface InputDialogWidgetProps {
  submit: (data: string) => any;
  submitBtn: Partial<Btn>;
  cancelBtn: Partial<Btn>;
  defaultValue: string;
  title: string;
  desc: string;
  topContent: React.JSX.Element;
  transform: (value: string) => string;
  validate: (value: string) => boolean;
  markdown?: string;
  validationMessage?: string;
  type: InputDialogType;
}

export interface InputDialogWidgetState {
  value: string;
  valid: boolean;
}

namespace S {
  export const Input = themed.input`
    padding: 8px 10px;
    font-size: 14px;
    background: ${(p) => getTransparentColor(p.theme.combobox.text, 0.1)};
    color: ${(p) => p.theme.combobox.text};
    width: 100%;
    border-radius: 3px;
    outline: none;
    box-sizing: border-box;
    border: none;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      padding: 12px;
      font-size: 18px;
    }
  `;

  export const Area = themed.textarea`
    padding: 8px 10px;
    font-size: 14px;
    background: ${(p) => getTransparentColor(p.theme.combobox.text, 0.1)};
    color: ${(p) => p.theme.combobox.text};
    width: 100%;
    border-radius: 3px;
    outline: none;
    box-sizing: border-box;
    border: none;

    ${REACTOR_MOBILE_MEDIA_QUERY} {
      padding: 12px;
      font-size: 18px;
      min-height: 120px;
    }
  `;

  export const Transformed = themed.div`
    color: ${(p) => p.theme.combobox.text};
    margin-top: 6px;
    font-size: 14px;
    background: ${(p) => p.theme.combobox.backgroundSelected};
    padding: 5px 10px;
    border-radius: 3px;
    display: inline-block;
  `;
}

export class InputDialogWidget extends React.Component<InputDialogWidgetProps, InputDialogWidgetState> {
  refField: React.RefObject<HTMLInputElement>;
  refArea: React.RefObject<HTMLTextAreaElement>;

  constructor(props: InputDialogWidgetProps) {
    super(props);
    this.refField = React.createRef();
    this.refArea = React.createRef();
    this.state = {
      value: this.props.defaultValue,
      valid: true
    };
  }

  componentDidMount(): void {
    if (this.props.type === InputDialogType.TEXT_AREA) {
      this.refArea.current.focus();
    } else {
      this.refField.current.select();
    }
  }

  transform() {
    if (!this.state.value || !this.props.transform) {
      return this.state.value;
    }

    return this.props.transform(this.state.value);
  }

  getTransformed() {
    if (!this.state.valid || !this.props.transform || !this.state.value) {
      return null;
    }

    return (
      <InputTransformedWidget inputValue={this.state.value} transformer={this.props.transform}>
        {(suggestion) => (
          <div>
            <b>{suggestion}</b> will be used
          </div>
        )}
      </InputTransformedWidget>
    );
  }

  validate(): boolean {
    if (!this.props.validate) {
      this.setState({ valid: true });
      return true;
    }
    const isValid = this.props.validate(this.state.value);
    this.setState({ valid: isValid });
    return isValid;
  }

  getValidationMessage() {
    if (this.state.valid) {
      return null;
    }
    return <S.Transformed>{this.props.validationMessage ?? 'Invalid input'}</S.Transformed>;
  }

  getField() {
    let commonProps = {
      value: this.state.value || '',
      onChange: (event) => {
        let v = event.target.value;
        if (v.trim() === '') {
          v = null;
        }
        this.setState({
          value: v,
          valid: true
        });
      }
    };

    if (this.props.type === InputDialogType.TEXT_AREA) {
      return <S.Area ref={this.refArea} {...commonProps} />;
    }
    return <S.Input ref={this.refField} type="text" {...commonProps} />;
  }

  render() {
    return (
      <DialogWidget
        title={this.props.title}
        desc={this.props.desc}
        markdown={this.props.markdown}
        btns={[
          {
            ...this.props.cancelBtn,
            label: this.props.cancelBtn?.label || 'Cancel',
            action: () => {
              this.props.submit(null);
            }
          },
          {
            ...this.props.submitBtn,
            label: this.props.submitBtn?.label || 'Continue',
            action: () => {
              if (this.validate()) {
                this.props.submit(this.transform());
              }
            },
            submitButton: true
          }
        ]}
      >
        {this.props.topContent}
        {this.getField()}
        {this.getTransformed()}
        {this.getValidationMessage()}
      </DialogWidget>
    );
  }
}
