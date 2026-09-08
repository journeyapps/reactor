import { Container, createDecorator } from '@journeyapps/common-ioc';

if (!(window as any).container) {
  const container = new Container();
  const injector = createDecorator(container);

  (window as any).container = container;
  (window as any).injector = injector;
}

export const inject: ReturnType<typeof createDecorator> = (window as any).injector;
export const ioc: Container = (window as any).container;
