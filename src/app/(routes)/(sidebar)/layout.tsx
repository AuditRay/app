'use client'
import * as React from "react";
import {Box, Container, Grid, Paper} from "@mui/material";
import {AppBar, Drawer} from "@/app/ui/NavBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import {MainListItems} from "@/app/ui/ListItems";
import {usePathname} from "next/navigation"
import {getFiltersViews} from "@/app/actions/filterViewsActions";
import {IFiltersView} from "@/app/models/FiltersView";

export default function DashboardLayout({children,}: {
    children: React.ReactNode
}) {
    const [filterViews, setFilterViews] = React.useState<IFiltersView[]>([]);
    const pathname = usePathname();
    console.log(pathname);
    const TitlesMap: Record<string, string> = {
        '/websites': 'Websites',
        '/': 'Dashboard',
        '/dashboard': 'Dashboard',
    }
    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };
    React.useEffect(() => {
        getFiltersViews().then((filtersViews) => {
            setFilterViews(filtersViews);
        });
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
                    {/*<IconButton color="inherit">*/}
                    {/*    <Badge badgeContent={4} color="secondary">*/}
                    {/*        <NotificationsIcon />*/}
                    {/*    </Badge>*/}
                    {/*</IconButton>*/}
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