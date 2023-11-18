import { FC } from 'react';
import { TestAttachment } from 'domain/model/test-model';
import { Text } from 'components/text';
import { Heading } from 'components/heading';
import styled from 'styled-components';
import { AttachmentLink } from './test-attachment-link';
import { createTestId } from 'utils/use-test-id-attribute';

type Props = {
  attachments: TestAttachment[];
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const testIdNamespace = 'WIDGET_TEST_ATTACHMENTS';

export const testIds = {
  getAttachmentLink: (id: string) => createTestId(testIdNamespace, `attachment-title-${id}`),
};

export const TestAttachments: FC<Props> = ({ attachments }) => {
  return (
    <Container>
      <Heading>
        <Text weight={Text.Weight.Semibold}>Attachments</Text>
      </Heading>
      {attachments.map(attachment => (
        <AttachmentLink
          key={attachment.id}
          attachment={attachment}
          testId={testIds.getAttachmentLink(attachment.id)}
        />
      ))}
    </Container>
  );
};
