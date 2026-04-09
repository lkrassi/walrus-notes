import { type FC } from 'react';
import { useApplyLinkAccessFlow } from '../model/useApplyLinkAccessFlow';
import { Main } from './components/Main';

export const MainPage: FC = () => {
  useApplyLinkAccessFlow();

  return <Main />;
};
