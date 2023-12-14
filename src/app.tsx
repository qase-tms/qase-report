import { FC } from 'react';
import { Header } from 'widgets/header';
import { ReportLayout } from 'pages/report-layout';

export const App: FC = () => {
  return (
    <>
      <Header />
      <ReportLayout />
    </>
  );
};
