'use client'
import * as React from "react";
import {Paper} from "@mui/material";

export default function SettingsLayout({children, params}: {
    children: React.ReactNode,
    params: Promise<{ workspaceId: string }>
}) {
    return (
        <>
            <Paper
                sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {children}
            </Paper>
        </>
    );
}
