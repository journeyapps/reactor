import * as React from 'react';
import { themed } from '../../stores/themes/reactor-theme-fragment';

const emptyTable = require('../../../media/empty-table.svg');

namespace S {
  export const Container = themed.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    color: ${(props) => props.theme.text.primary};
    font-size: 14px;
  `;

  export const Image = themed.img`
    width: 50px;
    margin-bottom: 10px;
  `;
}

export interface EmptyTableWidgetProps {
  label?: string;
}

export const EmptyTableWidget: React.FC<EmptyTableWidgetProps> = ({ label = 'No items to display' }) => (
  <S.Container>
    <S.Image src={emptyTable} alt="" />
    <span>{label}</span>
  </S.Container>
);
