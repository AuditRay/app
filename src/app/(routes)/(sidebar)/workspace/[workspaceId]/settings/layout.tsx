'use client'
import * as React from "react";
import {Grid, List, Paper} from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useRouter, usePathname } from 'next/navigation';
import InputIcon from '@mui/icons-material/Input';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import KeyIcon from '@mui/icons-material/Key';
import {IUser} from "@/app/models";
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ExtensionIcon from '@mui/icons-material/Extension';
import EditNotificationsIcon from '@mui/icons-material/EditNotifications';
import {userSessionState} from "@/app/lib/uiStore";

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
