import { TestsLayout } from 'pages/tests-layout';
import { themedRender as render } from 'utils/test-utils';
import { useTestsLayout } from 'domain/hooks/tests-hooks/use-tests-layout';
import { TestDetails } from 'widgets/test-details';
import { TestPreviewItem } from 'widgets/test-preview-item';
import { expectPropsPassed, expectPropsWasPassed } from 'utils/test-utils';

jest.mock('domain/hooks/tests-hooks/use-tests-layout', () => ({
    useTestsLayout: jest.fn()
}));


jest.mock('widgets/test-details', () => ({
    TestDetails: jest.fn().mockImplementation(() => null)
}));

jest.mock('widgets/test-preview-item', () => ({
    TestPreviewItem: jest.fn().mockImplementation(() => null)
}));

jest.mock('components/split-pane', () => ({
    SplitPane: jest.fn().mockImplementation(({renderLeft, renderRight}) => (
        <div>
            {renderLeft()}
            {renderRight()}
        </div>
    ))
}));

const mockTests = [
    {
        "id": "1b70a53e-b66e-4b79-8308-ecf8bfe86373",
        "title": "Test with multinested steps",
        "status": "failed",
        "duration": 7,
        "thread": "1398-MainThread"
    },
    {
        "id": "d6d3f266-3e21-4f70-a14d-27bbd01fa0ae",
        "title": "test_sum_odd_even_returns_odd",
        "status": "passed",
        "duration": 0,
        "thread": "1398-MainThread"
    }
];

describe('<TestsLayout />', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('TestsLayout renders single test and activeTest sets on select', () => {
        const tests = [mockTests[0]];
        const activeTestId = null;
        const setActiveTestId = jest.fn();
        (useTestsLayout as jest.Mock).mockReturnValue({tests, activeTestId, setActiveTestId});
        (TestPreviewItem  as jest.Mock).mockImplementation(({test, onSelect}) => {
            onSelect(test);
            return null;
        });
        render(<TestsLayout />);
        expect(TestDetails).not.toBeCalled();
        expectPropsPassed(TestPreviewItem as jest.Mock, {
            test: tests[0]
        });
        expect(setActiveTestId).toBeCalledWith(tests[0].id);
    });

    it('TestsLayout renders multiple tests and activeTest sets on select', () => {
        const tests = mockTests;
        const activeTestId = null;
        const setActiveTestId = jest.fn();
        const onSelects:Function[] = [];
        (useTestsLayout as jest.Mock).mockReturnValue({tests, activeTestId, setActiveTestId});
        (TestPreviewItem  as jest.Mock).mockImplementation(({test, onSelect}) => {
            onSelects.push(() => onSelect(test));
            return null;
        });
        render(<TestsLayout />);
        expect(TestDetails).not.toBeCalled();
        expectPropsWasPassed(TestPreviewItem as jest.Mock, {
            test: tests[0]
        }, 0);
        expectPropsWasPassed(TestPreviewItem as jest.Mock, {
            test: tests[1]
        }, 1);
        onSelects[0]();
        expect(setActiveTestId).toBeCalledWith(tests[0].id);
        onSelects[1]();
        expect(setActiveTestId).toBeCalledWith(tests[1].id);
    });

    it('TestsLayout renders TestDetails with activeTestId', () => {
        const tests = mockTests;
        const activeTestId = mockTests[0].id;
        const setActiveTestId = jest.fn();
        (useTestsLayout as jest.Mock).mockReturnValue({tests, activeTestId, setActiveTestId});
        render(<TestsLayout />);
        expectPropsPassed(TestDetails as jest.Mock, {
            qaseTestId: activeTestId
        });
    });
});
