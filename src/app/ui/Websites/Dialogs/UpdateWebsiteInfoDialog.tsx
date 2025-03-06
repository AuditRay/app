'use client'
import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {IFieldsTemplate, IMemberPopulated, IUser, IWebsite} from "@/app/models";
import * as React from "react";
import Typography from "@mui/material/Typography";
import {deleteFieldsTemplate} from "@/app/actions/fieldTemplateActions";
import {removeUserFromWorkspace} from "@/app/actions/workspaceActions";
import {fetchUpdates} from "@/app/actions/websiteActions";

export default function UpdateWebsiteInfoDialog({websiteId, open, setOpenAction}: {websiteId: string, open: boolean, setOpenAction: (open: boolean) => void}) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setOpenAction(false);
    }

    return (
        <div>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'sm'}
                scroll={'paper'}
            >
                <DialogTitle>
                    Update Website Info
                </DialogTitle>
                <DialogContent>
                    <Typography variant={'body1'}>Are you sure you want to update the website info?</Typography>
                    <Typography variant={'body2'} color={"error"}>This action could potentially place a performance load
                        on your website.</Typography>
                    <Typography variant={'body2'} sx={{mt: 2, fontWeight: "bold"}}>This will reload after the update finishes.</Typography>
                    {error && <Typography color={'error'}>{error}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                    <Box sx={{m: 1, position: 'relative'}}>
                        <Button
                            disabled={isSaving}
                            variant={'contained'}
                            color={'error'}
                            onClick={() => {
                                setIsSaving(true);

                                async function updateWebsiteInfo() {
                                    await fetchUpdates(websiteId, true);
                                    window.location.reload();
                                }

                                updateWebsiteInfo().then(() => {
                                    setIsSaving(false);
                                    handleClose();
                                }).catch((e) => {
                                    setIsSaving(false);
                                    setError('Error updating website info, please try again.');
                                });
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
        </div>
    );
}