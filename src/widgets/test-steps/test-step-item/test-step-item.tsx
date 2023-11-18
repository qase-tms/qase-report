import { FC, useCallback, useMemo } from 'react';
import { TestStep } from 'domain/model/test-model';
import { useStepsState } from '../steps-context';
import { Item, Bar, ItemContent, SubHeader, Info } from './test-step-item-styled';
import { Chevron } from 'components/chevron';
import { Text } from 'components/text';
import { TestAttachments } from 'widgets/test-attachments';

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
    return new Array(depth).fill(0).map((a, i) => -i * 36 - 24);
  }, [depth]);
  return (
    <>
      <Item onClick={toggleStep}>
        {offsets.map(x => (
          <Bar key={x} $x={x} />
        ))}
        <Chevron opened={opened} />
        <Text>{step.data.action}</Text>
      </Item>
      {opened && (
        <ItemContent>
          <SubHeader>
            <Text weight={Text.Weight.Semibold}>Expected result</Text>
          </SubHeader>
          <Info>
            <Text weight={Text.Weight.Normal}>{String(step.data.expectedResult)}</Text>
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
