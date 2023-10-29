import { TestDetailsHeader, testIds } from 'widgets/test-details/test-details-header';
import { render, screen } from '@testing-library/react';
import { TestStatus } from 'domain/model/test-model';

describe('<TestDetailsHeader />', () => {
    it('TestDetailsHeader passed render', () => {
        const status = TestStatus.Passed;
        render(<TestDetailsHeader status={status} />);
        expect(screen.getByTestId(testIds.headerTitle).textContent).toBe('Passed');
        expect(screen.getByTestId(testIds.headerPassedIcon)).toBeTruthy();
    });
    it('TestDetailsHeader failed render', () => {
        const status = TestStatus.Failed;
        render(<TestDetailsHeader status={status} />);
        expect(screen.getByTestId(testIds.headerTitle).textContent).toBe('Failed');
        expect(screen.getByTestId(testIds.headerFailedIcon)).toBeTruthy();
    });
});
