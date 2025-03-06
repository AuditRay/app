'use client'
import {useCallback, useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {useFormStatus} from "react-dom";
import {useEffect} from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {createFiltersViews, createList} from "@/app/actions/filterViewsActions";
import {GridColumnVisibilityModel, GridFilterModel} from "@mui/x-data-grid-pro";

export default function SaveListModal({open, setOpenAction, filters}: {open: boolean, setOpenAction: (open: boolean) => void, filters: {
        text?: string;
        name?: string;
        type?: string[];
        folder?: string[];
        team?: string[];
        tags?: string[];
        status?: string[];
    }}) {
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState<string>('');
    const [titleError, setTitleError] = useState<string>('');
    const handleClose = useCallback( () => {
        setTitle('');
        setOpenAction(false);
    }, [setOpenAction]);


    useEffect(() => {
        console.log('isPending', isSaving);
    }, [isSaving]);
    return (
        <div>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'sm'}
                onClose={() => {
                    !isSaving && handleClose();
                }}
            >
                <DialogTitle>Save Filters List</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        disabled={isSaving}
                        error={!!titleError}
                        helperText={titleError}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="dense"
                        id="filterName"
                        name="filterName"
                        label="Filter Name"
                        fullWidth
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button disabled={isSaving} type="submit" variant={'contained'} onClick={() => {
                            setIsSaving(true);
                            async function create() {
                                await createList({
                                    title: title,
                                    filters: filters,
                                })
                            }
                            create().then(() => {
                                setIsSaving(false);
                                handleClose();
                                setTitle('');
                                //reload the page
                                window.location.reload();
                            }).catch((e) => {
                                setIsSaving(false);
                                setTitleError(e.message);
                            });
                        }}>{isSaving ? 'Saving...' : 'Add'} </Button>
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