import { FC } from 'react';
import {Text, TextSizes, TextWeight} from 'components/text/text';
import {Spacer, SpacerDirections, SpacerAlign} from 'components/spacer/spacer';
import commonStyles from 'common-styles/offsets.module.css';
import cn from 'classnames';
import styles from './test-details-card.module.css';
import { createTestId } from 'utils/use-test-id-attribute';

type TestDetailsProps = {
    title: string,
    description?: string,
    className?: string
}

const testIdNamespace = 'TEST_DETAILS_CARD';

export const testIds = {
    cardTitle: createTestId(testIdNamespace, 'card-title'),
    cardDescriptionTitle: createTestId(testIdNamespace, 'card-description-title'),
    cardDescriptionText: createTestId(testIdNamespace, 'card-description-text'),
};

export const TestDetailsCard: FC<TestDetailsProps> = ({title, description,className}) => {
    return (
        <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start} className={cn(commonStyles['padding-0-16'], commonStyles['width-500'], className)}>
            <Text size={TextSizes.L1} weight={TextWeight.Semibold} tagName='h2' className={cn(commonStyles['margin-bottom-8'], styles.header)} testId={testIds.cardTitle}>
                {title}
            </Text>
            {(description && <>
                <Text weight={TextWeight.Bold} className={commonStyles['margin-bottom-4']} tagName='h3' testId={testIds.cardDescriptionTitle}>
                Description
            </Text>
            <Text weight={TextWeight.Normal} size={TextSizes.M1} tagName='p' testId={testIds.cardDescriptionText}>
                {description}
            </Text>
            </>)}
        </Spacer>
    );
}