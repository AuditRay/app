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
import {createWorkspace, inviteWorkspaceUser, updateWorkspaceMemberRoles} from "@/app/actions/workspaceActions";
import {IMemberPopulated, IRole, IUser} from "@/app/models";
import {getWorkspaceAllRoles, getWorkspaceRoles} from "@/app/actions/rolesActions";
import MenuItem from "@mui/material/MenuItem";

export default function UpdateUserWorkspaceRoleModal({open, setOpen, workspaceId, member}: {open: boolean, setOpen: (open: boolean) => void, workspaceId: string, member: IMemberPopulated}) {
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
        firstName: member.user.firstName || '',
        lastName: member.user.lastName || '',
        email: member.user.email || '',
        role: member.roles[0].id || 'default_member'
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
            <DialogTitle> Update workspace user role</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    disabled={true}
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
                    disabled={true}
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
                    disabled={true}
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
                            if(!newUserData.role) {
                                setNewUserErrorData({
                                    ...newUserErrorData,
                                    role: 'Role is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            async function save() {
                                if(newUserData.role) {
                                    await updateWorkspaceMemberRoles(workspaceId, member.user.id, [newUserData.role]);
                                } else {
                                    throw new Error('Invalid data');
                                }
                            }
                            save().then(() => {
                                setIsSaving(false);
                                handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setGeneralError('Error updating user role, please try again');
                            })
                        }}
                    >{isSaving ? 'Updating...' : 'Update'} </Button>
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