import { mockNestedSteps, mockStep } from 'constants/mock-tests-data';
import { TestSteps } from '../test-steps';
import { testIds } from '../test-steps-testIds';
import { themedRender as render } from 'utils/test-utils';
import { screen, fireEvent } from '@testing-library/dom';
import { TestAttachments } from 'widgets/test-attachments';
import { expectPropsPassed } from 'utils/test-utils';
import { getBarsOffsets } from '../test-step-item/get-bars-offset';
import { TestStep } from 'src/domain/model/test-model';

jest.mock('widgets/test-attachments', () => ({
  TestAttachments: jest.fn().mockImplementation(() => null),
}));

jest.mock('widgets/test-steps/test-step-item/get-bars-offset', () => ({
  getBarsOffsets: jest.fn().mockImplementation(() => []),
}));

describe('<TestSteps />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('simple step render', () => {
    const simpleSteps = [mockStep];
    render(<TestSteps steps={simpleSteps} />);
    expect(screen.getByTestId(testIds.getStepTitle(mockStep.id)).textContent).toBe(
      mockStep.data.action,
    );
    expectPropsPassed(TestAttachments as jest.Mock, { attachments: mockStep.attachments });
    expect(screen.getByTestId(testIds.getStepExpectedResult(mockStep.id)).textContent).toBe(
      mockStep.data.expected_result,
    );
    expect(getBarsOffsets).toBeCalledWith(0);
  });

  it('simple step collapses on title click', () => {
    const simpleSteps = [mockStep];
    render(<TestSteps steps={simpleSteps} />);
    fireEvent.click(screen.getByTestId(testIds.getStepTitle(mockStep.id)));
    expect(screen.queryByTestId(testIds.getStepContent(mockStep.id))).toBeFalsy();
  });

  it('nested steps render', () => {
    const nestedSteps = mockNestedSteps;
    const stepIds: string[] = [];
    const extractStepId = (step: TestStep) => {
      stepIds.push(step.id);
      step.steps.forEach(s => extractStepId(s));
    };
    nestedSteps.forEach(s => extractStepId(s));
    render(<TestSteps steps={nestedSteps} />);
    for (const stepId of stepIds) {
      expect(screen.queryByTestId(testIds.getStepContent(stepId))).toBeTruthy();
    }
  });
});
