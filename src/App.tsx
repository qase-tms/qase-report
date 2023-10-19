import { FC } from 'react';
import { AppBar, createTheme, ThemeProvider, Toolbar } from '@mui/material'
import { MainLayout } from 'components/main-layout/main-layout';


export const App: FC = () => {
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="fixed"
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <Toolbar variant={'dense'}>Qase | Report</Toolbar>
      </AppBar>
      <Toolbar variant={'dense'} />
      <MainLayout />
    </ThemeProvider>
  );
};