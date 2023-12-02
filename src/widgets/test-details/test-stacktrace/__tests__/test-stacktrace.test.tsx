import { TestStackTrace, testIds } from 'widgets/test-details/test-stacktrace';
import { themedRender as render } from 'utils/test-utils';
import { screen } from '@testing-library/react';

describe('<TestStackTrace />', () => {
  it('Renders empty stacktrace', () => {
    render(<TestStackTrace />);
    expect(screen.getByTestId(testIds.text).textContent).toBe('Stacktrace is empty');
  });
  it('Renders stacktrace with content', () => {
    const stacktrace = 'Error';
    render(<TestStackTrace stacktrace={stacktrace} />);
    expect(screen.getByTestId(testIds.text).textContent).toBe(stacktrace);
  });
});
