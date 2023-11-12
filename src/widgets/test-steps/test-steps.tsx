import { FC, useCallback, useState } from 'react';
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
  margin-left: 24px;
  margin-bottom: 16px;
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

const TestStepItem: FC<{ step: TestStep }> = ({ step }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const toggleStep = useCallback(() => {
    setOpened(!opened);
  }, [opened]);
  return (
    <>
      <Item onClick={toggleStep}>
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
            <TestStepItem key={step.id} step={step} />
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
        <TestStepItem key={step.id} step={step} />
      ))}
    </>
  );
};
