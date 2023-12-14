import { DetailedHTMLProps, InputHTMLAttributes, HTMLAttributes } from 'react';
import styled from 'styled-components';
import { withTestId } from 'utils/use-test-id-attribute';

export const Container = styled.div`
  border: 1px solid #d1d7dd;
  border-radius: 6px;
  padding: 6px 24px 6px 10px;
  display: inline-block;
  box-sizing: border-box;
  position: relative;
`;

export const StyledInput = withTestId<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & { testId?: string }
>(styled.input`
  border: none;
  outline: none;
  font-size: 15px;
  line-height: 18px;
  box-sizing: border-box;
  padding: 0;
`);

export const CrossSlot = withTestId<
  HTMLAttributes<HTMLDivElement> & { testId?: string }
>(styled.div`
  cursor: pointer;
  position: absolute;
  top: 5px;
  right: 10px;
`);
