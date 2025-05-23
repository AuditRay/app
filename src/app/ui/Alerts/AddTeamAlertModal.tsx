import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {
    Autocomplete,
    Divider,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    LinearProgress,
    Select
} from "@mui/material";
import {IAlert, IUser, IUserInternal, IWorkspace} from "@/app/models";
import {createAlert} from "@/app/actions/alertsActions";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import AlertsWebsitesPreviewGrid from "@/app/ui/Alerts/AlertsWebsitesPreviewGrid";
import {GridFilterModel} from "@mui/x-data-grid-pro";
import {getWorkspaceUsers} from "@/app/actions/workspaceActions";
import {getTeam, getTeams} from "@/app/actions/teamActions";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {getSlackChannels} from "@/app/actions/integrations/slackActions";
import {Channel} from "@slack/web-api/dist/types/response/ConversationsListResponse";
import {useUserStateStore} from "@/providers/user-store-provider";
export type notificationUserOptionsType = { id: string, label: string, type: 'user' | 'team', members: IUserInternal[] };
export default function AddTeamAlertModal({open, setOpen, workspaceId, teamId}: {open: boolean, setOpen: (open: boolean) => void, workspaceId: string, teamId: string}) {
    const [isSaving, setIsSaving] = useState(false);

    const [notificationUserOptions, setNotificationUserOptions] = useState<notificationUserOptionsType[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<IWorkspace>();
    const [slackEvent, setSlackEvent] = useState<IAlert['events'][0]>();
    const [slackChannels, setSlackChannels] = useState<Channel[]>();
    const [filters, setFilters] = React.useState<GridFilterModel>({items: []});
    const [isSlackChannelsLoading, setIsSlackChannelsLoading] = React.useState<Boolean>(false);
    const sessionUser = useUserStateStore((state) => state.sessionFullUser);
    useEffect(() => {
        if(!open) return;
        setSlackEvent(undefined);
        setSlackChannels(undefined);
        setIsSlackChannelsLoading(true);
        async function loadWorkspaceUsers() {
            const currentUser = sessionUser;
            const workspace = sessionUser?.workspaces?.find((w) => w.id == workspaceId);
            setCurrentWorkspace(workspace);
            const team = await getTeam(teamId).catch(() => null);
            if(workspace?.slack?.status) {
                const channels = await getSlackChannels(workspaceId).catch(() => []);
                setSlackChannels(channels);
                setIsSlackChannelsLoading(false);
            } else {
                setIsSlackChannelsLoading(false);
            }
            const options: notificationUserOptionsType[] = [];
            if(team) {
                for (const member of team.members || []) {
                    options.push({
                        id: `user:${member.user.id}`,
                        label: `${member.user.firstName} ${member.user.lastName}<${member.user.email}>`,
                        type: 'user',
                        members: []
                    });
                }
                options.push({
                    id: `team:${team.id}`,
                    label: team.name,
                    type: 'team',
                    members: team.members?.map((m) => m.user) || []
                });
            }
            if (currentUser) {
                options.push({
                    id: `user:${currentUser.id}`,
                    label: `Me <${currentUser.email}>`,
                    type: 'user',
                    members: []
                });
            }
            setNotificationUserOptions(options);
        }
        loadWorkspaceUsers().then(() => {}).catch(() => {});
    }, [sessionUser, workspaceId, open]);

    const [newAlertData, setNewAlertData] = useState<{
        title?: string;
        enabled?: boolean;
        filters?: any[];
        notifyUsers?: string[];
        events?: any;
        interval?: number;
        intervalUnit? : string;
    }>({
        title: '',
        enabled: false,
        filters: [],
        events: [],
        notifyUsers: [],
        interval: 1,
        intervalUnit: 'Day'
    });
    const [newAlertErrorData, setNewAlertErrorData] = useState<{
        title?: string;
        enabled?: string;
        filters?: string;
        events?: string;
        interval?: string;
        notifyUsers?: string;
        intervalUnit?: string;
    }>({
        title: '',
        enabled: '',
        filters: '',
        events: '',
        interval: '',
        intervalUnit: '',
        notifyUsers: ''
    });
    const [generalError, setGeneralError] = useState<string>('');
    const handleClose = () => {
        setNewAlertErrorData({});
        setNewAlertData({});
        setFilters({items: []});
        setSlackChannels(undefined);
        setSlackEvent(undefined);
        setOpen(false);
    }
    
    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'md'}
            PaperProps={{
                sx: {
                    minHeight: "80%"
                }
            }}
            onClose={() => {
                !isSaving && handleClose();
            }}
        >
            <DialogTitle>Add new team alert</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter team alert information
                </DialogContentText>
                <TextField
                    autoFocus
                    disabled={isSaving}
                    error={!!newAlertErrorData.title}
                    helperText={newAlertErrorData.title}
                    onChange={
                        (e) => setNewAlertData({
                            ...newAlertData,
                            title: e.target.value
                        })
                    }
                    value={newAlertData.title}
                    margin="dense"
                    id="title"
                    name="title"
                    label="Alert title"
                    type="text"
                    fullWidth
                    variant="outlined"
                />
                {/*<Grid size={6}>*/}
                {/*    <TextField*/}
                {/*        margin="dense"*/}
                {/*        fullWidth={true}*/}
                {/*        disabled={isSaving}*/}
                {/*        value={newAlertData.interval}*/}
                {/*        onChange={(e) => {*/}
                {/*            setNewAlertData({...newAlertData, interval: parseInt(e.target.value)});*/}
                {/*        }}*/}
                {/*        variant="outlined"*/}
                {/*        label="Alert Interval"*/}
                {/*        id="alert-interval"*/}
                {/*        name="alert-interval"*/}
                {/*        placeholder="Alert Interval"*/}
                {/*        type={'number'}*/}
                {/*    />*/}
                {/*</Grid>*/}
                <Grid size={12}>
                    <FormControl margin="dense" fullWidth>
                        <InputLabel id="interval-unit-select-label">Interval Unit</InputLabel>
                        <Select
                            labelId="interval-unit-select-label"
                            id="alert-interval-unit"
                            name="alert-interval-unit"
                            value={newAlertData.intervalUnit}
                            label="Alert Every"
                            variant="outlined"
                            onChange={(e) => {
                                setNewAlertData({...newAlertData, intervalUnit: e.target.value});
                            }}
                        >
                            {/*<MenuItem value={'Hour'}>Hour</MenuItem>*/}
                            <MenuItem value={'Day'}>Daily</MenuItem>
                            <MenuItem value={'Week'}>Weekly</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Divider sx={{my: 1}}/>
                <Typography variant={'caption'}>Email Team Members</Typography>
                <Box>
                    {newAlertErrorData.notifyUsers && <Typography color={'error'}>{newAlertErrorData.notifyUsers}</Typography>}
                    {newAlertData.notifyUsers?.map((member, index) => (
                        <Grid container key={`member-${index}`} columnSpacing={3} >
                            <Grid size={6}>
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    disableClearable={true}
                                    options={notificationUserOptions.filter((user) => !newAlertData.notifyUsers?.find((m) => m == user.id))}
                                    onChange={(e, value) => {
                                        if(!value) {
                                            const notifyUsers = [...newAlertData.notifyUsers || []];
                                            notifyUsers.splice(index, 1);
                                            setNewAlertData({
                                                ...newAlertData,
                                                notifyUsers: notifyUsers
                                            });
                                            return;
                                        }
                                        if(index == newAlertData.notifyUsers!.length - 1) {
                                            setNewAlertErrorData({
                                                ...newAlertErrorData,
                                                notifyUsers: ''
                                            })
                                        }
                                        const notifyUsers = [...newAlertData.notifyUsers || []];
                                        notifyUsers[index] = value.id;
                                        setNewAlertData({
                                            ...newAlertData,
                                            notifyUsers: notifyUsers
                                        });
                                    }}
                                    renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="User" />}
                                />
                            </Grid>
                            <Grid size={1}>
                                <IconButton sx={{
                                    mt: 2,
                                }} color={'error'} onClick={() => {
                                    //remove member
                                    const notifyUsers = [...newAlertData.notifyUsers || []];
                                    notifyUsers.splice(index, 1);
                                    setNewAlertData({
                                        ...newAlertData,
                                        notifyUsers: notifyUsers
                                    });
                                }}><Tooltip title={"Remove User From Notifications"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip></IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Box sx={{textAlign: 'right'}}>
                        <Button sx={{
                            mt: 2
                        }} variant={'outlined'} onClick={() => {
                            //check if last member has user selected
                            if(newAlertData.notifyUsers && newAlertData.notifyUsers.length > 0) {
                                const lastMember = newAlertData.notifyUsers[newAlertData.notifyUsers.length - 1];
                                setNewAlertErrorData({notifyUsers: ''});
                                if(!lastMember) {
                                    setNewAlertErrorData({
                                        ...newAlertErrorData,
                                        notifyUsers: 'Please select user for last member'
                                    });
                                    return;
                                }
                            }
                            setNewAlertData({
                                ...newAlertData,
                                notifyUsers: [
                                    ...(newAlertData.notifyUsers || []),
                                    ''
                                ]
                            });
                        }}>Add New Member +</Button>
                    </Box>
                </Box>
                <Divider sx={{my: 1}}/>
                {currentWorkspace?.slack?.status && (
                    <>
                        <Typography variant={'caption'}>Send Slack Message</Typography>
                        {slackChannels ? (
                            <Grid container columnSpacing={3} >
                                <Grid size={6}>
                                    <Autocomplete
                                        disablePortal
                                        fullWidth
                                        disableClearable={true}
                                        value={slackEvent?.config ? slackEvent?.config : ''}
                                        onChange={(e, value) => {
                                            setSlackEvent({
                                                type: 'slack',
                                                config: value
                                            })
                                        }}
                                        options={slackChannels.map((channel) => ({
                                            label: channel.name,
                                            id: channel.id
                                        }))}
                                        getOptionKey={(option) => option.id || ''}
                                        getOptionLabel={(option) => option.label || ''}
                                        renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="Channel Name" />}
                                    />
                                </Grid>
                                <Grid size={1}>
                                    <IconButton sx={{
                                        mt: 2,
                                    }} color={'error'} onClick={() => {
                                        setSlackEvent(undefined);
                                    }}><Tooltip title={"Remove Slack Notification"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip></IconButton>
                                </Grid>
                            </Grid>
                        ) : (<LinearProgress></LinearProgress>)}
                    </>
                )}
                <Divider sx={{my: 1}}/>
                <InputLabel id="interval-unit-select-label" sx={{my: 1}}>Alert Criteria</InputLabel>
                <FormHelperText error={!!newAlertErrorData.filters}>{newAlertErrorData.filters}</FormHelperText>
                <AlertsWebsitesPreviewGrid filters={filters} setFilters={setFilters} workspaceId={workspaceId}></AlertsWebsitesPreviewGrid>
            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        onClick={() => {
                            setIsSaving(true);
                            setNewAlertErrorData({});
                            if(!newAlertData.title) {
                                setNewAlertErrorData({
                                    ...newAlertErrorData,
                                    title: 'Name is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!filters?.items?.length) {
                                setNewAlertErrorData({
                                    ...newAlertErrorData,
                                    filters: 'Alert Criteria is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            console.log('newAlertData', newAlertData);
                            const events: IAlert['events'] = [];
                            if(slackEvent) {
                                events.push(slackEvent);
                            }
                            async function save() {
                                if(newAlertData.title) {
                                    await createAlert({
                                        workspace: workspaceId,
                                        title: newAlertData.title,
                                        enabled: newAlertData.enabled,
                                        filters: filters,
                                        interval: newAlertData.interval,
                                        intervalUnit: newAlertData.intervalUnit,
                                        events: events,
                                        notifyUsers: newAlertData.notifyUsers,
                                        team: teamId
                                    });
                                } else {
                                    throw new Error('Invalid data');
                                }
                            }
                            save().then(() => {
                                setIsSaving(false);
                                handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setGeneralError('Error creating team, please try again');
                            })
                        }}
                    >{isSaving ? 'Creating...' : 'Create'} </Button>
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