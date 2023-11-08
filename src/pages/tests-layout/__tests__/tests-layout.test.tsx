import { TestsLayout } from 'pages/tests-layout';
import { themedRender as render } from 'utils/test-utils';
import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { TestDetails } from 'widgets/test-details';
import { TestPreviewList } from 'widgets/test-preview-list';
import { expectPropsPassed } from 'utils/test-utils';
import { mockTestsData } from 'constants/mock-tests-data';
import { TestPreview } from 'domain/model/test-model';

jest.mock('domain/hooks/tests-hooks/use-tests-layout', () => ({
  useTestsLayout: jest.fn(),
}));

jest.mock('widgets/test-details', () => ({
  TestDetails: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-preview-list', () => ({
  TestPreviewList: jest.fn().mockImplementation(() => null),
}));

jest.mock('components/page-layout', () => ({
  PageLayout: jest.fn().mockImplementation(({ renderContent, renderPanel }) => (
    <div>
      {renderContent()}
      {renderPanel()}
    </div>
  )),
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

describe('<TestsLayout />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('TestsLayout renders single test and activeTest sets on select', () => {
    const tests = [mockTestsData[0]];
    const activeTestId = null;
    const setActiveTestId = jest.fn();
    (useTestsLayout as jest.Mock).mockReturnValue({ tests, activeTestId, setActiveTestId });
    (TestPreviewList as jest.Mock).mockImplementation(({ tests, onTestSelect }) => {
      onTestSelect(tests[0]);
      return null;
    });
    render(<TestsLayout />);
    expect(TestDetails).not.toBeCalled();
    expectPropsPassed(TestPreviewList as jest.Mock, {
      tests,
    });
    expect(setActiveTestId).toBeCalledWith(tests[0].id);
  });

  it('TestsLayout renders multiple tests and activeTest sets on select', () => {
    const tests = mockTestsData;
    const activeTestId = null;
    const setActiveTestId = jest.fn();
    const onSelects: Function[] = [];
    (useTestsLayout as jest.Mock).mockReturnValue({ tests, activeTestId, setActiveTestId });
    (TestPreviewList as jest.Mock).mockImplementation(({ tests, onTestSelect }) => {
      tests.forEach((test: TestPreview) => {
        onSelects.push(() => onTestSelect(test));
      });

      return null;
    });
    render(<TestsLayout />);
    expect(TestDetails).not.toBeCalled();
    expectPropsPassed(TestPreviewList as jest.Mock, {
      tests,
    });
    onSelects[0]();
    expect(setActiveTestId).toBeCalledWith(tests[0].id);
    onSelects[1]();
    expect(setActiveTestId).toBeCalledWith(tests[1].id);
  });

  it('TestsLayout renders TestDetails with activeTestId', () => {
    const tests = mockTestsData;
    const activeTestId = mockTestsData[0].id;
    const setActiveTestId = jest.fn();
    (useTestsLayout as jest.Mock).mockReturnValue({ tests, activeTestId, setActiveTestId });
    render(<TestsLayout />);
    expectPropsPassed(TestDetails as jest.Mock, {
      qaseTestId: activeTestId,
    });
  });
});
