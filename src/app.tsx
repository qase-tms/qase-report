import { FC } from 'react';
import { Header } from 'widgets/header/header';
import { TestsPreviewList } from 'widgets/tests-preview-list/tests-preview-list';

export const App: FC = () => {
  return (
    <>
      <Header />
      <TestsPreviewList />
    </>
  );
};