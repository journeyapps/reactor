import { autorun } from 'mobx';
import { VisorMetadata } from '../stores/visor/VisorMetadata';
import { DateLocalSetting } from '../preferences/DateLocalSetting';
import { computeDateTimeParts, ReactorDateFormats } from '@journeyapps/reactor-lib-utils';

export class DateTimezoneVisorMetadata extends VisorMetadata {
  constructor() {
    super({
      key: 'DATE_LOCAL',
      displayName: 'Time zone',
      displayDefault: true
    });
  }

  init() {
    autorun(() => {
      let date = new Date();
      let { zone } = computeDateTimeParts({
        date,
        format: ReactorDateFormats.LOCAL,
        local: DateLocalSetting.get().checked
      });

      this.reportValue({
        value: zone,
        onClick: () => {
          DateLocalSetting.get().toggle();
        }
      });
    });
  }
}
