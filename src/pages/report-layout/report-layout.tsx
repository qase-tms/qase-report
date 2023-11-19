import { FC, ReactNode, useEffect } from 'react';
import { PageLayout } from 'components/page-layout';
import { useTabs } from 'domain/hooks/params-hooks/use-tabs';
import { ReportTestTabContent, ReportTestTabPanel } from './report-tabs/report-tests-tab';
import { TabId } from 'domain/model/tabs';

type LayoutTab = {
  renderContent: () => ReactNode;
  renderPanel: () => ReactNode;
};

type ReportTabs = Extract<TabId, TabId.Tests | TabId.Timeline | TabId.Issues>;

const layoutComponents: Record<ReportTabs, LayoutTab> = {
  [TabId.Tests]: {
    renderContent: () => <ReportTestTabContent />,
    renderPanel: () => <ReportTestTabPanel />,
  },
  [TabId.Timeline]: {
    renderContent: () => null,
    renderPanel: () => null,
  },
  [TabId.Issues]: {
    renderContent: () => null,
    renderPanel: () => null,
  },
};

const renderContent = (tabId?: TabId): ReactNode => {
  if (tabId && layoutComponents[tabId]) {
    return layoutComponents[tabId].renderContent();
  }
  return null;
};

const renderPanel = (tabId?: TabId): ReactNode => {
  if (tabId && layoutComponents[tabId]) {
    return layoutComponents[tabId].renderPanel();
  }
  return null;
};

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

  return <PageLayout tabs={layoutTabs} renderContent={renderContent} renderPanel={renderPanel} />;
};
