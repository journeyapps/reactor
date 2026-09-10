import {
  ArrayInput,
  ArraySetInput,
  BooleanInput,
  ColumnsFormModel,
  ColumnsFormModelRenderMode,
  GroupInput,
  MultiSelectInput,
  NumberInput,
  SelectInput,
  TextInput
} from '@journeyapps/reactor-mod';

export class ValidationDemoFormModel extends ColumnsFormModel {
  constructor() {
    super({ columnWidths: [280, 280], columnSpacing: 16, mode: ColumnsFormModelRenderMode.DIVISIONS });
    this.addInput(
      new TextInput({
        name: 'slug',
        label: 'Project slug',
        required: true,
        desc: 'Required. Try spaces or uppercase letters, then try launch-plan.',
        validator: (value) => /^[a-z0-9-]+$/.test(value) || 'Use lowercase letters, numbers, and hyphens'
      }),
      0
    );
    this.addInput(
      new NumberInput({
        name: 'budget',
        label: 'Optional budget',
        min: 0,
        max: 100,
        desc: 'Leave blank, enter 0–100, or try text and out-of-range values.'
      }),
      0
    );
    this.addInput(
      new SelectInput({
        name: 'region',
        label: 'Region',
        required: true,
        desc: 'An empty selection shows a prompt and blocks submission.',
        options: { us: 'United States', eu: 'Europe' }
      }),
      0
    );
    this.addInput(
      new SelectInput({
        name: 'unavailable',
        label: 'No available regions',
        options: {},
        desc: 'An optional select with no options displays a muted empty state.'
      }),
      0
    );
    this.addInput(
      new MultiSelectInput({
        name: 'channels',
        label: 'Release channels',
        required: true,
        value: [],
        desc: 'Select at least one channel.',
        options: { web: 'Web', mobile: 'Mobile', api: 'API' }
      }),
      0
    );
    const showApproval = this.addInput(
      new BooleanInput({
        name: 'showApproval',
        label: 'Require approval',
        value: false,
        renderWithLabel: true
      }),
      0
    );
    const approval = this.addInput(
      new TextInput({
        name: 'approval',
        label: 'Approval reference',
        required: true,
        visible: false,
        desc: 'Hidden fields do not block submission and top-level hidden values are omitted.'
      }),
      0
    );
    showApproval.registerListener({ valueChanged: () => approval.update({ visible: showApproval.value }) });

    this.addInput(
      new GroupInput({
        name: 'owner',
        label: 'Project owner',
        layout: { horizontal: false, border: true },
        inputs: [
          new TextInput({
            name: 'name',
            label: 'Owner name',
            required: true,
            desc: 'This nested required field participates in form validity.'
          }),
          new BooleanInput({
            name: 'confirmed',
            label: 'Confirmed',
            required: true,
            value: false,
            renderWithLabel: true,
            desc: 'False is a supplied value, even when required.'
          })
        ]
      }),
      1
    );
    this.addInput(
      new ArrayInput<string>({
        name: 'milestones',
        label: 'Milestones',
        required: true,
        value: [],
        desc: 'Add at least one milestone. Each row must have a title.',
        generate: () => new TextInput({ label: 'Milestone title', required: true })
      }),
      1
    );
    this.addInput(
      new ArraySetInput<string>({
        name: 'references',
        label: 'References',
        desc: 'Optional collection; each reference you add needs a value.',
        entries: [
          { key: 'ticket', title: 'Ticket' },
          { key: 'release', title: 'Release' }
        ],
        generate: (key) => new TextInput({ name: key, label: 'Reference value', required: true })
      }),
      1
    );
  }

  fillValidExample() {
    this.setValues({
      slug: 'launch-plan',
      budget: 0,
      region: 'eu',
      channels: ['web'],
      showApproval: false,
      approval: null,
      owner: { name: 'Alex Morgan', confirmed: false },
      milestones: ['Prepare release', 'Launch'],
      references: { ticket: 'DEMO-42' }
    });
  }
}
