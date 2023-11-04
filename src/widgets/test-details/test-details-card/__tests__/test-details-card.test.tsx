import { TestDetailsCard, testIds } from 'widgets/test-details/test-details-card';
import { screen } from '@testing-library/react';
import { themedRender as render } from 'utils/test-utils';

describe('<TestDetailsCard />', () => {
  it('TestDetailsCard with description render', () => {
    const title = 'Test-aab';
    const description = 'Lorem  ipsum dorem...';
    render(<TestDetailsCard title={title} description={description} />);
    expect(screen.getByTestId(testIds.cardTitle).textContent).toBe(title);
    expect(screen.getByTestId(testIds.cardDescriptionTitle)).toBeTruthy();
    expect(screen.getByTestId(testIds.cardDescriptionText).textContent).toBe(description);
  });

  it('TestDetailsCard without description render', () => {
    const title = 'Test-aab';
    render(<TestDetailsCard title={title} />);
    expect(screen.getByTestId(testIds.cardTitle).textContent).toBe(title);
    expect(screen.queryByTestId(testIds.cardDescriptionTitle)).toBeFalsy();
    expect(screen.queryByTestId(testIds.cardDescriptionText)).toBeFalsy();
  });
});
