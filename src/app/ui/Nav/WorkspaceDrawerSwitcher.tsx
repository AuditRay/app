import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {Collapse, Divider, IconButton, List, ListItem} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Settings from "@mui/icons-material/Settings";
import ArrowRight from "@mui/icons-material/ArrowRight";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import * as React from "react";
import {IWorkspace} from "@/app/models";
import {useRouter} from "next/navigation";
import AddWorkspaceModal from "@/app/ui/AddWorkspaceModal";

export default function WorkspaceDrawerSwitcher({workspaces, currentWorkspaceId, defaultOpenWorkSpaces = true} : {
    workspaces: IWorkspace[],
    currentWorkspaceId?: string,
    defaultOpenWorkSpaces?: boolean
}) {
    const router = useRouter();
    const [openWorkSpaces, setOpenWorkSpaces] = React.useState<boolean>(defaultOpenWorkSpaces);
    const [isAddWorkspaceModalOpen, setIsAddWorkspaceModalOpen] = React.useState(false);
    const [currentWorkspace, setCurrentWorkspace] = React.useState<IWorkspace | null>(null);
    React.useEffect(() => {
        const currentWorkspace = workspaces.find(workspace => workspace.id == currentWorkspaceId);
        if(currentWorkspace) {
            setCurrentWorkspace(currentWorkspace);
        }
    }, [workspaces, currentWorkspaceId]);
    return workspaces.length ? (
        <>
            <ListItem component="div" disablePadding sx={{
                '&:hover .workspace-settings': {
                    display: 'flex',
                },
            }}>
                <ListItemButton
                    onClick={(e) => {
                        console.log((e as any))
                        if((e.target as any).classList.contains('workspace-settings')) return
                        setOpenWorkSpaces(!openWorkSpaces);
                    }}
                >
                    <ListItemIcon>
                        <WorkspacesIcon sx={{marginLeft: '6px'}}/>
                    </ListItemIcon>
                    <ListItemText primary={!openWorkSpaces && !defaultOpenWorkSpaces && currentWorkspace ? currentWorkspace.name : "Workspaces"} />
                    {openWorkSpaces ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
            </ListItem>
            <Collapse in={openWorkSpaces} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItem key={"personal-workspace"} component="div" disablePadding sx={{
                        '&:hover .workspace-settings': {
                            display: 'flex',
                        },
                    }}>
                        <ListItemButton sx={{ pl: 5 }} onClick={() => router.push(`/workspace/personal/websites`)} selected={currentWorkspaceId == 'personal'}>
                            <ListItemText primary={"Personal"}/>
                        </ListItemButton>
                        <Tooltip title="Workspace Settings" onClick={() => router.push(`/workspace/personal/settings`)}>
                            <IconButton
                                size="large"
                                className={"workspace-settings"}
                                sx={{
                                    'display': 'none',
                                    '& svg': {
                                        color: 'rgba(0,0,0,0.8)',
                                        transition: '0.2s',
                                        transform: 'translateX(0) rotate(0)',
                                    },
                                    '&:hover, &:focus': {
                                        bgcolor: 'unset',
                                        '& svg:first-of-type': {
                                            transform: 'translateX(-4px) rotate(-20deg)',
                                        },
                                        '& svg:last-of-type': {
                                            right: 0,
                                            opacity: 1,
                                        },
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        height: '80%',
                                        display: 'block',
                                        left: 0,
                                        width: '1px',
                                        bgcolor: 'divider',
                                    },
                                }}
                            >
                                <Settings />
                                <ArrowRight sx={{ position: 'absolute', right: 4, opacity: 0 }} />
                            </IconButton>
                        </Tooltip>
                    </ListItem>
                    {workspaces?.map((workspace) => {
                        return (
                            <ListItem key={workspace.id} component="div" disablePadding sx={{
                                '&:hover .workspace-settings': {
                                    display: 'flex',
                                },
                            }}>
                                <ListItemButton sx={{ pl: 5 }} onClick={() => router.push(`/workspace/${workspace.id}/websites`)} selected={currentWorkspaceId == workspace.id}>
                                    <ListItemText primary={workspace.name}/>
                                </ListItemButton>
                                <Tooltip title="Workspace Settings" onClick={() => router.push(`/workspace/${workspace.id}/settings`)}>
                                    <IconButton
                                        size="large"
                                        className={"workspace-settings"}
                                        sx={{
                                            'display': 'none',
                                            '& svg': {
                                                color: 'rgba(0,0,0,0.8)',
                                                transition: '0.2s',
                                                transform: 'translateX(0) rotate(0)',
                                            },
                                            '&:hover, &:focus': {
                                                bgcolor: 'unset',
                                                '& svg:first-of-type': {
                                                    transform: 'translateX(-4px) rotate(-20deg)',
                                                },
                                                '& svg:last-of-type': {
                                                    right: 0,
                                                    opacity: 1,
                                                },
                                            },
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                height: '80%',
                                                display: 'block',
                                                left: 0,
                                                width: '1px',
                                                bgcolor: 'divider',
                                            },
                                        }}
                                    >
                                        <Settings />
                                        <ArrowRight sx={{ position: 'absolute', right: 4, opacity: 0 }} />
                                    </IconButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                    <List component="div" sx={{px: 2}} disablePadding>
                        <Divider/>
                    </List>
                    <ListItem component="div" disablePadding sx={{
                        '& svg': {
                            color: 'rgba(0,0,0,0.8)',
                            transition: '0.2s',
                            transform: 'translateX(0) rotate(0)',
                        },
                        '&:hover, &:focus': {
                            bgcolor: 'rgba(0,0,0,0.04)',
                            '& svg:first-of-type': {
                                transform: 'translateX(-4px) rotate(-20deg)',
                            },
                            '& svg:last-of-type': {
                                right: 0,
                                opacity: 1,
                            },
                        }
                    }}>
                        <ListItemButton  sx={{
                            pl: 5,
                            '&:hover, &:focus': {
                                bgcolor: 'unset',
                            }
                        }} onClick={() => setIsAddWorkspaceModalOpen(true)}>
                            <ListItemText primary="Add New Workspace"/>
                        </ListItemButton>
                        <Tooltip title="Workspace Settings">
                            <IconButton
                                onClick={() => setIsAddWorkspaceModalOpen(true)}
                                size="large"
                                sx={{
                                    '&:hover, &:focus': {
                                        bgcolor: 'unset',
                                        '& svg:last-of-type': {
                                            right: 0,
                                            opacity: 1,
                                        },
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        height: '80%',
                                        display: 'block',
                                        left: 0,
                                        width: '1px',
                                        bgcolor: 'divider',
                                    },
                                }}
                            >
                                <DomainAddIcon />
                                <ArrowRight sx={{ position: 'absolute', right: 4, opacity: 0 }} />
                            </IconButton>
                        </Tooltip>
                    </ListItem>
                </List>
            </Collapse>
            <AddWorkspaceModal open={isAddWorkspaceModalOpen} setOpen={setIsAddWorkspaceModalOpen}/>
        </>
    ) : ('Loading...')
}