import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// MUI Imports
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { BrowserRouter } from 'react-router-dom';

// Define a basic theme (can customize later)
const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Use dark mode to match our previous CSS
    primary: {
      main: '#90caf9', // A light blue primary color
    },
    secondary: {
      main: '#f48fb1', // A pink secondary color
    },
    background: {
      default: '#282c34', // Match old background
      paper: '#3a3f4a', // For card backgrounds etc.
    },
  },
   typography: {
     fontFamily: [ // Example using system fonts
       '-apple-system',
       'BlinkMacSystemFont',
       '"Segoe UI"',
       'Roboto',
       '"Helvetica Neue"',
       'Arial',
       'sans-serif',
       '"Apple Color Emoji"',
       '"Segoe UI Emoji"',
       '"Segoe UI Symbol"',
     ].join(','),
   },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);