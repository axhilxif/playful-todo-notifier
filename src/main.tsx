import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getAppTheme from './lib/theme';
import { useTheme } from './hooks/use-theme';

const ThemedApp = () => {
  const { theme, paletteId } = useTheme(); // Get the current theme mode and paletteId from our custom hook
  const muiTheme = getAppTheme(theme, paletteId); // Create MUI theme based on the mode and paletteId

  return (
    <ThemeProvider theme={muiTheme}>
      {/* <CssBaseline /> */}
      <App />
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <ThemedApp />
);