import { FC } from 'react';
import { SidePanel } from "components/side-panel/side-panel";
import { Spacer, SpacerAlign, SpacerDirections, SpacerGaps, SpacerPreset } from 'components/spacer/spacer';
import { TestStatus } from 'domain/model/test-model';
import { Icon, IconNames, IconSizes } from 'components/icon/icon';
import { Text, TextColor, TextSizes, TextWeight } from 'components/text/text';
import commonStyles from 'common-styles/offsets.module.css';
import cn from 'classnames';
import { formatSeconds } from 'utils/time';

const mockTest = {
    "id": "0d734ca6-b214-446a-b7f7-e8bd53edf8e8",
    "title": "test_sum_odd_even_returns_odd",
    "signature": "tests/test_params_fixture.py::test_sum_odd_even_returns_odd",
    "run_id": null,
    "testops_id": null,
    "execution": {
        "start_time": 1686036740.38841,
        "status": "passed",
        "end_time": 1686036740.389014,
        "duration": 0,
        "stacktrace": null,
        "thread": "1398-MainThread"
    },
    "fields": {},
    "attachments": [],
    "steps": [],
    "params": {
        "odd": "5",
        "even": "8"
    },
    "author": null,
    "relations": [],
    "muted": false,
    "message": null
};

export const TestDetails: FC = () => {
    const { execution, title } = mockTest;
    const isPassed = execution.status === TestStatus.Passed;
    return (
        <SidePanel>
            <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start}>
                <Spacer direction={SpacerDirections.Row} gap={SpacerGaps.S} className={cn(commonStyles['padding-0-16'], commonStyles['max-width-500'], commonStyles['margin-bottom-8'])}>
                        <Icon iconName={isPassed ? IconNames.CheckMark : IconNames.Fail} />
                        <Text color={isPassed ? TextColor.Primary : TextColor.Error} size={TextSizes.M2} tagName='h1'>{isPassed ? 'Passed' : 'Failed'}</Text>
                </Spacer>
                <Spacer fullHeight direction={SpacerDirections.Row}>
                    <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start} className={cn(commonStyles['padding-0-16'], commonStyles['max-width-500'])}>
                        <Text size={TextSizes.L1} weight={TextWeight.Semibold} tagName='h2' className={commonStyles['margin-bottom-8']}>{title}</Text>
                        <Text weight={TextWeight.Bold} className={commonStyles['margin-bottom-4']} tagName='h3'>
                            Description
                        </Text>
                        <Text weight={TextWeight.Normal} size={TextSizes.M1} tagName='p'>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </Text>
                    </Spacer>
                    <Spacer fullHeight direction={SpacerDirections.Column} align={SpacerAlign.Start} className={commonStyles['padding-0-16']} preset={SpacerPreset.BorderedLeft}>
                        <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} className={commonStyles['margin-bottom-4']} tagName='p'>Duration</Text>
                        <Spacer gap={SpacerGaps.XS} className={commonStyles['margin-bottom-18']} align={SpacerAlign.End}>
                            <Icon iconName={IconNames.Clock} size={IconSizes.S} />
                            <Text size={TextSizes.S1} weight={TextWeight.Normal}>{formatSeconds(execution.duration)}</Text>
                        </Spacer>
                        <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} className={commonStyles['margin-bottom-4']} tagName='p'>Finished at</Text>
                        <Spacer gap={SpacerGaps.XS} className={commonStyles['margin-bottom-18']} align={SpacerAlign.End}>
                            <Icon iconName={IconNames.Calendar} size={IconSizes.S} />
                            <Text size={TextSizes.S1} weight={TextWeight.Normal}>{new Date(execution.end_time).toLocaleString()}</Text>
                        </Spacer>
                        <Text color={TextColor.Secondary} size={TextSizes.M1} weight={TextWeight.Semibold} className={commonStyles['margin-bottom-4']} tagName='p'>Thread</Text>
                        <Spacer gap={SpacerGaps.XS} className={commonStyles['margin-bottom-18']} align={SpacerAlign.End}>
                            <Icon iconName={IconNames.Settings} size={IconSizes.S} />
                            <Text size={TextSizes.S1} weight={TextWeight.Normal}>{execution.thread}</Text>
                        </Spacer>
                    </Spacer>
                </Spacer>
            </Spacer>
        </SidePanel>
    );
}