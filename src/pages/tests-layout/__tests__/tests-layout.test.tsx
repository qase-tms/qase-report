import { TestsLayout } from 'pages/tests-layout';
import { themedRender as render } from 'utils/test-utils';
import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { TestDetails } from 'widgets/test-details';
import { TestPreviewItem } from 'widgets/test-preview-item';
import { expectPropsPassed, expectPropsWasPassed } from 'utils/test-utils';
import { mockTestsData } from 'constants/mock-tests-data';

jest.mock('domain/hooks/tests-hooks/use-tests-layout', () => ({
  useTestsLayout: jest.fn(),
}));

jest.mock('widgets/test-details', () => ({
  TestDetails: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-preview-item', () => ({
  TestPreviewItem: jest.fn().mockImplementation(() => null),
}));

jest.mock('components/split-pane', () => ({
  SplitPane: jest.fn().mockImplementation(({ renderLeft, renderRight }) => (
    <div>
      {renderLeft()}
      {renderRight()}
    </div>
  )),
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
    (TestPreviewItem as jest.Mock).mockImplementation(({ test, onSelect }) => {
      onSelect(test);
      return null;
    });
    render(<TestsLayout />);
    expect(TestDetails).not.toBeCalled();
    expectPropsPassed(TestPreviewItem as jest.Mock, {
      test: tests[0],
    });
    expect(setActiveTestId).toBeCalledWith(tests[0].id);
  });

  it('TestsLayout renders multiple tests and activeTest sets on select', () => {
    const tests = mockTestsData;
    const activeTestId = null;
    const setActiveTestId = jest.fn();
    const onSelects: Function[] = [];
    (useTestsLayout as jest.Mock).mockReturnValue({ tests, activeTestId, setActiveTestId });
    (TestPreviewItem as jest.Mock).mockImplementation(({ test, onSelect }) => {
      onSelects.push(() => onSelect(test));
      return null;
    });
    render(<TestsLayout />);
    expect(TestDetails).not.toBeCalled();
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
