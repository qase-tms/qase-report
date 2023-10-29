import { TestDetails, testIds } from 'widgets/test-details';
import { screen } from '@testing-library/react';
import { themedRender as render } from 'utils/test-utils';
import { useTestDetails } from 'domain/hooks/tests-hooks/use-test-details';
import { RequestStatus } from 'utils/use-request';
import { TestDetailsCard } from 'widgets/test-details/test-details-card';
import { TestDetailsSummary } from 'widgets/test-details/test-details-summary';
import { TestStatusField } from 'widgets/test-status-field';
import { expectPropsPassed } from 'utils/test-utils';

jest.mock('domain/hooks/tests-hooks/use-test-details', () => ({
    useTestDetails: jest.fn()
}));

jest.mock('widgets/test-status-field', () => ({
    TestStatusField: jest.fn().mockImplementation(() => null)
}));

jest.mock('widgets/test-details/test-details-summary', () => ({
    TestDetailsSummary: jest.fn().mockImplementation(() => null)
}));

jest.mock('widgets/test-details/test-details-card', () => ({
    TestDetailsCard: jest.fn().mockImplementation(() => null)
}));

describe('<TestDetails />', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('TestDetails renders error', () => {
        (useTestDetails as jest.Mock).mockReturnValue({ test: null, testRequestStatus: RequestStatus.Failed});
        render(<TestDetails qaseTestId='test' />);
        expect(screen.getByTestId(testIds.errorField)).toBeTruthy();
    });

    it('TestDetails renders test data', () => {
        const test = {
            id: "15e9c820-5242-4b80-8f6c-47ad85d4fbfc",
            title: "#1 Test with successful steps",
            execution: {
                start_time: 1691652628.650742,
                status: "passed",
                end_time: 1691652628.651354,
                duration: 0,
                thread: "50366-MainThread"
            },
            fields: {
                description: "Some cool test with steps"
            },
        };
        (useTestDetails as jest.Mock).mockReturnValue({testRequestStatus: RequestStatus.Success, test});
        render(<TestDetails qaseTestId={test.id} />);
        expect(screen.queryByTestId(testIds.errorField)).toBeFalsy();
        
        expectPropsPassed(TestStatusField as jest.Mock, { status: test.execution.status });
        expectPropsPassed(TestDetailsSummary as jest.Mock, {
            duration: test.execution.duration,
            thread: test.execution.thread,
            endTime: test.execution.end_time
        });
        expectPropsPassed(TestDetailsCard as jest.Mock, {
            title: test.title,
            description: test.fields.description
        });
    });
});
