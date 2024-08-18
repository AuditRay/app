import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Roboto } from "next/font/google";
import {Container, ThemeProvider} from '@mui/material';
const roboto = Roboto({ subsets:["latin"] ,weight: ["300", "400", "500", "700"] });
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import React from "react";
import 'material-icons/iconfont/material-icons.css';


export const metadata: Metadata = {
  title: "Monit",
  description: "Monitor your website's modules and components",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
          <body className={roboto.className}>
              <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                  <ThemeProvider theme={theme}>
                      <CssBaseline />
                        {children}
                  </ThemeProvider>
              </AppRouterCacheProvider>
          </body>
        </html>
    );
}
