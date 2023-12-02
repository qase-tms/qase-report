import { TestDetails, testIds } from 'widgets/test-details';
import { screen, act } from '@testing-library/react';
import { themedRender as render } from 'utils/test-utils';
import { useTestDetails } from 'domain/hooks/tests-hooks/use-test-details';
import { RequestStatus } from 'utils/use-request';
import { TestStatusField } from 'widgets/test-status-field';
import { expectPropsPassed } from 'utils/test-utils';
import { mockTest } from 'constants/mock-tests-data';
import { TestOverview } from 'widgets/test-details/test-overview';
import { TestStackTrace } from 'widgets/test-details/test-stacktrace';
import { Tabs } from 'components/tabs';

jest.mock('domain/hooks/tests-hooks/use-test-details', () => ({
  useTestDetails: jest.fn(),
}));

jest.mock('widgets/test-status-field', () => ({
  TestStatusField: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-details/test-details-summary', () => ({
  TestDetailsSummary: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-details/test-overview', () => ({
  TestOverview: jest.fn().mockImplementation(() => null),
}));

jest.mock('components/tabs', () => ({
  Tabs: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-details/test-stacktrace', () => ({
  TestStackTrace: jest.fn().mockImplementation(() => null),
}));

type stringSetter = (value: string) => void;

describe('<TestDetails />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('TestDetails renders error', () => {
    (useTestDetails as jest.Mock).mockReturnValue({
      test: null,
      testRequestStatus: RequestStatus.Failed,
    });
    render(<TestDetails qaseTestId="test" />);
    expect(screen.getByTestId(testIds.errorField)).toBeTruthy();
  });

  it('TestDetails renders content tab', () => {
    const test = mockTest;
    (useTestDetails as jest.Mock).mockReturnValue({
      testRequestStatus: RequestStatus.Success,
      test,
    });
    render(<TestDetails qaseTestId={test.id} />);
    expect(screen.queryByTestId(testIds.errorField)).toBeFalsy();

    expectPropsPassed(TestStatusField as jest.Mock, { status: test.execution.status });
    expectPropsPassed(TestOverview as jest.Mock, { test: mockTest });
  });

  it('TestDetails renders stacktrace tab', () => {
    const test = mockTest;
    (useTestDetails as jest.Mock).mockReturnValue({
      testRequestStatus: RequestStatus.Success,
      test,
    });
    let setTab: undefined | stringSetter;
    (Tabs as jest.Mock).mockImplementation(({ onChange }) => {
      setTab = onChange;
      return null;
    });
    render(<TestDetails qaseTestId={test.id} />);
    act(() => {
      if (setTab) {
        setTab('stacktrace');
      }
    });
    expectPropsPassed(TestStackTrace as jest.Mock, { stacktrace: test.execution.stacktrace });
  });
});
