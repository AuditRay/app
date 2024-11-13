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
import {createWebsite, getWebsites, getWebsitesListing} from "@/app/actions/websiteActions";
import {CreateWebsiteState} from "@/app/lib/definitions";
import {useEffect} from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {Autocomplete, Checkbox, Chip, Divider, FormControlLabel} from "@mui/material";
import {createFiltersViews} from "@/app/actions/filterViewsActions";
import {createWorkspace, getWorkspaceUsers, inviteWorkspaceUser} from "@/app/actions/workspaceActions";
import {Schema} from "mongoose";
import {createTeam} from "@/app/actions/teamActions";
import {IUser, IWebsite} from "@/app/models";
import Typography from "@mui/material/Typography";
import {Label} from "@mui/icons-material";
import {createRole} from "@/app/actions/rolesActions";

export default function AddRoleModal({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
    const [isSaving, setIsSaving] = useState(false);
    const [newRoleData, setNewRoleData] = useState<{
        name?: string;
        isWorkspace?: boolean;
    }>({
        name: '',
        isWorkspace: false
    });
    const [newRoleErrorData, setNewRoleErrorData] = useState<{
        name?: string;
        isWorkspace?: string;
    }>({
        name: '',
        isWorkspace: ''
    });
    const [generalError, setGeneralError] = useState<string>('');

    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setNewRoleErrorData({});
        setNewRoleData({});
        setOpen(false);
    }

    useEffect(() => {

    }, []);
    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'sm'}
            onClose={() => {
                !isSaving && handleClose();
            }}
        >
            <DialogTitle>Add new role to workspace</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter role information
                </DialogContentText>
                <TextField
                    autoFocus
                    disabled={isSaving}
                    error={!!newRoleErrorData.name}
                    helperText={newRoleErrorData.name}
                    onChange={
                        (e) => setNewRoleData({
                            ...newRoleData,
                            name: e.target.value
                        })
                    }
                    value={newRoleData.name}
                    margin="dense"
                    id="name"
                    name="name"
                    label="Role Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                />
                <FormControlLabel control={
                    <Checkbox
                        checked={newRoleData.isWorkspace}
                        onChange={(e) => {
                            setNewRoleData({
                                ...newRoleData,
                                isWorkspace: e.target.checked
                            });
                        }}
                    />
                } label="Is workspace level role" />
            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        onClick={() => {
                            setIsSaving(true);
                            setNewRoleErrorData({});
                            if(!newRoleData.name) {
                                setNewRoleErrorData({
                                    ...newRoleErrorData,
                                    name: 'Name is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            console.log('newRoleData', newRoleData);
                            async function save() {
                                if(newRoleData.name) {
                                    await createRole({
                                        name: newRoleData.name,
                                        isWorkspace: newRoleData.isWorkspace,
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
                                setGeneralError('Error creating role, please try again');
                            })
                        }}
                    >{isSaving ? 'Creating...' : 'Create'} </Button>
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