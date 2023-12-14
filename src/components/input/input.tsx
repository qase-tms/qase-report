import { ChangeEvent, FC, useCallback } from 'react';
import { Icon } from 'components/icon';
import { Container, StyledInput, CrossSlot } from './input-styled';
import { createTestId } from 'utils/use-test-id-attribute';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  forbidRegex?: RegExp;
};

const testIdNamespace = 'COMPONENT_INPUT';

export const testIds = {
  inputField: createTestId(testIdNamespace, 'input-field'),
  crossSlot: createTestId(testIdNamespace, 'cross-slot'),
};

export const Input: FC<Props> = ({ value, onChange, placeholder, forbidRegex }) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        let value = event.target.value || '';
        if (forbidRegex) {
          value = value.replaceAll(forbidRegex, '');
        }
        onChange(value);
      }
    },
    [onChange, forbidRegex],
  );
  const handleClear = useCallback(() => {
    if (onChange) {
      onChange('');
    }
  }, [onChange]);
  return (
    <Container>
      <StyledInput
        type="text"
        value={value ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        testId={testIds.inputField}
      />
      {value && onChange && (
        <CrossSlot onClick={handleClear} testId={testIds.crossSlot}>
          <Icon iconName={Icon.Name.Xmark} size={Icon.Size.M} />
        </CrossSlot>
      )}
    </Container>
  );
};
