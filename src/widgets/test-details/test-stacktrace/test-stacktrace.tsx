import { FC } from 'react';
import { Text } from 'components/text';
import { styled } from 'styled-components';
import { createTestId } from 'utils/use-test-id-attribute';
import { withTestId } from 'utils/use-test-id-attribute';
import { HTMLAttributes } from 'react';

type Props = {
  stacktrace?: string | null;
};

const Output = withTestId<HTMLAttributes<HTMLElement> & { testId?: string }>(styled.p`
  word-break: break-all;
  font-size: 12px;
  white-space: pre-line;
`);

const testNamespace = 'WIDGETS-TEST-DETAILS-TEST-OVERVIEW';

export const testIds = {
  text: createTestId(testNamespace, 'text-content'),
};

export const TestStackTrace: FC<Props> = ({ stacktrace }) => {
  if (!stacktrace) {
    return (
      <Text size={Text.Size.L1} testId={testIds.text}>
        Stacktrace is empty
      </Text>
    );
  }
  return <Output testId={testIds.text}>{stacktrace}</Output>;
};
