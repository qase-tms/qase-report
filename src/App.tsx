import { FC } from 'react';
import { createTheme, ThemeProvider, Toolbar } from '@mui/material';
import { MainLayout } from 'components/main-layout/main-layout';
import { Header } from 'components/header/header';


export const App: FC = () => {
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Toolbar variant={'dense'} />
      <MainLayout />
    </ThemeProvider>
  );
};