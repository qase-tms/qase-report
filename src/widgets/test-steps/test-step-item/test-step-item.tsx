import { FC, useCallback, useMemo } from 'react';
import { TestStep } from 'domain/model/test-model';
import { useStepsState } from '../steps-context';
import { Item, Bar, ItemContent, SubHeader, Info } from './test-step-item-styled';
import { Chevron } from 'components/chevron';
import { Text } from 'components/text';
import { TestAttachments } from 'widgets/test-attachments';
import { getBarsOffsets } from './get-bars-offset';
import { testIds } from '../test-steps-testIds';

type Props = {
  step: TestStep;
  depth: number;
};

export const TestStepItem: FC<Props> = ({ step, depth }) => {
  const [{ opened }, setOpened] = useStepsState(step.id);
  const toggleStep = useCallback(() => {
    setOpened(!opened);
  }, [opened]);
  const offsets = useMemo(() => {
    return getBarsOffsets(depth);
  }, [depth]);
  return (
    <>
      <Item onClick={toggleStep}>
        {offsets.map(x => (
          <Bar key={x} $x={x} />
        ))}
        <Chevron opened={opened} />
        <Text testId={testIds.getStepTitle(step.id)}>{step.data.action ?? `Step#${step.id}`}</Text>
      </Item>
      {opened && (
        <ItemContent testId={testIds.getStepContent(step.id)}>
          <SubHeader>
            <Text weight={Text.Weight.Semibold}>Expected result</Text>
          </SubHeader>
          <Info>
            <Text weight={Text.Weight.Normal} testId={testIds.getStepExpectedResult(step.id)}>
              {String(step.data.expected_result)}
            </Text>
          </Info>
          {Boolean(step.attachments.length) && <TestAttachments attachments={step.attachments} />}
          {step.steps.map(step => (
            <TestStepItem key={step.id} step={step} depth={depth + 1} />
          ))}
        </ItemContent>
      )}
    </>
  );
};
