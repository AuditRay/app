'use client'
import {useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useFormState, useFormStatus} from "react-dom";
import {createWebsite} from "@/app/actions/websiteActions";
import {CreateWebsiteState} from "@/app/lib/definitions";
import {useEffect} from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {Autocomplete, Checkbox, Chip, FormControl, FormControlLabel, InputLabel, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import {getFieldsTemplates} from "@/app/actions/fieldTemplateActions";
import {IFieldsTemplate} from "@/app/models";
import PermissionsAccessCheck from "@/app/ui/PermissionsAccessCheck";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import Link from "@/app/ui/Link";
import {userSessionState} from "@/app/lib/uiStore";
import {getWorkspace} from "@/app/actions/workspaceActions";

export default function AddWebsiteModal() {
    const [state, action, isPending] = useFormState(createWebsite, undefined)
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [syncConfig, setSyncConfig] = useState<{
        enabled: boolean,
        syncInterval: number,
        intervalUnit: string,
    }>({
        enabled: true,
        syncInterval: 1,
        intervalUnit: 'Day',
    });
    const [formCurrentState, setFormCurrentState] = useState<CreateWebsiteState>(state);
    const [timeZone, setTimeZone] = useState('');
    const [fieldTemplates, setFieldTemplates] = useState<IFieldsTemplate[]>([]);
    const { pending } = useFormStatus();
    const handleOpen = () => {
        setFormCurrentState(undefined);
        setOpen(true);
    }
    const handleClose = () => {
        setFormCurrentState(undefined);
        setOpen(false);
    }
    const sessionUser = userSessionState((state) => state.user);
    useEffect(() => {
        getFieldsTemplates().then((fieldTemplates) => {
            setFieldTemplates(fieldTemplates);
        })
        if(sessionUser?.currentSelectedWorkspace) {
            getWorkspace(sessionUser.currentSelectedWorkspace.toString()).then((workspace) => {
                setTimeZone(workspace.timezone);
            });
        }
        setFormCurrentState({...state});
        if(!state?.errors) {
            handleClose();
        }
        setIsSaving(false);
    }, [state, sessionUser]);

    useEffect(() => {
        console.log('isPending', isSaving);
    }, [isSaving]);
    return (
        <div>
            <Button onClick={handleOpen} variant={'contained'}>Add New Website</Button>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'sm'}
                onClose={() => {
                    !isSaving && handleClose();
                }}
                PaperProps={{
                    component: 'form',
                    action: (e: FormData) => {
                        setFormCurrentState({});
                        setIsSaving(true);
                        e.append('tags', JSON.stringify(tags));
                        e.append('syncConfig', JSON.stringify(syncConfig));
                        setTimeout(() => action(e));
                    }
                }}
            >
                <DialogTitle>Add new website</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To Add a new website, please enter the website URL.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        disabled={isSaving}
                        error={!!formCurrentState?.errors?.url}
                        helperText={formCurrentState?.errors?.url}
                        margin="dense"
                        id="name"
                        name="url"
                        label="Website Url"
                        type="url"
                        fullWidth
                        variant="outlined"
                    />
                    <Autocomplete
                        multiple
                        id="tags"
                        options={[]}
                        autoSelect={true}
                        freeSolo
                        onChange={(event, newValue) => {
                            setTags(newValue);
                        }}
                        renderTags={(value: readonly string[], getTagProps) =>
                            value.map((option: string, index: number) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                    <Chip variant="outlined" label={option} key={key} {...tagProps} />
                                );
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin={'dense'}
                                disabled={isSaving}
                                error={!!formCurrentState?.errors?.tags}
                                helperText={formCurrentState?.errors?.tags}
                                variant="outlined"
                                label="Tags"
                                placeholder="Tags"
                            />
                        )}
                    />
                    <Box>
                        <Typography variant={'subtitle2'} sx={{mt:2}}>Sync configuration</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid xs={12}>
                            <FormControlLabel
                                label="Enable auto update"
                                control={<Checkbox
                                    id={"sync-enabled"}
                                    name={"sync-enabled"}
                                    checked={syncConfig.enabled} onChange={
                                    (e) => {
                                        setSyncConfig({...syncConfig, enabled: e.target.checked});
                                    }
                                }/>}
                            />
                        </Grid>
                        {syncConfig.enabled && (
                            <>
                                <Grid xs={6}>
                                    <TextField
                                        margin="dense"
                                        fullWidth={true}
                                        disabled={isSaving}
                                        value={syncConfig.syncInterval}
                                        onChange={(e) => {
                                            setSyncConfig({...syncConfig, syncInterval: parseInt(e.target.value)});
                                        }}
                                        variant="outlined"
                                        label="Sync Interval"
                                        id="sync-interval"
                                        name="sync-interval"
                                        placeholder="Sync Interval"
                                        type={'number'}
                                    />
                                </Grid>
                                <Grid xs={6}>
                                    <FormControl margin="dense" fullWidth>
                                        <InputLabel id="interval-unit-select-label">Interval Unit</InputLabel>
                                        <Select
                                            labelId="interval-unit-select-label"
                                            id="sync-interval-unit"
                                            name="sync-interval-unit"
                                            value={syncConfig.intervalUnit}
                                            label="Interval Unit"
                                            variant="outlined"
                                            onChange={(e) => {
                                                setSyncConfig({...syncConfig, intervalUnit: e.target.value});
                                            }}
                                        >
                                            <MenuItem value={'Hour'}>Hour</MenuItem>
                                            <MenuItem value={'Day'}>Day</MenuItem>
                                            <MenuItem value={'Week'}>Week</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid xs={12}>
                                    {timeZone ? (
                                        <Typography variant={'caption'}>Timezone: {timeZone} (Timezone can be changed from <Link href={"/settings"}>workspace setting</Link>)</Typography>
                                    ) : (
                                        <Typography variant={'caption'}>Timezone is not available in personal workspaces we use UTC instead</Typography>
                                    )}
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button disabled={isSaving} type="submit" variant={'contained'}>{isSaving ? 'Saving...' : 'Add'} </Button>
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