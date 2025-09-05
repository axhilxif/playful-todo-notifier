import { createTheme } from '@mui/material/styles';
import { COLOR_PALETTES } from './color-palettes';

const getAppTheme = (mode: 'light' | 'dark', paletteId: string) => {
  const activePalette = COLOR_PALETTES.find(p => p.id === paletteId) || COLOR_PALETTES[0];
  const colors = activePalette.colors;

  // Helper to get the correct color variable based on mode
  const getColorVar = (name: string) => {
    return mode === 'light' ? `var(${name}-light)` : `var(${name}-dark)`;
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        main: `hsl(${getColorVar('--primary')})`,
      },
      secondary: {
        main: `hsl(${getColorVar('--secondary')})`,
      },
      background: {
        default: `hsl(${getColorVar('--background')})`,
        paper: `hsl(${getColorVar('--card')})`,
      },
      text: {
        primary: `hsl(${getColorVar('--foreground')})`,
        secondary: `hsl(${getColorVar('--muted-foreground')})`,
      },
      // You can define more colors here based on M3 guidelines
    },
    typography: {
      // Define M3 typography variants here
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '24px',
            boxShadow: 'none',
            backgroundColor: 'var(--mui-palette-background-paper)', // Ensure it uses the palette color
            color: 'var(--mui-palette-text-primary)', // Ensure it uses the palette color
          },
        },
      },
    },
  });
};

export default getAppTheme;
