import { FC } from 'react';
import { Header } from 'widgets/header';
import { TestsLayout } from 'pages/tests-layout';

export const App: FC = () => {
  return (
    <>
      <Header />
      <TestsLayout />
    </>
  );
};