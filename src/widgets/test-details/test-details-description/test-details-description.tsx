import { FC } from 'react';
import { Text } from 'components/text';
import { createTestId } from 'utils/use-test-id-attribute';
import { CardSubTitle, Container } from './test-details-description-styled';

type TestDetailsProps = {
  description?: string;
};

const testIdNamespace = 'TEST_DETAILS_CARD';

export const testIds = {
  cardDescriptionTitle: createTestId(testIdNamespace, 'card-description-title'),
  cardDescriptionText: createTestId(testIdNamespace, 'card-description-text'),
};

export const TestDetailsDescription: FC<TestDetailsProps> = ({ description }) => {
  return (
    <Container>
      <CardSubTitle>
        <Text weight={Text.Weight.Bold} tagName="h3" testId={testIds.cardDescriptionTitle}>
          Description
        </Text>
      </CardSubTitle>
      <Text
        weight={Text.Weight.Normal}
        size={Text.Size.M1}
        tagName="p"
        testId={testIds.cardDescriptionText}
      >
        {description}
      </Text>
    </Container>
  );
};
