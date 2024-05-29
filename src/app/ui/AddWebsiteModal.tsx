'use client'
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

export default function AddWebsiteModal() {
    const [state, action, isPending] = useFormState(createWebsite, undefined)
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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
    return (
        <div>
            <Button onClick={handleOpen} variant={'contained'}>Add New Website</Button>
            <Dialog
                open={open}
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
                <DialogTitle>Add new website</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To Add a new website, please enter the website URL.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        disabled={isSaving}
                        error={!!formCurrentState?.errors?.url}
                        helperText={formCurrentState?.errors?.url}
                        margin="dense"
                        id="name"
                        name="url"
                        label="Website Url"
                        type="url"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button disabled={isSaving} type="submit" variant={'contained'}>{isSaving ? 'Saving...' : 'Add'} </Button>
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
        </div>
    );
}