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
import {createKey, createWebsite, getWebsite, updateWebsite} from "@/app/actions/websiteActions";
import {CreateWebsiteState} from "@/app/lib/definitions";
import {useEffect} from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {Autocomplete, Checkbox, Chip, FormControl, FormControlLabel, InputLabel, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import {getFieldsTemplates, updateFieldsTemplate} from "@/app/actions/fieldTemplateActions";
import {IFieldsTemplate, IWebsite} from "@/app/models";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import {getWorkspace} from "@/app/actions/workspaceActions";
import Link from "@/app/ui/Link";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, {Dayjs} from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EditWebsiteModal({websiteId, website}: {websiteId: string, website?: IWebsite}) {
    const [isSaving, setIsSaving] = useState(false);
    const [open, setOpen] = useState(false);
    const [fieldsTemplate, setFieldsTemplate] = useState<string | undefined>();
    const [fieldsTemplateError, setFieldsTemplateError] = useState<string | null>(null);
    const [tags, setTags] = useState<string[] | undefined>([]);
    const [enableSync, setEnableSync] = useState<boolean>(true);
    const [syncInterval, setSyncInterval] = useState<number>(1);
    const [syncTime, setSyncTime] = useState<Dayjs | null>(
        dayjs().startOf('day')
    );
    const [syncIntervalUnit, setIntervalUnit] = useState<'' | 'Hour' | 'Day' | 'Week'>('Day');
    const [timeZone, setTimeZone] = useState('');
    const [tagsError, setTagsError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [fieldTemplates, setFieldTemplates] = useState<IFieldsTemplate[]>([]);
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }

    useEffect(() => {
        console.log('syncTime', syncTime, dayjs().startOf('day'));
    }, [syncTime]);
    useEffect(() => {
        async function getData(){
            const loadedWebsite = website || await getWebsite(websiteId);
            console.log('website', loadedWebsite);
            const fieldTemplates = await getFieldsTemplates();
            setFieldTemplates(fieldTemplates);
            if(!loadedWebsite) return '';
            setTags(loadedWebsite.tags);
            setEnableSync(loadedWebsite.syncConfig?.enabled);
            setSyncInterval(loadedWebsite.syncConfig?.syncInterval || 1);
            setIntervalUnit(loadedWebsite.syncConfig?.intervalUnit || 'Day');
            //default sync time to 12:00 AM
            setSyncTime(loadedWebsite.syncConfig?.syncTime ? dayjs.utc(loadedWebsite.syncConfig?.syncTime) : dayjs().startOf('day'));
            if (loadedWebsite.workspace) {
                const workspace = await getWorkspace(loadedWebsite.workspace.toString());
                if (workspace && workspace.timezone) {
                    setTimeZone(workspace.timezone);
                    setSyncTime(loadedWebsite.syncConfig?.syncTime ? dayjs(loadedWebsite.syncConfig?.syncTime).tz(workspace.timezone) : dayjs().tz(workspace.timezone).startOf('day'));
                }
            }
            setFieldsTemplate(loadedWebsite.fieldsTemplate as string);
        }
        open && websiteId && getData();
        setIsSaving(false);
    }, [websiteId, website, open]);

    useEffect(() => {
        console.log('isPending', isSaving);
    }, [isSaving]);
    return (
        <div>
            <Button onClick={handleOpen} variant={'contained'} fullWidth sx={{mb: 2}}>Edit Website ...</Button>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'sm'}
            >
                <DialogTitle>Edit Website</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        multiple
                        id="tags"
                        options={[]}
                        autoSelect={true}
                        defaultValue={tags}
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
                                margin="dense"
                                {...params}
                                disabled={isSaving}
                                error={!!tagsError}
                                helperText={tagsError}
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
                                control={<Checkbox checked={enableSync} onChange={(e) => {setEnableSync(e.target.checked)}} />}
                            />
                        </Grid>
                        {enableSync && (
                            <>
                                <Grid xs={6}>
                                    <TextField
                                        margin="dense"
                                        fullWidth={true}
                                        disabled={isSaving}
                                        error={!!tagsError}
                                        helperText={tagsError}
                                        value={syncInterval}
                                        onChange={(e) => {
                                            setSyncInterval(parseInt(e.target.value));
                                        }}
                                        variant="outlined"
                                        label="Sync Interval"
                                        placeholder="Sync Interval"
                                        type={'number'}
                                    />
                                </Grid>
                                <Grid xs={6}>
                                    <FormControl margin="dense" fullWidth>
                                        <InputLabel id="interval-unit-select-label">Interval Unit</InputLabel>
                                        <Select
                                            labelId="interval-unit-select-label"
                                            id="interval-unit"
                                            value={syncIntervalUnit}
                                            label="Interval Unit"
                                            variant="outlined"
                                            onChange={(e) => {
                                                setIntervalUnit(e.target.value as '');
                                            }}
                                        >
                                            <MenuItem value={'Hour'}>Hour</MenuItem>
                                            <MenuItem value={'Day'}>Day</MenuItem>
                                            <MenuItem value={'Week'}>Week</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid xs={12}>
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            value={syncTime}
                                            sx={{width: '100%'}}
                                            onChange={setSyncTime}
                                            timezone={timeZone || undefined}
                                            label={`Sync Time in Timezone: ${timeZone || 'UTC'}`}
                                        />
                                    </LocalizationProvider>
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
                    {/*<Box sx={{ minWidth: 120 }}>*/}
                    {/*    <FormControl margin="dense" fullWidth>*/}
                    {/*        <InputLabel id="field-type-label">Fields Template</InputLabel>*/}
                    {/*        <Select*/}
                    {/*            id={`fields-template`}*/}
                    {/*            name={`fields-template`}*/}
                    {/*            label="Fields Template"*/}
                    {/*            value={fieldsTemplate}*/}
                    {/*            onChange={(e) => {*/}
                    {/*                setFieldsTemplate(e.target.value as string);*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            {fieldTemplates.length && (<MenuItem key={'none'} value={''}>None</MenuItem>)}*/}
                    {/*            {fieldTemplates.length && fieldTemplates.map((fieldTemplate) => (*/}
                    {/*                <MenuItem key={fieldTemplate.id} value={fieldTemplate.id}>{fieldTemplate.title}</MenuItem>*/}
                    {/*            ))}*/}
                    {/*            {!fieldTemplates.length && (*/}
                    {/*                <MenuItem disabled={true} key={'no-templates'}>No Field Templates are found, please create new template from workspace settings.</MenuItem>*/}
                    {/*            )}*/}
                    {/*        </Select>*/}
                    {/*    </FormControl>*/}
                    {/*</Box>*/}
                </DialogContent>
                <DialogActions>
                    <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button
                            disabled={isSaving}
                            type="submit"
                            variant={'contained'}
                            onClick={() => {
                                setIsSaving(true);
                                async function save() {
                                    await updateWebsite(websiteId, {
                                        tags,
                                        syncConfig: {
                                            enabled: enableSync,
                                            syncInterval,
                                            syncTime: syncTime || undefined,
                                            intervalUnit: syncIntervalUnit,
                                        },
                                        fieldsTemplate: fieldsTemplate || undefined
                                    });
                                }
                                save().then(() => {
                                    setIsSaving(false);
                                    handleClose();
                                    setTagsError('');
                                    setFieldsTemplateError('');
                                }).catch((e) => {
                                    setIsSaving(false);
                                    setGeneralError('Error updating the website. Please try again.');
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
        </div>
    );
}