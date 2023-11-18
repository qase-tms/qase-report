import { FC, useCallback, useState, useMemo } from 'react';
import { TestStep } from 'domain/model/test-model';
import { Heading } from 'components/heading';
import { Text } from 'components/text';
import { Chevron } from 'components/chevron';
import { TestAttachments } from 'widgets/test-attachments';
import styled from 'styled-components';

type TestStepsProps = {
  steps: TestStep[];
};

const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  margin-bottom: 12px;
`;

const ItemContent = styled.div`
  margin-left: 36px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SubHeader = styled.div`
  margin-bottom: 6px;
`;

const Info = styled.div`
  margin-bottom: 12px;
`;

const Bar = styled.div<{ $x: number }>`
  height: 24px;
  width: 1px;
  box-sizing: border-box;
  background: rgba(50, 66, 95, 0.17);
  transform: translateX(${props => props.$x}px);
  position: absolute;
`;

const TestStepItem: FC<{ step: TestStep; depth: number }> = ({ step, depth }) => {
  const [opened, setOpened] = useState<boolean>(true);
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

export const TestSteps: FC<TestStepsProps> = ({ steps }) => {
  return (
    <>
      <Heading>Steps</Heading>
      {steps.map(step => (
        <TestStepItem key={step.id} step={step} depth={0} />
      ))}
    </>
  );
};
