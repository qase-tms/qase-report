import { FC, useMemo } from 'react';
import { Text } from 'components/text';
import { TabId } from 'domain/model/tabs';
import { createTestId } from 'utils/use-test-id-attribute';
import { TabWrapper, TabStyled, TabRow } from './tabs-styled';

export type Tab = {
  id: TabId;
  text: string;
};

type Props = {
  value?: TabId;
  onChange: (value: TabId) => void;
  tabs: Tab[];
};

const testIdNamespace = 'COMPONENT_TABS';

export const testIds = {
  getTabTitle: (id: string) => createTestId(testIdNamespace, `tab-title-${id}`),
};

export const Tabs: FC<Props> = ({ value, onChange, tabs }) => {
  const activeTabIdx = useMemo(() => {
    const idx = tabs.findIndex(tab => tab.id === value);
    return idx === -1 ? 0 : idx;
  }, [value, tabs]);
  return (
    <TabWrapper>
      <TabRow>
        {tabs.map((tab, idx) => (
          <TabStyled key={tab.id} $active={idx === activeTabIdx} onClick={() => onChange(tab.id)}>
            <Text
              size={Text.Size.M1}
              weight={Text.Weight.Semibold}
              testId={testIds.getTabTitle(tab.id)}
            >
              {tab.text}
            </Text>
          </TabStyled>
        ))}
      </TabRow>
    </TabWrapper>
  );
};
