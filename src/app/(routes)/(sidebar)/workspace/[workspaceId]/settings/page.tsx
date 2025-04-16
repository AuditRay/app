'use client'
import * as React from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import {Autocomplete, Box, Divider} from "@mui/material";
import {getWorkspace, updateWorkspace} from "@/app/actions/workspaceActions";
import {IWorkspace} from "@/app/models";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {green} from "@mui/material/colors";

export default function Settings({params}: { params: Promise<{ workspaceId: string }> }) {
    const timezones = Intl.supportedValuesOf("timeZone");
    const { workspaceId } = React.use(params);
    const [isSaving, setIsSaving] = React.useState(false);
    const [newWorkspaceData, setNewWorkspaceData] = React.useState<IWorkspace>();
    const [isPersonal, setIsPersonal] = React.useState(false);
    const [newWorkspaceError, setNewWorkspaceError] = React.useState<{
        name?: string,
        timezone?: string,
    }>({
        name: '',
        timezone: '',
    });

    React.useEffect(() => {
        if(workspaceId == 'personal') {
            setIsPersonal(true);
            return;
        }
        const getCurrentWorkspace = async () => {
            const workspace = await getWorkspace(workspaceId);
            setNewWorkspaceData({...workspace});
        }
        getCurrentWorkspace().then();
    }, [workspaceId]);

    return (
        <>
            <Typography variant={'h2'}>General</Typography>
            <Divider sx={{my:2}}/>
            {!newWorkspaceData && isPersonal && (
                <Typography variant={'h3'}>Personal Workspace (No settings are available, please switch workspace)</Typography>
            )}
            {newWorkspaceData && (
                <>
                    <TextField
                        autoFocus
                        margin="dense"
                        error={!!newWorkspaceError.name}
                        helperText={newWorkspaceError.name}
                        id={"workspaceName"}
                        name={"workspaceName"}
                        label={"Workspace Name"}
                        type={'text'}
                        value={newWorkspaceData.name}
                        onChange={(e) => {
                            setNewWorkspaceData({...newWorkspaceData, name: e.target.value});
                        }}
                        fullWidth
                        variant="outlined"
                    />
                    <Autocomplete
                        disablePortal
                        fullWidth
                        disableClearable={true}
                        options={timezones}
                        onChange={(e, value) => {
                            setNewWorkspaceData({...newWorkspaceData, timezone: value});
                        }}
                        value={newWorkspaceData.timezone}
                        renderInput={(params) => <TextField
                            error={!!newWorkspaceError.timezone}
                            helperText={newWorkspaceError.timezone}
                            margin="dense"
                            {...params}
                            fullWidth
                            label="Workspace Timezone"
                        />}
                    />
                    <Divider sx={{mt:2}}/>
                    <Box sx={{ mt: 2, position: 'relative', textAlign: "end"}}>
                        <Button
                            disabled={isSaving}
                            variant={'contained'}
                            onClick={() => {
                                setIsSaving(true);
                                if(!newWorkspaceData?.name) {
                                    setNewWorkspaceError({
                                        ...newWorkspaceError,
                                        name: 'Name is required'
                                    });
                                    setIsSaving(false);
                                    return;
                                }

                                if(!newWorkspaceData?.timezone) {
                                    setNewWorkspaceError({
                                        ...newWorkspaceError,
                                        timezone: 'Timezone is required'
                                    });
                                    setIsSaving(false);
                                    return;
                                }
                                async function save() {
                                    if(!newWorkspaceData) return;
                                    await updateWorkspace(newWorkspaceData.id, newWorkspaceData);
                                }
                                save().then(() => {
                                    setIsSaving(false);
                                }).catch((e) => {
                                    setIsSaving(false);
                                    //setNameError('Error saving the template. Please try again.');
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
                </>
            )}
        </>
    );
}
