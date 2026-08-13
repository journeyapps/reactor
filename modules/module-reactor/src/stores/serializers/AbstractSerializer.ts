import { BaseObserver } from '@journeyapps-labs/common-utils';
import { Disposable } from '@journeyapps/reactor-lib-utils';

export interface AbstractSerializerListener {
  gotExternalChanges: () => any;
}

export abstract class AbstractSerializer<T = object>
  extends BaseObserver<AbstractSerializerListener>
  implements Disposable
{
  abstract serialize(data: T): Promise<boolean>;

  abstract deserialize(): Promise<T | false>;

  abstract dispose(): any;
}
