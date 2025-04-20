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
import {useEffect, useActionState} from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {Autocomplete, Chip} from "@mui/material";
import {createFiltersViews} from "@/app/actions/filterViewsActions";
import {createWorkspace} from "@/app/actions/workspaceActions";
import {getFullUser} from "@/app/actions/getUser";
import {useUserStateStore} from "@/providers/user-store-provider";

export default function AddWorkspaceModal({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
    const [state, action, isPending] = useActionState(createWebsite, undefined)
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<string>('');
    const [formCurrentState, setFormCurrentState] = useState<CreateWebsiteState>(state);
    const { pending } = useFormStatus();
    const handleOpen = () => {
        setFormCurrentState(undefined);
        setOpen(true);
    }
    const handleClose = () => {
        setFormCurrentState(undefined);
        setOpen(false);
    }

    useEffect(() => {
        setFormCurrentState({...state});
        if(!state?.errors) {
            handleClose();
        }
        setIsSaving(false);
    }, [state]);

    useEffect(() => {
        console.log('isPending', isSaving);
    }, [isSaving]);

    const {
        refreshSessionFullUser,
    } = useUserStateStore((state => state));
    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'sm'}
            onClose={() => {
                !isSaving && handleClose();
            }}
            PaperProps={{
                component: 'form',
                action: (e: FormData) => {
                    setFormCurrentState({});
                    setIsSaving(true);
                    setTimeout(() => action(e));
                }
            }}
        >
            <DialogTitle>Add new workspace</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To Add a new workspace, please enter the workspace name.
                </DialogContentText>
                <TextField
                    autoFocus
                    disabled={isSaving}
                    error={!!nameError}
                    helperText={nameError}
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    margin="dense"
                    id="workspaceName"
                    name="workspaceName"
                    label="Workspace Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                />
            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        onClick={() => {
                            setIsSaving(true);
                            if(!name) {
                                setNameError('Name is required');
                                setIsSaving(false);
                                return;
                            }
                            async function save() {
                                await createWorkspace({
                                    name: name
                                });
                                await refreshSessionFullUser();
                            }
                            save().then(() => {
                                setIsSaving(false);
                                handleClose();
                                setName('');
                            }).catch((e) => {
                                setIsSaving(false);
                                setNameError('Error saving workspace');
                            });
                        }}
                    >{isSaving ? 'Saving...' : 'Create'} </Button>
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