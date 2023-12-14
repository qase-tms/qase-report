import { Input, testIds } from '../input';
import { screen, fireEvent } from '@testing-library/react';
import { themedRender as render } from 'utils/test-utils';

describe('<Input />', () => {
  it('sets value and placeholder to input', () => {
    const value = 'value';
    const placeholder = 'placeholder';
    render(<Input value={value} placeholder={placeholder} />);
    expect((screen.getByTestId(testIds.inputField) as HTMLInputElement).value).toBe(value);
    expect((screen.getByTestId(testIds.inputField) as HTMLInputElement).placeholder).toBe(
      placeholder,
    );
  });
  it('does not render crossbar if onChange is not provided', () => {
    const value = 'value';
    const placeholder = 'placeholder';
    render(<Input value={value} placeholder={placeholder} />);
    expect(screen.queryByTestId(testIds.crossSlot)).toBeFalsy();
  });
  it('does not render crossbar if value is empty', () => {
    const placeholder = 'placeholder';
    render(<Input value={''} placeholder={placeholder} />);
    expect(screen.queryByTestId(testIds.crossSlot)).toBeFalsy();
  });
  it('renders crossbar if value is not empty and onChange is provided', () => {
    const value = 'value';
    const handleChange = jest.fn();
    render(<Input value={value} onChange={handleChange} />);
    expect(screen.queryByTestId(testIds.crossSlot)).toBeTruthy();
  });
  it('triggers callback with value on input change', () => {
    const value = 'value';
    const handleChange = jest.fn();
    render(<Input value={value} onChange={handleChange} />);
    fireEvent.change(screen.getByTestId(testIds.inputField), {
      target: {
        value: 'new value',
      },
    });
    expect(handleChange).toBeCalledWith('new value');
  });
  it('filters forbidden chars before input change', () => {
    const value = 'value';
    const handleChange = jest.fn();
    render(<Input value={value} onChange={handleChange} forbidRegex={/[#&]/g} />);
    fireEvent.change(screen.getByTestId(testIds.inputField), {
      target: {
        value: 'new& value#',
      },
    });
    expect(handleChange).toBeCalledWith('new value');
  });
  it('calls onChange callback with empty string on crossbar click', () => {
    const value = 'value';
    const handleChange = jest.fn();
    render(<Input value={value} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId(testIds.crossSlot));
    expect(handleChange).toBeCalledWith('');
  });
});
