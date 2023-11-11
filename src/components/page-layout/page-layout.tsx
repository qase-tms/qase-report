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
import { ReactNode, FC, useState, useCallback } from 'react';
import { Text } from 'components/text';

const initialSizes = ['auto', '40%'];
const minSizes = ['600px', '650px'];

export type Tab = {
  id: string;
  text: string;
};

type LayoutProps = {
  tabs: Tab[];
  renderContent: (tab: Tab, setTab: (tabId: string) => void) => ReactNode;
  renderPanel: () => ReactNode;
};

export const PageLayout: FC<LayoutProps> = ({ tabs, renderContent, renderPanel }) => {
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const setTab = useCallback(
    (tabId: string) => {
      setActiveTabIdx(tabs.findIndex(t => t.id === tabId));
    },
    [tabs],
  );
  return (
    <Layout>
      <TabWrapper>
        <TabRow>
          {tabs.map((tab, idx) => (
            <Tab key={tab.id} $active={idx === activeTabIdx} onClick={() => setActiveTabIdx(idx)}>
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
          renderLeft={() => <Panel>{renderContent(tabs[activeTabIdx], setTab)}</Panel>}
          renderRight={renderPanel}
        />
      </PaneWrapper>
    </Layout>
  );
};
