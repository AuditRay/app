import '@/global.css';
import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Roboto } from "next/font/google";
import {ThemeProvider, themeConfig} from '@/theme';
const roboto = Roboto({ subsets:["latin"] ,weight: ["300", "400", "500", "700"] });
import CssBaseline from '@mui/material/CssBaseline';
import React from "react";
import 'material-icons/iconfont/material-icons.css';
import {defaultSettings, SettingsProvider} from "@/components/settings";
import {UserStateStoreProvider} from "@/providers/user-store-provider"
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: "Auditray",
  description: "Monitor your website's modules and components",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
          <body className={roboto.className}>
              <SettingsProvider
                  defaultSettings={defaultSettings}
              >
                  <AppRouterCacheProvider options={{ key: 'css' }}>
                      <ThemeProvider
                          defaultMode={themeConfig.defaultMode}
                          modeStorageKey={themeConfig.modeStorageKey}
                      >
                          <CssBaseline />
                            {children}
                      </ThemeProvider>
                  </AppRouterCacheProvider>
              </SettingsProvider>
          </body>
        </html>
    );
}
