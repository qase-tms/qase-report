import { Layout, Panel, PANE_CALC_HEIGHT, PaneWrapper } from './page-layout-styled';
import { Tabs } from 'components/tabs';
import { SplitPane } from 'components/split-pane';
import { ReactNode, FC, useMemo } from 'react';
import { Text } from 'components/text';
import { useTabs } from 'domain/hooks/params-hooks/use-tabs';
import { TabId } from 'domain/model/tabs';

const initialSizes = ['auto', '40%'];
const minSizes = ['600px', '550px'];

export type Tab = {
  id: TabId;
  text: string;
};

type LayoutProps = {
  tabs: Tab[];
  renderContent: (tab?: TabId) => ReactNode;
  renderPanel: (tab?: TabId) => ReactNode;
};

export const PageLayout: FC<LayoutProps> = ({ tabs, renderContent, renderPanel }) => {
  const [activeTabId, setTab] = useTabs();
  return (
    <Layout>
      <Tabs value={activeTabId} onChange={setTab} tabs={tabs} />
      <PaneWrapper>
        <SplitPane
          initialSizes={initialSizes}
          minSizes={minSizes}
          calcHeight={PANE_CALC_HEIGHT}
          renderLeft={() => <Panel>{renderContent(activeTabId)}</Panel>}
          renderRight={() => renderPanel(activeTabId)}
        />
      </PaneWrapper>
    </Layout>
  );
};
