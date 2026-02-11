import type { Step } from '../../schemas/Step.schema'
import { TestStep } from './TestStep'

interface TestStepsProps {
  steps: Step[]
}

export const TestSteps = ({ steps }: TestStepsProps) => {
  return (
    <div>
      <h6 className="text-base font-semibold mb-4">
        Steps
      </h6>
      {steps.map(step => (
        <TestStep key={step.id} step={step} depth={0} />
      ))}
    </div>
  )
}
