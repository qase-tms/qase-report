import { TestDetails, testIds } from 'widgets/test-details';
import { screen } from '@testing-library/react';
import { themedRender as render } from 'utils/test-utils';
import { useTestDetails } from 'domain/hooks/tests-hooks/use-test-details';
import { RequestStatus } from 'utils/use-request';
import { TestDetailsDescription } from 'widgets/test-details/test-details-description';
import { TestDetailsSummary } from 'widgets/test-details/test-details-summary';
import { TestAttachments } from 'widgets/test-attachments';
import { TestStatusField } from 'widgets/test-status-field';
import { TestSteps } from 'widgets/test-steps';
import { expectPropsPassed } from 'utils/test-utils';
import { mockTest } from 'constants/mock-tests-data';

jest.mock('domain/hooks/tests-hooks/use-test-details', () => ({
  useTestDetails: jest.fn(),
}));

jest.mock('widgets/test-status-field', () => ({
  TestStatusField: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-details/test-details-summary', () => ({
  TestDetailsSummary: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-details/test-details-description', () => ({
  TestDetailsDescription: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-attachments', () => ({
  TestAttachments: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-steps', () => ({
  TestSteps: jest.fn().mockImplementation(() => null),
}));

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

  it('TestDetails renders test data', () => {
    const test = mockTest;
    (useTestDetails as jest.Mock).mockReturnValue({
      testRequestStatus: RequestStatus.Success,
      test,
    });
    render(<TestDetails qaseTestId={test.id} />);
    expect(screen.queryByTestId(testIds.errorField)).toBeFalsy();

    expectPropsPassed(TestStatusField as jest.Mock, { status: test.execution.status });
    expectPropsPassed(TestDetailsSummary as jest.Mock, {
      duration: test.execution.duration,
      thread: test.execution.thread,
      endTime: test.execution.end_time,
    });
    expectPropsPassed(TestDetailsDescription as jest.Mock, {
      description: test.fields.description,
    });
    expectPropsPassed(TestAttachments as jest.Mock, {
      attachments: test.attachments,
    });
    expectPropsPassed(TestSteps as jest.Mock, {
      steps: test.steps,
    });
  });
});
