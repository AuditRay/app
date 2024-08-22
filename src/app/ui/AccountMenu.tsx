import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import {IUser, IWorkspace} from "@/app/models";
import { useRouter } from 'next/navigation';
import AddWorkspaceModal from "@/app/ui/AddWorkspaceModal";
import {setCurrentSelectedWorkspace} from "@/app/actions/workspaceActions";

export default function AccountMenu({user}: {user: IUser | null}) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [isAddWorkspaceModalOpen, setIsAddWorkspaceModalOpen] = React.useState(false);
    const [userWorkspaces, setUserWorkspaces] = React.useState<IWorkspace[]>(user?.workspaces || []);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const switchUserWorkSpace = (workspaceId?: string) => {
        async function switchWorkspace() {
            await setCurrentSelectedWorkspace(workspaceId);
            window.location.reload();
        }
        switchWorkspace().then();
    }

    const router = useRouter();
    //get initials from First Name and Last Name
    const initials = user ? user?.firstName?.charAt(0) + user?.lastName?.charAt(0) : '';
    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Account settings">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar sx={{ width: 32, height: 32 }}>{initials}</Avatar>
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                elevation={0}
                sx= {{
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                    },
                    '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleClose}>
                    <Avatar /> {user?.firstName} {user?.lastName}
                </MenuItem>
                <Divider />
                <MenuItem disabled={true}>
                   Workspaces
                </MenuItem>
                <MenuItem key={'personal-workspace'} onClick={() => switchUserWorkSpace()} selected={!user?.workspaces?.length || !user?.currentSelectedWorkspace}>
                    <ListItemIcon>
                        <WorkspacesIcon />
                    </ListItemIcon>
                    <Typography variant="inherit">Personal Workspace</Typography>
                </MenuItem>

                {user?.workspaces?.map((workspace) => (
                    <MenuItem key={workspace.id} onClick={() => switchUserWorkSpace(workspace.id)} selected={user?.currentSelectedWorkspace === workspace.id}>
                        <ListItemIcon>
                            <WorkspacesIcon />
                        </ListItemIcon>
                        <Typography variant="inherit">{workspace.name}</Typography>
                    </MenuItem>
                ))}

                <MenuItem onClick={() => setIsAddWorkspaceModalOpen(true)}>
                    <ListItemIcon>
                        <DomainAddIcon />
                    </ListItemIcon>
                    Add New Workspace
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => router.push('/settings')}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Workspace Settings
                </MenuItem>

                <Divider />
                <MenuItem onClick={() => router.push('/logout')}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
            <AddWorkspaceModal open={isAddWorkspaceModalOpen} setOpen={setIsAddWorkspaceModalOpen}/>
        </React.Fragment>
    );
}
