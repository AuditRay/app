import {useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {IFieldsTemplate} from "@/app/models";
import * as React from "react";
import Typography from "@mui/material/Typography";
import {deleteFieldsTemplate} from "@/app/actions/fieldTemplateActions";
import {disconnectJiraToken, updateJiraConfig} from "@/app/actions/workspaceActions";
import TextField from "@mui/material/TextField";
import {useParams} from "next/navigation";
import {useUserStateStore} from "@/providers/user-store-provider";

export default function ConfigJiraIntegrationModal({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
    const [isSaving, setIsSaving] = useState(false);
    const [hiddenFields, setHiddenFields] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const { workspaceId } = useParams<{ workspaceId: string; }>()
    const sessionUser = useUserStateStore((state) => state.sessionFullUser);
    const handleClose = () => {
        setOpen(false);
        setHiddenFields('');
    }

    React.useEffect(() => {
        if(!open) return;

        const currentWorkspace = sessionUser?.workspaces?.find(workspace => workspace.id === workspaceId);
        if (currentWorkspace) {
            setHiddenFields(currentWorkspace.jira?.config?.hiddenFields || '');
        }
    }, [open, workspaceId, sessionUser]);

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'sm'}
            scroll={'paper'}
        >
            <DialogTitle>Config Jira Integration</DialogTitle>
            <DialogContent>
                <Box>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="hide-fields"
                        name="hide-fields"
                        label="Hide Fields"
                        type="multiline"
                        value={hiddenFields}
                        multiline={true}
                        rows={10}
                        fullWidth
                        variant="outlined"
                        onChange={(e) => setHiddenFields(e.target.value)}
                    />
                    <Typography variant={'caption'}>Add the field IDs to be hidden, each ID on a new line. <b>This will not effect Required fields</b></Typography>
                </Box>
                {error && <Typography color={'error'}>{error}</Typography>}
            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        color={'primary'}
                        onClick={() => {
                            setIsSaving(true);
                            async function saveConfig() {
                                await updateJiraConfig(workspaceId, {hiddenFields});
                            }
                            saveConfig().then(() => {
                                setIsSaving(false);
                                handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setError('Error saving integration config, please try again.');
                            });
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