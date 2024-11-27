'use client'
import * as React from "react";
import {
    Box,
    Container,
    Grid,
    IconButton,
    Typography,
    Divider,
    List,
    Toolbar,
    Badge,
    Breadcrumbs,
    Collapse, ListItem
} from "@mui/material";
import {AppBar, Drawer} from "@/app/ui/NavBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {MainListItems} from "@/app/ui/ListItems";
import {usePathname, useRouter} from "next/navigation"
import {getFiltersViews} from "@/app/actions/filterViewsActions";
import {IFiltersView} from "@/app/models/FiltersView";
import { LicenseInfo } from '@mui/x-license';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LanguageIcon from '@mui/icons-material/Language';
import Gleap from 'gleap';
import AccountMenu from "@/app/ui/AccountMenu";
import {IUser} from "@/app/models";
import {getFullUser, getUser} from "@/app/actions/getUser";
import {userSessionState} from "@/app/lib/uiStore";
import Link from "@/app/ui/Link";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ListItemIcon from "@mui/material/ListItemIcon";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import Menu from "@mui/material/Menu";
import {setCurrentSelectedWorkspace} from "@/app/actions/workspaceActions";
import AddWorkspaceModal from "@/app/ui/AddWorkspaceModal";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Settings from '@mui/icons-material/Settings';
import ArrowRight from '@mui/icons-material/ArrowRight';
import WorkspaceDrawerSwitcher from "@/app/ui/Nav/WorkspaceDrawerSwitcher";
import Image from "next/image";
import LogoPH from "../../../../../public/logo.png";
LicenseInfo.setLicenseKey('d180cacff967bbf4eb0152899dacbe68Tz05MzI0OCxFPTE3NTEwNDc4MDIwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

export default function DashboardLayout({children,}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
    const breadcrumbOpen = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const toggleDrawer = () => {
        setOpen(!open);
    };
    const switchUserWorkSpace = (workspaceId?: string) => {
        async function switchWorkspace() {
            await setCurrentSelectedWorkspace(workspaceId);
            window.location.reload();
        }
        switchWorkspace().then();
    }
    React.useEffect(() => {
        if(sessionUser){
            console.log("sessionUser");
            setUser(sessionUser);
            if(!sessionFullUser) {
                console.log("!sessionFullUser");
                getFullUser(sessionUser.id).then((user) => {
                    setSessionFullUser(user);
                }).catch((error) => {
                    console.log(error);
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
                }).catch((error) => {
                    console.log(error);
                });
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [sessionFullUser, sessionUser, setSessionFullUser, setSessionUser]);
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
                    <Breadcrumbs aria-label="breadcrumb" sx={{ color: "white", flexGrow: 1}}>
                        {pathname == '/dashboard' && (
                            <Link underline="hover" color="inherit" href="/dashboard">
                                <DashboardIcon sx={{ mr: 0.5, verticalAlign: 'text-top' }} fontSize="inherit" /> Account Dashboard
                            </Link>
                        )}
                    </Breadcrumbs>
                    {sessionFullUser && (<AccountMenu user={sessionFullUser}></AccountMenu>)}
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: [1],
                    }}
                >
                    <Typography sx={{
                        pl: 2,
                    }}>
                        <Image src={LogoPH} alt={'logo'} width={100}/>
                    </Typography>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <List component="nav">
                    <ListItemButton onClick={() => router.push(`/dashboard`)} selected={pathname == '/dashboard'}>
                        <ListItemIcon>
                            <DashboardIcon sx={{marginLeft: '6px'}}/>
                        </ListItemIcon>
                        <ListItemText primary="Account Dashboard"/>
                    </ListItemButton>
                    {sessionFullUser?.workspaces && (<WorkspaceDrawerSwitcher workspaces={sessionFullUser?.workspaces} />)}
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
                    {children}
                </Container>
            </Box>
        </Box>
    );
}