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
import {createFiltersViews, updateFiltersViews} from "@/app/actions/filterViewsActions";
import {GridColumnVisibilityModel, GridFilterModel} from "@mui/x-data-grid-pro";
import {IFiltersView} from "@/app/models/FiltersView";

export default function UpdateFilterViewModal({open, setOpen, filtersView, filtersModel, columnsModel}: {open: boolean, setOpen: (open: boolean) => void, filtersView: IFiltersView, filtersModel: GridFilterModel | undefined, columnsModel: GridColumnVisibilityModel | undefined}) {
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState<string>(filtersView.title);
    const [titleError, setTitleError] = useState<string>('');
    const handleClose = useCallback( () => {
        setTitle('');
        setOpen(false);
    }, [setOpen]);

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
                <DialogTitle>Update Filters View</DialogTitle>
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
                            async function update() {
                                await updateFiltersViews(filtersView.id, {
                                    title: title,
                                    filters: filtersModel,
                                    columns: columnsModel
                                })
                            }
                            update().then(() => {
                                setIsSaving(false);
                                handleClose();
                                setTitle('');
                                //reload the page
                                window.location.reload();
                            }).catch((e) => {
                                setIsSaving(false);
                                setTitleError(e.message);
                            });
                        }}>{isSaving ? 'Saving...' : 'Save'} </Button>
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