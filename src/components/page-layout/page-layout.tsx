import { Layout, Panel, PANE_CALC_HEIGHT, PaneWrapper, TabsWrapper } from './page-layout-styled';
import { Tabs, Tab } from 'components/tabs';
import { SplitPane } from 'components/split-pane';
import { ReactNode, FC } from 'react';
import { useTabs } from 'domain/hooks/params-hooks/use-tabs';
import { TabId } from 'domain/model/tabs';

const initialSizes = ['auto', '40%'];
const minSizes = ['600px', '550px'];

type LayoutProps = {
  tabs: Tab<TabId>[];
  renderContent: (tab?: TabId) => ReactNode;
  renderPanel: (tab?: TabId) => ReactNode;
};

export const PageLayout: FC<LayoutProps> = ({ tabs, renderContent, renderPanel }) => {
  const [activeTabId, setTab] = useTabs();
  return (
    <Layout>
      <TabsWrapper>
        <Tabs value={activeTabId} onChange={setTab} tabs={tabs} />
      </TabsWrapper>
      <PaneWrapper>
        <SplitPane
          initialSizes={initialSizes}
          minSizes={minSizes}
          calcHeight={PANE_CALC_HEIGHT}
          renderLeft={() => <Panel>{renderContent(activeTabId)}</Panel>}
          renderRight={() => <Panel>{renderPanel(activeTabId)}</Panel>}
        />
      </PaneWrapper>
    </Layout>
  );
};
