import { FC, PropsWithChildren } from 'react';
import { Text } from 'components/text';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 6px;
  margin-top: 8px;
`;

export const Heading: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container>
      <Text weight={Text.Weight.Bold} tagName="h3">
        {children}
      </Text>
    </Container>
  );
};
