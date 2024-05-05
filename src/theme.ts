'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    palette: {
        mode: 'light',
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
        fontSize: 12,
        h1: {
            fontSize: '1.3rem',
        },
        h2: {
            fontSize: '1.2rem',
        },
        h3: {
            fontSize: '1.1rem',
        },
        h4: {
            fontSize: '1rem',
        },
        h5: {
            fontSize: '0.9rem',
        },
        h6: {
            fontSize: '0.8rem',
        }
    },
    components: {
        MuiAlert: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.severity === 'info' && {
                        backgroundColor: '#60a5fa',
                    }),
                }),
            },
        },
    },
});

export default theme;