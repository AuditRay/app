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
    const pathname = usePathname()
    const {workspaceId} = React.use(params);
    const [user, setUser] = React.useState<IUser | null>(null);
    const sessionUser = userSessionState((state) => state.user);
    React.useEffect(() => {
        setUser(sessionUser)
    }, [sessionUser]);
    const router = useRouter();
    return (
        <>
            <Grid item xs={12} md={4} lg={3}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    <List component="nav">
                        <ListItemButton selected={pathname === `/workspace/${workspaceId}/settings`} disabled={!user} onClick={() => user && router.push(`/workspace/${workspaceId}/settings`)}>
                            <ListItemIcon>
                                <WorkspacesIcon sx={{marginLeft: '6px'}}/>
                            </ListItemIcon>
                            <ListItemText primary="General"/>
                        </ListItemButton>
                        <ListItemButton selected={pathname === `/workspace/${workspaceId}/settings/alerts`} disabled={!user} onClick={() => user && router.push(`/workspace/${workspaceId}/settings/alerts`)}>
                            <ListItemIcon>
                                <EditNotificationsIcon sx={{marginLeft: '6px'}}/>
                            </ListItemIcon>
                            <ListItemText primary="Alerts"/>
                        </ListItemButton>
                        <ListItemButton selected={pathname === `/workspace/${workspaceId}/settings/field-templates`} disabled={!user} onClick={() => user && router.push(`/workspace/${workspaceId}/settings/field-templates`)}>
                            <ListItemIcon>
                                <InputIcon sx={{marginLeft: '6px'}}/>
                            </ListItemIcon>
                            <ListItemText primary="Field Templates"/>
                        </ListItemButton>
                        <ListItemButton selected={pathname === `/workspace/${workspaceId}/settings/integrations`} disabled={!user} onClick={() => user && router.push(`/workspace/${workspaceId}/settings/integrations`)}>
                            <ListItemIcon>
                                <ExtensionIcon sx={{marginLeft: '6px'}}/>
                            </ListItemIcon>
                            <ListItemText primary="Integrations"/>
                        </ListItemButton>
                        <ListItemButton selected={pathname === `/workspace/${workspaceId}/settings/users`} disabled={!user} onClick={() => user && router.push(`/workspace/${workspaceId}/settings/users`)}>
                            <ListItemIcon>
                                <GroupIcon sx={{marginLeft: '6px'}}/>
                            </ListItemIcon>
                            <ListItemText primary="Users"/>
                        </ListItemButton>
                        <ListItemButton selected={pathname === `/workspace/${workspaceId}/settings/teams`} disabled={!user} onClick={() => user && router.push(`/workspace/${workspaceId}/settings/teams`)}>
                            <ListItemIcon>
                                <GroupsIcon sx={{marginLeft: '6px'}}/>
                            </ListItemIcon>
                            <ListItemText primary="Teams"/>
                        </ListItemButton>
                        <ListItemButton selected={pathname === `/workspace/${workspaceId}/settings/roles`} disabled={!user} onClick={() => user && router.push(`/workspace/${workspaceId}/settings/roles`)}>
                            <ListItemIcon>
                                <KeyIcon sx={{marginLeft: '6px'}}/>
                            </ListItemIcon>
                            <ListItemText primary="Roles"/>
                        </ListItemButton>
                    </List>
                </Paper>
            </Grid>
            {/* Chart */}
            <Grid item xs={12} md={8} lg={9}>
                <Paper
                    sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {children}
                </Paper>
            </Grid>
            {/* Recent Deposits */}
        </>
    );
}
