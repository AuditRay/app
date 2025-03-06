
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

export default function WebsiteTokenDialog({
  websiteId,
  website,
  open,
  setOpenAction
}: {websiteId: string, website?: IWebsite, open: boolean, setOpenAction: (open: boolean) => void}) {
    const [token, setToken] = useState('');

    const handleClose = () => {
        setOpenAction(false);
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