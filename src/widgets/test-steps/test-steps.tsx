import { FC } from 'react';
import { TestStep } from 'domain/model/test-model';
import { Heading } from 'components/heading';
import { StepsProvider } from './steps-context';
import { TestStepItem } from './test-step-item';

type TestStepsProps = {
  steps: TestStep[];
};

export const TestSteps: FC<TestStepsProps> = ({ steps }) => {
  return (
    <StepsProvider>
      <Heading>Steps</Heading>
      {steps.map(step => (
        <TestStepItem key={step.id} step={step} depth={0} />
      ))}
    </StepsProvider>
  );
};
