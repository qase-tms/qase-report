import { TestDetailsSummary, testIds } from 'widgets/test-details/test-details-summary';
import { screen } from '@testing-library/react';
import { themedRender as render } from 'utils/test-utils';

describe('<TestDetailsSummary />', () => {
    it('TestDetailsSummary render', () => {
        const duration = 60;
        const endTime = 1698265673771;
        const thread = 'thread--001';
        render(<TestDetailsSummary duration={duration} endTime={endTime} thread={thread}/>);
        expect(screen.getByTestId(testIds.durationField).textContent).toBe('60ms');
        expect(screen.getByTestId(testIds.endTimeField).textContent).toBe('25.10.2023, 23:27:53');
        expect(screen.getByTestId(testIds.threadField).textContent).toBe(thread);
    });
});
