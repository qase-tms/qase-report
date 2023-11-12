import { TestPreviewList } from 'widgets/test-preview-list';
import { themedRender as render } from 'utils/test-utils';
import { TestPreviewItem } from 'widgets/test-preview-item';
import { expectPropsPassed, expectPropsWasPassed } from 'utils/test-utils';
import { mockTestsData } from 'constants/mock-tests-data';

jest.mock('widgets/test-preview-item', () => ({
  TestPreviewItem: jest.fn().mockImplementation(() => null),
}));

jest.mock('react-virtualized', () => ({
  AutoSizer: jest.fn().mockImplementation(({ children }) => {
    return <div>{children({ height: 100, width: 100 })}</div>;
  }),
  List: jest.fn().mockImplementation(({ rowRenderer, rowCount }) => {
    const data = new Array(rowCount).fill(0);
    return <div>{data.map((_, i) => rowRenderer({ key: i, index: i, style: {} }))}</div>;
  }),
}));

describe('<TestsPreviewList />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('TestsPreviewList renders single test', () => {
    const tests = [mockTestsData[0]];
    const setActiveTestId = jest.fn();
    (TestPreviewItem as jest.Mock).mockImplementation(({ test, onSelect }) => {
      onSelect(test);
      return null;
    });
    render(
      <TestPreviewList
        tests={tests}
        onTestSelect={({ id }) => setActiveTestId(id)}
        activeTestId={null}
      />,
    );
    expectPropsPassed(TestPreviewItem as jest.Mock, {
      test: tests[0],
    });
  });

  it('TestsPreviewList renders multiple tests and activeTest sets on select', () => {
    const tests = mockTestsData;
    const setActiveTestId = jest.fn();
    const onSelects: Function[] = [];
    (TestPreviewItem as jest.Mock).mockImplementation(({ test, onSelect }) => {
      onSelects.push(() => onSelect(test));
      return null;
    });
    render(
      <TestPreviewList
        tests={tests}
        onTestSelect={({ id }) => setActiveTestId(id)}
        activeTestId={null}
      />,
    );
    expectPropsWasPassed(
      TestPreviewItem as jest.Mock,
      {
        test: tests[0],
      },
      0,
    );
    expectPropsWasPassed(
      TestPreviewItem as jest.Mock,
      {
        test: tests[1],
      },
      1,
    );
    onSelects[0]();
    expect(setActiveTestId).toBeCalledWith(tests[0].id);
    onSelects[1]();
    expect(setActiveTestId).toBeCalledWith(tests[1].id);
  });
});
