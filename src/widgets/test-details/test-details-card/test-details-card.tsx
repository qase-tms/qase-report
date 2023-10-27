import { FC } from 'react';
import {Text, TextSizes, TextWeight} from 'components/text/text';
import {Spacer, SpacerDirections, SpacerAlign} from 'components/spacer/spacer';
import { createTestId } from 'utils/use-test-id-attribute';

type TestDetailsProps = {
    title: string,
    description?: string,
    css?: string
}

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
    text-overflow: ellipsis;
    overflow: hidden;
    margin-bottom: 8px;
`;

export const TestDetailsCard: FC<TestDetailsProps> = ({title, description,css}) => {
    return (
        <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start} css={cardCss + (css ?? '')}>
            <Text size={TextSizes.L1} weight={TextWeight.Semibold} tagName='h2' css={headerCss} testId={testIds.cardTitle}>
                {title}
            </Text>
            {(description && <>
                <Text weight={TextWeight.Bold} css={'margin-bottom: 4px;'} tagName='h3' testId={testIds.cardDescriptionTitle}>
                Description
            </Text>
            <Text weight={TextWeight.Normal} size={TextSizes.M1} tagName='p' testId={testIds.cardDescriptionText}>
                {description}
            </Text>
            </>)}
        </Spacer>
    );
}