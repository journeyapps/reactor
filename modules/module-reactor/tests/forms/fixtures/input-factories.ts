import { FormInput, FormInputOptions } from '../../../src/forms/FormInput';
import { TextInput } from '../../../src/forms/controls/text/TextInput';
import { TextAreaInput } from '../../../src/forms/controls/text/TextAreaInput';
import { NumberInput } from '../../../src/forms/controls/NumberInput';
import { BooleanInput } from '../../../src/forms/controls/BooleanInput';
import { SelectInput } from '../../../src/forms/controls/SelectInput';
import { MultiSelectInput } from '../../../src/forms/controls/MultiSelectInput';
import { ArrayInput } from '../../../src/forms/controls/collection/ArrayInput';
import { ArraySetInput } from '../../../src/forms/controls/collection/ArraySetInput';

type CommonOptions = Pick<FormInputOptions, 'required' | 'visible' | 'disabled'>;

interface InputFactory<T> {
  name: string;
  createInput: (options: FormInputOptions<T>) => FormInput;
  emptyValue: () => T;
  validValue: () => T;
  otherValue: () => T;
}

/**
 * Keep value types paired with their constructor and create fresh values for each test.
 */
const defineInputFactory = <T>(factory: InputFactory<T>) => ({
  name: factory.name,
  create: (options: CommonOptions = {}) => {
    const input = factory.createInput({ label: 'Field', name: 'field', value: factory.emptyValue(), ...options });
    return {
      input,
      provideValue: () => {
        const value = factory.validValue();
        input.setValue(value);
        return value;
      },
      provideOtherValue: () => {
        const value = factory.otherValue();
        input.setValue(value);
        return value;
      },
      clearValue: () => input.setValue(factory.emptyValue())
    };
  }
});

export const inputFactories = [
  defineInputFactory<string>({
    name: 'TextInput',
    createInput: (options) => new TextInput(options),
    emptyValue: () => '',
    validValue: () => 'First',
    otherValue: () => 'Second'
  }),
  defineInputFactory<string>({
    name: 'TextAreaInput',
    createInput: (options) => new TextAreaInput(options),
    emptyValue: () => '',
    validValue: () => 'First\nparagraph',
    otherValue: () => 'Second\nparagraph'
  }),
  defineInputFactory<number | null>({
    name: 'NumberInput',
    createInput: (options) => new NumberInput(options),
    emptyValue: () => null,
    validValue: () => 1,
    otherValue: () => 2
  }),
  defineInputFactory<boolean | null>({
    name: 'BooleanInput',
    createInput: (options) => new BooleanInput(options),
    emptyValue: () => null,
    validValue: () => true,
    otherValue: () => false
  }),
  defineInputFactory<string>({
    name: 'SelectInput',
    createInput: (options) => new SelectInput({ ...options, options: { us: 'US', eu: 'Europe' } }),
    emptyValue: () => '',
    validValue: () => 'us',
    otherValue: () => 'eu'
  }),
  defineInputFactory<string[]>({
    name: 'MultiSelectInput',
    createInput: (options) => new MultiSelectInput({ ...options, options: { us: 'US', eu: 'Europe' } }),
    emptyValue: () => [],
    validValue: () => ['us'],
    otherValue: () => ['eu']
  }),
  defineInputFactory<string[]>({
    name: 'ArrayInput',
    createInput: (options) => new ArrayInput({ ...options, generate: () => new TextInput({ label: 'Entry' }) }),
    emptyValue: () => [],
    validValue: () => ['First'],
    otherValue: () => ['Second']
  }),
  defineInputFactory<Record<string, string>>({
    name: 'ArraySetInput',
    createInput: (options) =>
      new ArraySetInput({
        ...options,
        entries: [{ key: 'first', title: 'First' }],
        generate: () => new TextInput({ label: 'Entry' })
      }),
    emptyValue: () => ({}),
    validValue: () => ({ first: 'First' }),
    otherValue: () => ({ first: 'Second' })
  })
];
