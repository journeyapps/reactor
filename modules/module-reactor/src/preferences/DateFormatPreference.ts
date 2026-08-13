import { ioc } from '../inversify.config';
import { PrefsStore } from '../stores/PrefsStore';
import { SetSetting } from '../settings/SetSetting';
import { ReactorDateFormats } from '@journeyapps/reactor-lib-utils';
import { computed } from 'mobx';
import * as _ from 'lodash';

export const REACTOR_DATE_FORMAT_LABELS = {
  [ReactorDateFormats.LOCAL]: 'Local',
  [ReactorDateFormats.SIMPLE]: 'Simple',
  [ReactorDateFormats.ISO]: 'ISO'
};

export class DateFormatPreference extends SetSetting {
  static KEY = '/dates/format';

  constructor() {
    super({
      name: 'The format used when displaying dates',
      key: DateFormatPreference.KEY,
      category: 'Date and time',
      value: ReactorDateFormats.LOCAL,
      options: _.map(REACTOR_DATE_FORMAT_LABELS, (label, key) => {
        return {
          key,
          label
        };
      })
    });
  }

  @computed get asLabel() {
    return REACTOR_DATE_FORMAT_LABELS[this.value];
  }

  @computed get asFormat() {
    return this.value as ReactorDateFormats;
  }

  static get() {
    return ioc.get(PrefsStore).getPreference<DateFormatPreference>(DateFormatPreference.KEY);
  }
}
