import { FC } from 'react';
import { Text } from 'components/text';
import { createTestId } from 'utils/use-test-id-attribute';
import { Heading } from 'components/heading';

type TestDetailsProps = {
  description?: string;
};

const testIdNamespace = 'TEST_DETAILS_CARD';

export const testIds = {
  cardDescriptionText: createTestId(testIdNamespace, 'card-description-text'),
};

export const TestDetailsDescription: FC<TestDetailsProps> = ({ description }) => {
  return (
    <>
      <Heading>Description</Heading>
      <Text
        weight={Text.Weight.Normal}
        size={Text.Size.M1}
        tagName="p"
        testId={testIds.cardDescriptionText}
      >
        {description}
      </Text>
    </>
  );
};
