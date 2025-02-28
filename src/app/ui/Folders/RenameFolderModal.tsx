import {useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {getWebsitesListing} from "@/app/actions/websiteActions";
import {useEffect} from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {Autocomplete, Divider, FormControl, IconButton, InputLabel, Select} from "@mui/material";
import {getWorkspaceUsers} from "@/app/actions/workspaceActions";
import {createTeam} from "@/app/actions/teamActions";
import {IFolder, IRole, IUser, IUserInternal, IWebsite} from "@/app/models";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import {getWorkspaceTeamRoles} from "@/app/actions/rolesActions";
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {userSessionState} from "@/app/lib/uiStore";
import MenuItem from "@mui/material/MenuItem";
import {updateFolder} from "@/app/actions/folderActions";

export default function RenameFolderModal({open, setOpen, workspaceId, folder}: {open: boolean, setOpen: (open: boolean) => void, workspaceId: string, folder: IFolder}) {
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState<string>(folder.name);
    const [generalError, setGeneralError] = useState<string>('');
    const handleClose = () => {
        setGeneralError('');
        setOpen(false);
    }

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'md'}
            onClose={() => {
                !isSaving && handleClose();
            }}
        >
            <DialogTitle>Rename folder</DialogTitle>
            <DialogContent>
                <Divider sx={{my: 3}}/>
                <Box>
                    <TextField
                        autoFocus
                        disabled={isSaving}
                        error={!!generalError}
                        helperText={generalError}
                        onChange={
                            (e) => setName(e.target.value)
                        }
                        value={name}
                        margin="dense"
                        id="name"
                        name="name"
                        label="Folder Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                    />
                </Box>

            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        onClick={() => {
                            setIsSaving(true);
                            async function save() {
                                await updateFolder(workspaceId, folder.id, {
                                    name: name
                                })
                            }
                            save().then(() => {
                                setIsSaving(false);
                                handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setGeneralError('Error saving folder, please try again');
                            })
                        }}
                    >{isSaving ? 'Saving...' : 'Save'} </Button>
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