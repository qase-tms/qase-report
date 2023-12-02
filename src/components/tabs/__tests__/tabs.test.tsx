import { themedRender as render } from 'utils/test-utils';
import { Tab } from '../tabs';
import { Tabs, testIds } from '../tabs';
import { TabId } from 'domain/model/tabs';
import { screen, fireEvent } from '@testing-library/react';

const tabs: Tab<TabId>[] = [
  {
    id: TabId.Tests,
    text: 'tests',
  },
  {
    id: TabId.Issues,
    text: 'issues',
  },
];

describe('<Tabs />', () => {
  it('Renders tabs', () => {
    render(<Tabs tabs={tabs} onChange={jest.fn()} />);
    for (const tab of tabs) {
      expect(screen.getByTestId(testIds.getTabTitle(tab.id)).textContent).toBe(tab.text);
    }
  });
  it('On change callback triggers on tab click', () => {
    const handleChange = jest.fn();
    render(<Tabs tabs={tabs} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId(testIds.getTabTitle(tabs[0].id)));
    expect(handleChange).toBeCalledWith(tabs[0].id);
  });
});
