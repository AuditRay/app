import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LanguageIcon from '@mui/icons-material/Language';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {useRouter} from "next/navigation";
import {IFiltersView} from "@/app/models/FiltersView";
import NotificationsIcon from '@mui/icons-material/Notifications';
import {IWorkspace} from "@/app/models";
import WorkspaceDrawerSwitcher from "@/app/ui/Nav/WorkspaceDrawerSwitcher";
import {Box, Collapse, Divider, IconButton, List, ListItem} from "@mui/material";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ViewCozyIcon from '@mui/icons-material/ViewCozy';
import Settings from "@mui/icons-material/Settings";

export const MainListItems = ({
  filtersViews,
  workspaces,
  workspaceId,
  pathname
} : {
    filtersViews: IFiltersView[],
    workspaces?: IWorkspace[],
    workspaceId: string,
    pathname?: string
}) => {
    const router = useRouter()
    const [openWebsites, setOpenWebsites] = React.useState(false);
    return (
        <>
            <ListItemButton onClick={() => router.push(`/dashboard`)}>
                <ListItemIcon>
                    <DashboardIcon sx={{marginLeft: '6px'}}/>
                </ListItemIcon>
                <ListItemText primary="Account Dashboard"/>
            </ListItemButton>
            {workspaces && (
                <>
                    <WorkspaceDrawerSwitcher
                        workspaces={workspaces}
                        currentWorkspaceId={workspaceId}
                        defaultOpenWorkSpaces={false}
                    />
                    <Divider />
                </>
            )}
            <ListItemButton
                onClick={() => router.push(`/workspace/${workspaceId}/websites`)} selected={pathname == `/workspace/${workspaceId}/websites`}
            >
                <ListItemIcon>
                    <LanguageIcon sx={{marginLeft: '6px'}}/>
                </ListItemIcon>
                <ListItemText primary={"Websites"} />
            </ListItemButton>
            {filtersViews && (
                <>
                    <ListItem component="div" disablePadding sx={{
                        '&:hover .workspace-settings': {
                            display: 'flex',
                        },
                    }}>
                        <ListItemButton
                            onClick={(e) => {
                                setOpenWebsites(!openWebsites);
                            }}
                           >
                            <ListItemIcon>
                                <ViewCozyIcon  sx={{marginLeft: '6px'}} />
                            </ListItemIcon>
                            <ListItemText primary={"Views"} />
                            {openWebsites ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                    </ListItem>
                    <Collapse in={openWebsites} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {filtersViews && filtersViews.map((filterView) => (
                                <ListItemButton sx={{ pl: 5 }} key={filterView.id} onClick={() => router.push(`/workspace/${workspaceId}/websites?filterView=${filterView.id}`)}>
                                    <ListItemText primary={filterView.title}/>
                                </ListItemButton>
                            ))}
                            <List component="div" sx={{px: 2}} disablePadding>
                                <Divider/>
                            </List>
                        </List>
                    </Collapse>
                </>
            )}
            <ListItemButton onClick={() => router.push(`/workspace/${workspaceId}/alerts`)} selected={pathname == `/workspace/${workspaceId}/alerts`}>
                <ListItemIcon>
                    <NotificationsIcon sx={{marginLeft: '6px'}}/>
                </ListItemIcon>
                <ListItemText primary="Alerts"/>
            </ListItemButton>
            <ListItemButton onClick={() => router.push(`/workspace/${workspaceId}/settings`)} selected={pathname == `/workspace/${workspaceId}/settings`}>
                <ListItemIcon>
                    <Settings sx={{marginLeft: '6px'}}/>
                </ListItemIcon>
                <ListItemText primary="Settings"/>
            </ListItemButton>
        </>
    );
}