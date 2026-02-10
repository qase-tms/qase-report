import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

export const theme = extendTheme({
  colorSchemes: {
    light: {},
    dark: {
      palette: {
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
      },
    },
  },
})
