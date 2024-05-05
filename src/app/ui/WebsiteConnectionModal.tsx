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
import {IWebsite} from "@/app/models/Website";

export default function WebsiteConnectionTokenModal({websiteId}: {websiteId: string}) {
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

            console.log('hello', websiteId);
            const website = await getWebsite(websiteId);
            if(!website) return '';
            if (!website.token) {
                const token = await createKey(website.id);
                await updateWebsite(website.id, {token});
                setToken(token);
            } else {
                setToken(website.token);
            }
        }
        websiteId && checkToken();
    }, [websiteId]);

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
                        variant="standard"
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