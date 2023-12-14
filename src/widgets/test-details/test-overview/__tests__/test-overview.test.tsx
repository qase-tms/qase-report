import { TestOverview } from 'widgets/test-details/test-overview';
import { themedRender as render } from 'utils/test-utils';
import { TestDetailsDescription } from 'widgets/test-details/test-details-description';
import { TestDetailsSummary } from 'widgets/test-details/test-details-summary';
import { TestAttachments } from 'widgets/test-attachments';
import { TestSteps } from 'widgets/test-steps';
import { expectPropsPassed } from 'utils/test-utils';
import { mockTest } from 'constants/mock-tests-data';

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

  it('TestOverview renders test data', () => {
    const test = mockTest;
    render(<TestOverview test={test} />);

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
