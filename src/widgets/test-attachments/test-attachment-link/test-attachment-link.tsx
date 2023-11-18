import { FC } from 'react';
import { TestAttachment } from 'domain/model/test-model';
import { styled } from 'styled-components';
import { Icon } from 'components/icon';
import { Text } from 'components/text';
import { useTestIdAttribute } from 'utils/use-test-id-attribute';

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

type Props = {
  attachment: TestAttachment;
  testId?: string;
};

export const AttachmentLink: FC<Props> = ({ attachment, testId }) => {
  const testAttributes = useTestIdAttribute(testId);
  return (
    <Link
      target="_blank"
      href={`qase-report-jsonp/attachments/${attachment.id}-${attachment.file_name}`}
      {...testAttributes}
    >
      <Icon size={Icon.Size.M} iconName={Icon.Name.File} />
      <Text>{attachment.file_name}</Text>
    </Link>
  );
};
