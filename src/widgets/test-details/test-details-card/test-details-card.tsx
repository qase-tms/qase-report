import { FC } from 'react';
import {Text, TextSizes, TextWeight} from 'components/text/text';
import {Spacer, SpacerDirections, SpacerAlign} from 'components/spacer/spacer';
import commonStyles from 'common-styles/offsets.module.css';
import cn from 'classnames';

type TestDetailsProps = {
    title: string,
    description?: string,
    className?: string
}

export const TestDetailsCard: FC<TestDetailsProps> = ({title, description,className}) => {
    return (
        <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start} className={cn(commonStyles['padding-0-16'], commonStyles['max-width-500'], className)}>
            <Text size={TextSizes.L1} weight={TextWeight.Semibold} tagName='h2' className={commonStyles['margin-bottom-8']}>{title}</Text>
            {(description && <>
                <Text weight={TextWeight.Bold} className={commonStyles['margin-bottom-4']} tagName='h3'>
                Description
            </Text>
            <Text weight={TextWeight.Normal} size={TextSizes.M1} tagName='p'>
                {description}
            </Text>
            </>)}
        </Spacer>
    );
}