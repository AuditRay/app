'use client'
import {useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {createKey, getWebsite, updateWebsite} from "@/app/actions/websiteActions";
import {useEffect} from "react";
import {IWebsite} from "@/app/models";

export default function WebsiteConnectionTokenModal({websiteId, website}: {websiteId: string, website?: IWebsite}) {
    const [open, setOpen] = useState(false);
    const [token, setToken] = useState('');
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }

    useEffect(() => {
        async function checkToken(){
            const loadedWebsite = website || await getWebsite(websiteId);
            if(!loadedWebsite) return '';
            if (!loadedWebsite.token) {
                const token = await createKey(loadedWebsite.id);
                await updateWebsite(loadedWebsite.id, {token});
                setToken(token);
            } else {
                setToken(loadedWebsite.token);
            }
        }
        websiteId && checkToken();
    }, [websiteId, website]);

    return (
        <div>
            <Button onClick={handleOpen} variant={'contained'} fullWidth>Connection Info</Button>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'md'}
                onClose={() => {
                    handleClose();
                }}
            >
                <DialogTitle>Website Connection Info</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        multiline
                        rows={2}
                        maxRows={4}
                        margin="dense"
                        id="name"
                        name="connectionToken"
                        label="Connection Token"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={token}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}