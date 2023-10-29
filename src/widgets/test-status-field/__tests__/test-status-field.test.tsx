import { TestStatusField, testIds } from 'widgets/test-status-field';
import { screen } from '@testing-library/react';
import { expectPropsPassed, themedRender as render } from 'utils/test-utils';
import { TestStatus } from 'domain/model/test-model';
import { Icon } from 'components/icon/icon';
import { IconName } from 'components/icon/icon-types';

jest.mock('components/icon/icon', () => ({
    Icon: jest.fn().mockImplementation(() => null)
}));

describe('<TestDetailsField />', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('TestDetailsField simple render for passed test', () => {
        const status = TestStatus.Passed;
        render(<TestStatusField status={status} />);

        expectPropsPassed(Icon as jest.Mock, {
            iconName: IconName.CheckMark
        });
    });
    it('TestDetailsField simple render for failed test', () => {
        const status = TestStatus.Failed;
        render(<TestStatusField status={status} />);

        expectPropsPassed(Icon as jest.Mock, {
            iconName: IconName.Fail
        });
    });

    it('TestDetailsField simple render for skipped test', () => {
        const status = TestStatus.Skipped;
        render(<TestStatusField status={status} />);

        expectPropsPassed(Icon as jest.Mock, {
            iconName: IconName.Minus
        });
    });

    it('TestDetailsField  render with text for invalid test', () => {
        const status = TestStatus.Invalid;
        render(<TestStatusField status={status} withText/>);

        expect(screen.getByTestId(testIds.statusText).textContent).toBe('invalid');

        expectPropsPassed(Icon as jest.Mock, {
            iconName: IconName.Exclamation
        });
    });
});
