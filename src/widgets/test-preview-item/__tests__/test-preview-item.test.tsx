import { TestPreviewItem, testIds } from 'widgets/test-preview-item';
import { screen, fireEvent } from '@testing-library/react';
import { themedRender as render } from 'utils/test-utils';
import { TestStatus } from 'domain/model/test-model';
import { TestStatusField } from 'widgets/test-status-field';
import { expectPropsPassed } from 'utils/test-utils';
import { IconName } from 'components/icon/icon-types';

const mockTest = {
    id: '1',
    thread: '#1',
    title: 'Title',
    status: TestStatus.Passed,
    duration: 60
};

jest.mock('widgets/test-status-field', () => ({
    TestStatusField: jest.fn().mockImplementation(() => null)
}));

describe('<TestPreviewItem />', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('TestPreviewItem success renders with checkmark', () => {
        const test = mockTest;
        render(<TestPreviewItem test={test} />);
        expect(screen.getByTestId(testIds.itemTitle).textContent).toBe(test.title);
        expect(screen.getByTestId(testIds.itemFieldDuration).textContent).toBe('60ms');
        expectPropsPassed(TestStatusField as jest.Mock, {
            status: mockTest.status
        });
    });

    it('TestPreviewItem failed renders with error icon', () => {
        const test = {
            ...mockTest,
            status: TestStatus.Failed
        };
        render(<TestPreviewItem test={test} />);
        expect(screen.getByTestId(testIds.itemTitle).textContent).toBe(test.title);
        expect(screen.getByTestId(testIds.itemFieldDuration).textContent).toBe('60ms');
        expectPropsPassed(TestStatusField as jest.Mock, {
            status: TestStatus.Failed
        });
    });

    it('TestPreviewItem triggers onSelect callback with test as argument', () => {
        const test = mockTest;
        const onClick = jest.fn();
        render(<TestPreviewItem test={test} onSelect={onClick}/>);
        fireEvent.click(screen.getByTestId(testIds.itemRoot));
        expect(onClick).toBeCalledWith(test);
    });
});
