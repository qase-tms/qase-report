import { TestPreviewItem, testIds } from 'widgets/test-preview-item/test-preview-item';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestStatus } from 'domain/model/test-model';

const mockTest = {
    id: '1',
    thread: '#1',
    title: 'Title',
    status: TestStatus.Passed,
    duration: 60
};

describe('<TestPreviewItem />', () => {
    it('TestPreviewItem success renders with checkmark', () => {
        const test = mockTest;
        render(<TestPreviewItem test={test} />);
        expect(screen.getByTestId(testIds.itemTitle).textContent).toBe(test.title);
        expect(screen.getByTestId(testIds.itemFieldDuration).textContent).toBe('0h 1m 0s');
        expect(screen.getByTestId(testIds.itemIconSuccess)).toBeTruthy();
    });

    it('TestPreviewItem failed renders with error icon', () => {
        const test = {
            ...mockTest,
            status: TestStatus.Failed
        };
        render(<TestPreviewItem test={test} />);
        expect(screen.getByTestId(testIds.itemTitle).textContent).toBe(test.title);
        expect(screen.getByTestId(testIds.itemFieldDuration).textContent).toBe('0h 1m 0s');
        expect(screen.getByTestId(testIds.itemIconFail)).toBeTruthy();
    });

    it('TestPreviewItem triggers onSelect callback with test as argument', () => {
        const test = mockTest;
        const onClick = jest.fn();
        render(<TestPreviewItem test={test} onSelect={onClick}/>);
        fireEvent.click(screen.getByTestId(testIds.itemRoot));
        expect(onClick).toBeCalledWith(test);
    });
});
