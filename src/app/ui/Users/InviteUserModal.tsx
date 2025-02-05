import {useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useFormState, useFormStatus} from "react-dom";
import {createWebsite} from "@/app/actions/websiteActions";
import {CreateWebsiteState} from "@/app/lib/definitions";
import {useEffect} from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {Autocomplete, Chip, FormControl, InputLabel, NativeSelect, Select} from "@mui/material";
import {createFiltersViews} from "@/app/actions/filterViewsActions";
import {createWorkspace, inviteWorkspaceUser} from "@/app/actions/workspaceActions";
import {IRole} from "@/app/models";
import {getWorkspaceAllRoles, getWorkspaceRoles} from "@/app/actions/rolesActions";
import MenuItem from "@mui/material/MenuItem";

export default function InviteUserModal({open, setOpen, workspaceId}: {open: boolean, setOpen: (open: boolean) => void, workspaceId: string}) {
    const [isSaving, setIsSaving] = useState(false);
    const [workspaceRoles, setWorkspaceRoles] = useState<IRole[]>([
        {
            overrideId: 'default_admin',
            id: 'default_admin',
            name: 'Admin',
            workspace: '',
            isWorkspace: true,
            permissions: {},
            isDefault: true
        },
        {
            id: 'default_member',
            name: 'Member',
            permissions: {},
            isDefault: true,
            isWorkspace: true,
            overrideId: 'default_member',
            workspace: ''
        }
    ]);
    const [newUserData, setNewUserData] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
    }>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'default_member'
    });
    const [newUserErrorData, setNewUserErrorData] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
    }>({
        firstName: '',
        lastName: '',
        email: '',
        role: ''
    });
    const [generalError, setGeneralError] = useState<string>('');

    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setNewUserErrorData({});
        setNewUserData({});
        setOpen(false);
    }

    // useEffect(() => {
    //     const fetchRoles = async () => {
    //         const roles = await getWorkspaceRoles(workspaceId);
    //         setWorkspaceRoles(roles);
    //     }
    //     fetchRoles().then(() => {}).catch((e) => {});
    // }, [workspaceId]);
    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'sm'}
            onClose={() => {
                !isSaving && handleClose();
            }}
        >
            <DialogTitle> Invite new user to workspace</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter user information to invite user to workspace
                </DialogContentText>
                <TextField
                    autoFocus
                    disabled={isSaving}
                    error={!!newUserErrorData.firstName}
                    helperText={newUserErrorData.firstName}
                    onChange={
                        (e) => setNewUserData({
                            ...newUserData,
                            firstName: e.target.value
                        })
                    }
                    value={newUserData.firstName}
                    margin="dense"
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                />
                <TextField
                    autoFocus
                    disabled={isSaving}
                    error={!!newUserErrorData.lastName}
                    helperText={newUserErrorData.lastName}
                    onChange={
                        (e) => setNewUserData({
                            ...newUserData,
                            lastName: e.target.value
                        })
                    }
                    value={newUserData.lastName}
                    margin="dense"
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                />
                <TextField
                    autoFocus
                    disabled={isSaving}
                    error={!!newUserErrorData.email}
                    helperText={newUserErrorData.email}
                    onChange={
                        (e) => setNewUserData({
                            ...newUserData,
                            email: e.target.value
                        })
                    }
                    value={newUserData.email}
                    margin="dense"
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                />
                <FormControl fullWidth margin={"dense"}>
                    <InputLabel>
                        Role
                    </InputLabel>
                    <Select
                        labelId="role-select-label"
                        id="role-select"
                        value={workspaceRoles.find((role) => role.id == newUserData.role)?.id}
                        label="Role"
                        onChange={(e) => {
                            setNewUserData({
                                ...newUserData,
                                role: e.target.value
                            })
                        }}
                    >
                        <MenuItem value={'default_admin'}>Admin</MenuItem>
                        <MenuItem value={'default_member'}>Member</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        onClick={() => {
                            setIsSaving(true);
                            setNewUserErrorData({});
                            if(!newUserData.firstName) {
                                setNewUserErrorData({
                                    ...newUserErrorData,
                                    firstName: 'First Name is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!newUserData.lastName) {
                                setNewUserErrorData({
                                    ...newUserErrorData,
                                    lastName: 'Last Name is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!newUserData.email) {
                                setNewUserErrorData({
                                    ...newUserErrorData,
                                    email: 'Last Name is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!newUserData.role) {
                                setNewUserErrorData({
                                    ...newUserErrorData,
                                    role: 'Role is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            async function save() {
                                if(newUserData.firstName && newUserData.lastName && newUserData.email && newUserData.role) {
                                    await inviteWorkspaceUser({
                                        firstName: newUserData.firstName,
                                        lastName: newUserData.lastName,
                                        email: newUserData.email,
                                        role: newUserData.role
                                    });
                                } else {
                                    throw new Error('Invalid data');
                                }
                            }
                            save().then(() => {
                                setIsSaving(false);
                                handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setGeneralError('Error inviting user, please try again');
                            })
                        }}
                    >{isSaving ? 'Invite...' : 'Invite'} </Button>
                    {isSaving && (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: green[500],
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}
                        />
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}