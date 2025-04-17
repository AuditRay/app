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
import {
    Autocomplete,
    Checkbox,
    Chip,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    Select,
    Switch
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import {getFieldsTemplates, updateFieldsTemplate} from "@/app/actions/fieldTemplateActions";
import {IFieldsTemplate, IWebsite} from "@/app/models";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import {getWorkspace, getWorkspaceMembers} from "@/app/actions/workspaceActions";
import Link from "@/app/ui/Link";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, {Dayjs} from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import DeleteWebsiteModal from "@/app/ui/Websites/DeleteWebsiteModal";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EditWebsiteModal({websiteId, website, workspaceId}: {websiteId: string, website?: IWebsite, workspaceId: string}) {
    const [isSaving, setIsSaving] = useState(false);
    const [open, setOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [fieldsTemplate, setFieldsTemplate] = useState<string | undefined>();
    const [fieldsTemplateError, setFieldsTemplateError] = useState<string | null>(null);
    const [tags, setTags] = useState<string[] | undefined>([]);
    const [siteName, setSiteName] = useState<string | undefined>('');
    const [enableSync, setEnableSync] = useState<boolean>(true);
    const [enableUptime, setEnableUptime] = useState<boolean>(false);
    const [syncInterval, setSyncInterval] = useState<number>(1);
    const [syncTime, setSyncTime] = useState<Dayjs | null>(
        dayjs().startOf('day')
    );
    const [syncIntervalUnit, setIntervalUnit] = useState<'' | 'Hour' | 'Day' | 'Week'>('Day');
    const [timeViews, setTimeViews] = useState<('hours' | 'minutes' | 'seconds')[]>(['hours', 'minutes']);
    const [timeZone, setTimeZone] = useState('');
    const [tagsError, setTagsError] = useState<string | null>(null);
    const [dataSourcesToPull, setDataSourcesToPull] = useState<string[]>([]);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [fieldTemplates, setFieldTemplates] = useState<IFieldsTemplate[]>([]);
    const handleOpen = () => {
        setOpen(true);
    }
    const handleDeleteOpen = function (isOpen: boolean, setIsOpen: (isOpen: boolean) => void) {
        setIsOpen(isOpen);
    }
    const handleClose = () => {
        setOpen(false);
        setTags([]);
        setTagsError('');
        setTimeZone('');
        setTimeViews(['hours', 'minutes']);
        setIntervalUnit('Day');
    }

    useEffect(() => {
        console.log('syncTime', syncTime, dayjs().startOf('day'));
    }, [syncTime]);
    useEffect(() => {
        async function getData(){
            const loadedWebsite = website || await getWebsite(websiteId);
            console.log('website', loadedWebsite);
            const fieldTemplates = await getFieldsTemplates(workspaceId);
            setFieldTemplates(fieldTemplates);
            if(!loadedWebsite) return '';
            setTags(loadedWebsite.tags);
            setSiteName(loadedWebsite.siteName);
            setEnableSync(loadedWebsite.syncConfig?.enabled);
            setEnableUptime(loadedWebsite.enableUptimeMonitor || false);
            setSyncInterval(loadedWebsite.syncConfig?.syncInterval || 1);
            setIntervalUnit(loadedWebsite.syncConfig?.intervalUnit || 'Day');
            if(loadedWebsite.syncConfig?.intervalUnit === 'Hour') {
                setTimeViews(['minutes', 'seconds']);
            }
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

        open && (websiteId || website) && getData();
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
                    <TextField
                        autoFocus
                        disabled={isSaving}
                        margin="dense"
                        id="name"
                        name="name"
                        label="Website Name"
                        type="name"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />
                    <Autocomplete
                        multiple
                        id="tags"
                        options={[]}
                        autoSelect={true}
                        defaultValue={tags}
                        value={tags}
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
                        <Typography variant={'subtitle2'} sx={{mt:2}}>Sync Sources</Typography>
                    </Box>
                    <Grid container>
                        <Grid size={12}>
                            <FormControlLabel
                                label="Site Audit"
                                control={<Checkbox
                                    id={"site-audit"}
                                    name={"site-audit"}
                                    checked={dataSourcesToPull.includes('monit_site_audit')} onChange={
                                    (e) => {
                                        if(!dataSourcesToPull.includes('monit_site_audit') &&  e.target.checked) {
                                            setDataSourcesToPull([...dataSourcesToPull, 'monit_site_audit']);
                                        } else if (!e.target.checked) {
                                            setDataSourcesToPull(dataSourcesToPull.filter((item) => item !== 'monit_site_audit'));
                                        }
                                    }
                                }/>}
                            />
                        </Grid>
                        <Grid size={12}>
                            <FormControlLabel
                                label="Security Review"
                                control={<Checkbox
                                    id={"security-review"}
                                    name={"security-review"}
                                    checked={dataSourcesToPull.includes('monit_security_review')} onChange={
                                    (e) => {
                                        if(!dataSourcesToPull.includes('monit_security_review') &&  e.target.checked) {
                                            setDataSourcesToPull([...dataSourcesToPull, 'monit_security_review']);
                                        } else if (!e.target.checked) {
                                            setDataSourcesToPull(dataSourcesToPull.filter((item) => item !== 'monit_security_review'));
                                        }
                                    }
                                }/>}
                            />
                        </Grid>
                    </Grid>
                    <Box>
                        <Typography variant={'subtitle2'} sx={{mt:2}}>Sync configuration</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <FormControlLabel
                                label="Enable auto update"
                                control={<Checkbox checked={enableSync} onChange={(e) => {setEnableSync(e.target.checked)}} />}
                            />
                        </Grid>
                        {enableSync && (
                            <>
                                <Grid size={12}>
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
                                                if (e.target.value === 'Hour') {
                                                    setTimeViews(['minutes', 'seconds']);
                                                } else {
                                                    setTimeViews(['hours', 'minutes']);
                                                }
                                            }}
                                        >
                                            {/*<MenuItem value={'Hour'}>Hour</MenuItem>*/}
                                            <MenuItem value={'Day'}>Daily</MenuItem>
                                            <MenuItem value={'Week'}>Weekly</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={12}>
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            value={syncTime}
                                            sx={{width: '100%'}}
                                            onChange={setSyncTime}
                                            views={timeViews}
                                            timezone={timeZone || undefined}
                                            label={`Sync Time in Timezone: ${timeZone || 'UTC'}`}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid size={12}>
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
                    <Box sx={{ m: 1, position: 'relative', mr: 'auto' }}>
                        <Button
                            disabled={isSaving}
                            type="submit"
                            variant={'contained'}
                            color={'error'}
                            onClick={() => {
                                setIsDeleteOpen(true);
                            }}
                        > Delete Website </Button>
                    </Box>
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
                                        siteName,
                                        tags,
                                        enableUptimeMonitor: false,
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
            {isDeleteOpen && (
                <DeleteWebsiteModal open={isDeleteOpen} setOpen={(isOpen) => handleDeleteOpen(isOpen, setIsDeleteOpen)} websiteId={websiteId}></DeleteWebsiteModal>
            )}
        </div>
    );
}