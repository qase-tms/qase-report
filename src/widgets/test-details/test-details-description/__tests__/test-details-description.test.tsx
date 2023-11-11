import { TestDetailsDescription, testIds } from 'widgets/test-details/test-details-description';
import { screen } from '@testing-library/react';
import { themedRender as render } from 'utils/test-utils';

describe('<TestDetailsDescription />', () => {
  it('TestDetailsDescription render', () => {
    const description = 'Lorem  ipsum dorem...';
    render(<TestDetailsDescription description={description} />);
    expect(screen.getByTestId(testIds.cardDescriptionTitle)).toBeTruthy();
    expect(screen.getByTestId(testIds.cardDescriptionText).textContent).toBe(description);
  });
});
