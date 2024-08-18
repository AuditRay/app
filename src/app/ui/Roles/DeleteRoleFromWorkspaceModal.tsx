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
import {IFieldsTemplate, IRole, ITeam, ITeamPopulated, IUser} from "@/app/models";
import * as React from "react";
import Typography from "@mui/material/Typography";
import {deleteFieldsTemplate} from "@/app/actions/fieldTemplateActions";
import {removeUserFromWorkspace} from "@/app/actions/workspaceActions";
import {deleteTeam} from "@/app/actions/teamActions";
import {deleteRole} from "@/app/actions/rolesActions";

export default function DeleteRoleFromWorkspaceModal({open, setOpen, role}: {role: IRole, open: boolean, setOpen: (open: boolean) => void}) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'sm'}
            scroll={'paper'}
        >
            <DialogTitle>{!!role.overrideId ? "Reset Role" : "Remove Role"}</DialogTitle>
            <DialogContent>
                {!!role.overrideId ? `Are you sure you want to reset ${role.name} to default permissions?.` : "Are you sure you want to remove role from this workspace?."}
                {error && <Typography color={'error'}>{error}</Typography>}
            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        color={!!role.overrideId ? 'warning' : 'error'}
                        onClick={() => {
                            setIsSaving(true);
                            async function remove() {
                                await deleteRole(role.id);
                            }
                            remove().then(() => {
                                setIsSaving(false);
                                handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setError('Error deleting role, please try again.');
                            });
                        }}
                    >{isSaving ? !!role.overrideId ? 'Resting' : 'Removing...' : !!role.overrideId ? 'Reset' : 'Remove'} </Button>
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