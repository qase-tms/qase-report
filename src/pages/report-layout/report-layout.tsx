import { FC, ReactNode, useCallback, useEffect } from 'react';
import { TestDetails } from 'widgets/test-details';
import { PageLayout } from 'components/page-layout';
import { TabId, useTabs } from 'domain/hooks/use-params';
import { ReportTestTabContent, ReportTestTabPanel } from './report-tabs/report-tests-tab';

const layoutTabs: { id: TabId; text: string }[] = [
  {
    id: TabId.Tests,
    text: 'Tests',
  },
  {
    id: TabId.Timeline,
    text: 'Timeline',
  },
  {
    id: TabId.Issues,
    text: 'Issues',
  },
];

export const ReportLayout: FC = () => {
  const [tabId, setTabId] = useTabs();

  useEffect(() => {
    if (!tabId) {
      setTabId(TabId.Tests);
    }
  }, [tabId]);

  const renderContent = (tabId?: TabId): ReactNode => {
    if (tabId === TabId.Tests) {
      return <ReportTestTabContent />;
    }
    return null;
  };

  const renderPanel = (tabId?: TabId): ReactNode => {
    if (tabId === TabId.Tests) {
      return <ReportTestTabPanel />;
    }
    return null;
  };

  return <PageLayout tabs={layoutTabs} renderContent={renderContent} renderPanel={renderPanel} />;
};
