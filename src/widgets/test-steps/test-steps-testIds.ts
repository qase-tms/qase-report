import { createTestId } from 'utils/use-test-id-attribute';

const testIdNamespace = 'WIDGET_TEST_STEPS';

export const testIds = {
  getStepTitle: (id: string) => createTestId(testIdNamespace, `step-title-${id}`),
  getStepContent: (id: string) => createTestId(testIdNamespace, `step-content-${id}`),
  getStepExpectedResult: (id: string) =>
    createTestId(testIdNamespace, `step-expected-result-${id}`),
};
