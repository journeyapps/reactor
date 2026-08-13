import {
  ArrayInput,
  ArraySetInput,
  BooleanInput,
  ColumnsFormModel,
  ColumnsFormModelRenderMode,
  DateInput,
  DateTimePickerType,
  EntityInput,
  FileInput,
  GroupInput,
  ImageInput,
  MultiSelectInput,
  NumberInput,
  SelectInput,
  TextInputType,
  TextAreaInput,
  TextInput
} from '@journeyapps/reactor-mod';
import { TodoEntities } from '@journeyapps/reactor-mod-todos';

export class DemoFormModel extends ColumnsFormModel {
  constructor() {
    super({
      columnWidths: [280, 280, 280],
      columnSpacing: 12,
      mode: ColumnsFormModelRenderMode.DIVISIONS
    });

    // Column 0: core text/date/number information
    this.addInput(
      new TextInput({
        name: 'title',
        label: 'Title',
        desc: 'Type: TextInput',
        placeholder: 'Enter a title',
        value: 'Demo item',
        inputType: TextInputType.TEXT,
        required: true
      }),
      0
    );

    this.addInput(
      new TextAreaInput({
        name: 'description',
        label: 'Description',
        desc: 'Type: TextAreaInput',
        placeholder: 'Describe the item',
        value: 'Used for testing form rendering and dialog integration.'
      }),
      0
    );

    this.addInput(
      new DateInput({
        name: 'targetDate',
        label: 'Target date',
        desc: 'Type: DateInput',
        value: new Date(),
        type: DateTimePickerType.DATE
      }),
      0
    );

    this.addInput(
      new NumberInput({
        name: 'priority',
        label: 'Priority',
        desc: 'Type: NumberInput',
        placeholder: 'Enter a priority from 1 to 5',
        value: 2,
        min: 1,
        max: 5,
        required: true
      }),
      0
    );

    this.addInput(
      new GroupInput({
        name: 'grouped',
        label: 'Grouped fields',
        desc: 'Type: GroupInput',
        layout: {
          horizontal: false,
          border: true
        },
        inputs: [
          new TextInput({
            name: 'summary',
            label: 'Summary',
            desc: 'Type: TextInput',
            placeholder: 'Enter a summary',
            value: 'Nested summary'
          }),
          new BooleanInput({
            name: 'approved',
            label: 'Approved',
            desc: 'Type: BooleanInput',
            value: false,
            renderWithLabel: true
          })
        ]
      }),
      0
    );

    // Column 1: selection + relation fields
    this.addInput(
      new SelectInput({
        name: 'type',
        label: 'Type',
        desc: 'Type: SelectInput',
        value: 'feature',
        options: {
          feature: 'Feature',
          bug: 'Bug',
          chore: 'Chore'
        }
      }),
      1
    );

    this.addInput(
      new MultiSelectInput({
        name: 'tags',
        label: 'Tags',
        desc: 'Type: MultiSelectInput',
        value: ['frontend'],
        options: {
          frontend: 'Frontend',
          backend: 'Backend',
          infra: 'Infra',
          docs: 'Docs'
        }
      }),
      1
    );

    this.addInput(
      new BooleanInput({
        name: 'enabled',
        label: 'Enabled',
        desc: 'Type: BooleanInput',
        value: true,
        renderWithLabel: true
      }),
      1
    );

    this.addInput(
      new EntityInput({
        name: 'linkedEntity',
        label: 'Linked todo',
        desc: 'Type: EntityInput',
        entityType: TodoEntities.TODO_ITEM,
        value: null
      }),
      1
    );

    // Column 2: collection and asset fields
    this.addInput(
      new ArrayInput({
        name: 'notes',
        label: 'Notes',
        desc: 'Type: ArrayInput',
        value: ['First note'],
        generate: () => {
          return new TextInput({
            name: 'note',
            label: 'Note',
            desc: 'Type: TextInput',
            placeholder: 'Enter a note'
          });
        }
      }),
      2
    );

    this.addInput(
      new ArraySetInput({
        name: 'advanced',
        label: 'Advanced fields',
        desc: 'Type: ArraySetInput',
        value: {
          owner: 'Demo owner'
        },
        entries: [
          {
            key: 'owner',
            title: 'Owner'
          },
          {
            key: 'ticket',
            title: 'Ticket'
          },
          {
            key: 'release',
            title: 'Release'
          }
        ],
        generate: (key) => {
          return new TextInput({
            name: key,
            label: key,
            desc: 'Type: TextInput'
          });
        }
      }),
      2
    );

    this.addInput(
      new FileInput({
        name: 'rawFile',
        label: 'Raw file',
        desc: 'Type: FileInput',
        allowPaste: true
      }),
      2
    );

    this.addInput(
      new ImageInput({
        name: 'image',
        label: 'Image',
        desc: 'Type: ImageInput'
      }),
      2
    );
  }
}
