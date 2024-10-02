'use client'
import * as React from "react";
import {Box, Container, Grid, IconButton, Typography, Divider, List, Toolbar, Badge} from "@mui/material";
import {AppBar, Drawer} from "@/app/ui/NavBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {MainListItems} from "@/app/ui/ListItems";
import {usePathname} from "next/navigation"
import {getFiltersViews} from "@/app/actions/filterViewsActions";
import {IFiltersView} from "@/app/models/FiltersView";
import { LicenseInfo } from '@mui/x-license';
import Gleap from 'gleap';
import AccountMenu from "@/app/ui/AccountMenu";
import {IUser} from "@/app/models";
import {getFullUser, getUser} from "@/app/actions/getUser";
import {userSessionState} from "@/app/lib/uiStore";
LicenseInfo.setLicenseKey('d180cacff967bbf4eb0152899dacbe68Tz05MzI0OCxFPTE3NTEwNDc4MDIwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

export default function DashboardLayout({children,}: {
    children: React.ReactNode
}) {
    const [filterViews, setFilterViews] = React.useState<IFiltersView[]>([]);
    const [user, setUser] = React.useState<IUser | null>(null);
    const sessionUser = userSessionState((state) => state.user);
    const sessionFullUser = userSessionState((state) => state.fullUser);
    const setSessionUser = userSessionState((state) => state.setUser);
    const setSessionFullUser = userSessionState((state) => state.setFullUser);
    const pathname = usePathname();
    const TitlesMap: Record<string, string> = {
        '/websites': 'Websites',
        '/': 'Dashboard',
        '/dashboard': 'Dashboard',
        '/settings': 'Workspace Settings',
        '/settings/field-templates': 'Workspace Fields',
        '/settings/users': 'Workspace Users',
        '/settings/teams': 'Workspace Teams',
        '/settings/roles': 'Workspace Roles',
    }
    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };
    React.useEffect(() => {
        getFiltersViews().then((filtersViews) => {
            setFilterViews(filtersViews);
        });
        if(sessionUser){
            console.log("sessionUser");
            setUser(sessionUser);
            if(!sessionFullUser) {
                console.log("!sessionFullUser");
                getFullUser(sessionUser.id).then((user) => {
                    setSessionFullUser(user);
                });
            } else {
                console.log("sessionFullUser");
            }
        } else {
            console.log("!sessionUser");
            getUser().then((user) => {
                setSessionUser(user);
                getFullUser(user.id).then((user) => {
                    setSessionFullUser(user);
                });
            });
        }
    }, [sessionFullUser, sessionUser, setSessionFullUser, setSessionUser]);
    console.log("test", sessionFullUser, sessionUser, setSessionFullUser, setSessionUser);
    React.useEffect(() => {
        // Run within useEffect to execute this code on the frontend.
        Gleap.initialize("OSiO40QAObCvUHbraB791AyK5GqygSCL");
    }, []);
    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="absolute" open={open}>
                <Toolbar
                    sx={{
                        pr: '0px', // keep right padding when drawer closed
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            marginRight: '36px',
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        component="h1"
                        variant="h1"
                        color="inherit"
                        noWrap
                        sx={{ flexGrow: 1 }}
                    >
                        {TitlesMap[pathname] ? TitlesMap[pathname] : pathname.includes('/websites') ? 'Website' : 'Dashboard'}
                    </Typography>
                    {sessionFullUser && (<AccountMenu user={sessionFullUser}></AccountMenu>)}
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: [1],
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <List component="nav">
                    <MainListItems filtersViews={filterViews} />
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                    <Grid container spacing={3}>
                        {children}
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}