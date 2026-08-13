import * as React from 'react';
import { observer } from 'mobx-react';
import { ReactorPanelModel, System, ioc, styled } from '@journeyapps/reactor-mod';
import { TodoEntities, TodoModel, TodoStore } from '@journeyapps/reactor-mod-todos';
import { CoreTreeVariantsCard } from './CoreTreeVariantsCard';
import { EntityTreeVariantsCard } from './EntityTreeVariantsCard';

export interface PlaygroundTreeSearchPanelWidgetProps {
  model: ReactorPanelModel;
}

export const PlaygroundTreeSearchPanelWidget: React.FC<PlaygroundTreeSearchPanelWidgetProps> = observer(() => {
  const system = ioc.get(System);
  const todoStore = ioc.get<TodoStore>(TodoStore);
  const definition = system.getDefinition<TodoModel>(TodoEntities.TODO_ITEM);

  return (
    <S.Container>
      <EntityTreeVariantsCard definition={definition} todoStore={todoStore} />
      <CoreTreeVariantsCard />
    </S.Container>
  );
});

namespace S {
  export const Container = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    min-height: 100%;
    box-sizing: border-box;
  `;
}
