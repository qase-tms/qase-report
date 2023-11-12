import { FC } from 'react';
import { TestAttachment } from 'domain/model/test-model';
import { Text } from 'components/text';
import { Heading } from 'components/heading';
import styled from 'styled-components';
import { Icon } from 'components/icon';

type Props = {
  attachments: TestAttachment[];
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Link = styled.a`
  text-decoration: none;
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  color: inherit;

  &:hover {
    text-decoration: none;
    color: inherit;
  }

  &:visited {
    color: inherit;
  }
`;

const AttachmentLink: FC<{ attachment: TestAttachment }> = ({ attachment }) => {
  return (
    <Link
      target="_blank"
      href={`qase-report-jsonp/attachments/${attachment.id}-${attachment.file_name}`}
      key={attachment.id}
    >
      <Icon size={Icon.Size.M} iconName={Icon.Name.File} />
      <Text>{attachment.file_name}</Text>
    </Link>
  );
};

export const TestAttachments: FC<Props> = ({ attachments }) => {
  return (
    <Container>
      <Heading>
        <Text weight={Text.Weight.Semibold}>Attachments</Text>
      </Heading>
      {attachments.map(attachment => (
        <AttachmentLink key={attachment.id} attachment={attachment} />
      ))}
    </Container>
  );
};
