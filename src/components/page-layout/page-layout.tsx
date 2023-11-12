import {
  Layout,
  Panel,
  TabRow,
  TabWrapper,
  Tab,
  PANE_CALC_HEIGHT,
  PaneWrapper,
} from './page-layout-styled';
import { SplitPane } from 'components/split-pane';
import { ReactNode, FC, useMemo } from 'react';
import { Text } from 'components/text';
import { useTabs } from 'domain/hooks/params-hooks/use-tabs';
import { TabId } from 'domain/model/tabs';

const initialSizes = ['auto', '40%'];
const minSizes = ['600px', '650px'];

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
  const activeTabIdx = useMemo(() => {
    const idx = tabs.findIndex(tab => tab.id === activeTabId);
    return idx === -1 ? 0 : idx;
  }, [activeTabId, tabs]);
  return (
    <Layout>
      <TabWrapper>
        <TabRow>
          {tabs.map((tab, idx) => (
            <Tab key={tab.id} $active={idx === activeTabIdx} onClick={() => setTab(tab.id)}>
              <Text size={Text.Size.M1} weight={Text.Weight.Semibold}>
                {tab.text}
              </Text>
            </Tab>
          ))}
        </TabRow>
      </TabWrapper>
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
