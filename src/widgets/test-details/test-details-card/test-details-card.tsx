import { FC } from 'react';
import { Text } from 'components/text';
import { createTestId } from 'utils/use-test-id-attribute';
import { FlexColumn } from 'components/flex-column';
import { Card, CardHeader, CardSubTitle } from './test-details-card-styled';

type TestDetailsProps = {
  title: string;
  description?: string;
};

const testIdNamespace = 'TEST_DETAILS_CARD';

export const testIds = {
  cardTitle: createTestId(testIdNamespace, 'card-title'),
  cardDescriptionTitle: createTestId(testIdNamespace, 'card-description-title'),
  cardDescriptionText: createTestId(testIdNamespace, 'card-description-text'),
};

export const TestDetailsCard: FC<TestDetailsProps> = ({ title, description }) => {
  return (
    <Card>
      <FlexColumn>
        <CardHeader>
          <Text
            size={Text.Size.L1}
            weight={Text.Weight.Semibold}
            tagName="h2"
            testId={testIds.cardTitle}
          >
            {title}
          </Text>
        </CardHeader>
        {description && (
          <>
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
          </>
        )}
      </FlexColumn>
    </Card>
  );
};
