import { FC } from 'react';
import { Text } from 'components/text';
import { Spacer } from 'components/spacer';
import { createTestId } from 'utils/use-test-id-attribute';

type TestDetailsProps = {
  title: string;
  description?: string;
  css?: string;
};

const testIdNamespace = 'TEST_DETAILS_CARD';

export const testIds = {
  cardTitle: createTestId(testIdNamespace, 'card-title'),
  cardDescriptionTitle: createTestId(testIdNamespace, 'card-description-title'),
  cardDescriptionText: createTestId(testIdNamespace, 'card-description-text'),
};

const cardCss = `
    padding: 0 16px;
    min-width: 400px;
`;

const headerCss = `
    max-width: 400px;
    word-wrap: break-word;
    overflow: hidden;
    margin-bottom: 8px;
`;

export const TestDetailsCard: FC<TestDetailsProps> = ({ title, description, css }) => {
  return (
    <Spacer
      fullHeight
      direction={Spacer.Direction.Column}
      align={Spacer.Align.Start}
      css={cardCss + (css ?? '')}
    >
      <Text
        size={Text.Size.L1}
        weight={Text.Weight.Semibold}
        tagName="h2"
        css={headerCss}
        testId={testIds.cardTitle}
      >
        {title}
      </Text>
      {description && (
        <>
          <Text
            weight={Text.Weight.Bold}
            css={'margin-bottom: 4px;'}
            tagName="h3"
            testId={testIds.cardDescriptionTitle}
          >
            Description
          </Text>
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
    </Spacer>
  );
};
