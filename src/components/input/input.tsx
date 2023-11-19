import { ChangeEvent, FC, useCallback } from 'react';
import { Icon } from 'components/icon';
import styled from 'styled-components';

const Container = styled.div`
  border: 1px solid #d1d7dd;
  border-radius: 6px;
  padding: 6px 24px 6px 10px;
  display: inline-block;
  box-sizing: border-box;
  position: relative;
`;

const StyledInput = styled.input`
  border: none;
  outline: none;
  font-size: 15px;
  line-height: 18px;
  box-sizing: border-box;
  padding: 0;
`;

const CrossSlot = styled.div`
  cursor: pointer;
  position: absolute;
  top: 5px;
  right: 10px;
`;

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  forbidRegex?: RegExp;
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
      />
      {value && onChange && (
        <CrossSlot onClick={handleClear}>
          <Icon iconName={Icon.Name.Xmark} size={Icon.Size.M} />
        </CrossSlot>
      )}
    </Container>
  );
};
