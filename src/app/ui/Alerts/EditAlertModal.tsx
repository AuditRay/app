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
import {green} from '@mui/material/colors';
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
import {IAlert, IWorkspace} from "@/app/models";
import {updateAlert} from "@/app/actions/alertsActions";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import {userSessionState} from "@/app/lib/uiStore";
import AlertsWebsitesPreviewGrid from "@/app/ui/Alerts/AlertsWebsitesPreviewGrid";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {notificationUserOptionsType} from "@/app/ui/Alerts/AddAlertModal";
import {getWorkspaceUsers} from "@/app/actions/workspaceActions";
import {getTeams} from "@/app/actions/teamActions";
import {Channel} from "@slack/web-api/dist/types/response/ConversationsListResponse";
import {getSlackChannels} from "@/app/actions/integrations/slackActions";
import JiraTicketConfig from "@/app/ui/Alerts/JiraTicketConfig";

export default function EditAlertModal({alert, open, setOpen, workspaceId}: {alert: IAlert, open: boolean, setOpen: (open: boolean) => void, workspaceId: string}) {
    const [isSaving, setIsSaving] = useState(false);
    const [newAlertData, setNewAlertData] = useState<{
        title?: string;
        enabled?: boolean;
        filters?: any;
        events?: any;
        interval?: number;
        notifyUsers?: string[];
        intervalUnit? : string;
    }>({...alert});
    console.log("newAlertData",newAlertData);
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
        notifyUsers: '',
        intervalUnit: ''
    });
    const [generalError, setGeneralError] = useState<string>('');
    const [currentWorkspace, setCurrentWorkspace] = useState<IWorkspace>();
    const [jiraEvent, setJiraEvent] = useState<IAlert['events'][0]>();
    const [openJiraTicket, setOpenJiraTicket] = useState<boolean>(false);
    const [slackEvent, setSlackEvent] = useState<IAlert['events'][0]>();
    const [slackChannels, setSlackChannels] = useState<Channel[]>();
    const [isSlackChannelsLoading, setIsSlackChannelsLoading] = React.useState<Boolean>(false);
    const [notificationUserOptions, setNotificationUserOptions] = useState<notificationUserOptionsType[]>([]);
    const sessionUser = userSessionState((state) => state.fullUser);
    useEffect(() => {
        if(!open) return;
        setSlackEvent(undefined);
        setJiraEvent(undefined);
        setSlackChannels(undefined);
        setIsSlackChannelsLoading(true);
        async function loadWorkspaceUsers() {
            const currentUser = sessionUser;
            const workspace = sessionUser?.workspaces?.find((w) => w.id == workspaceId);
            setCurrentWorkspace(workspace);
            const users = await getWorkspaceUsers(workspaceId).catch(() => []);
            const teams = await getTeams(workspaceId).catch(() => []);
            if(workspace?.slack?.status) {
                const slackEvent = alert.events.find((event) => event.type == 'slack');
                if(slackEvent) {
                    setSlackEvent(slackEvent);
                }
                const channels = await getSlackChannels(workspaceId).catch(() => []);
                setSlackChannels(channels);
                setIsSlackChannelsLoading(false);
            } else {
                setSlackEvent(undefined);
                setIsSlackChannelsLoading(false);
            }

            if(workspace?.jira?.status) {
                const jiraEvent = alert.events.find((event) => event.type == 'jira');
                if(jiraEvent) {
                    setJiraEvent(jiraEvent);
                }
            } else {
                setJiraEvent(undefined);
            }
            const options: notificationUserOptionsType[] = [];
            for(const user of users) {
                options.push({
                    id: `user:${user.id}`,
                    label: `${user.firstName} ${user.lastName}<${user.email}>`,
                    type: 'user',
                    members: []
                });
            }
            for(const team of teams) {
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
    }, [workspaceId, sessionUser]);

    const handleClose = () => {
        setNewAlertErrorData({});
        setNewAlertData({});
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
            <DialogTitle>Edit Alert</DialogTitle>
            <DialogContent>
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
                <Grid size={6}>
                    <TextField
                        margin="dense"
                        fullWidth={true}
                        disabled={isSaving}
                        value={newAlertData.interval}
                        onChange={(e) => {
                            setNewAlertData({...newAlertData, interval: parseInt(e.target.value)});
                        }}
                        variant="outlined"
                        label="Alert Interval"
                        id="alert-interval"
                        name="alert-interval"
                        placeholder="Alert Interval"
                        type={'number'}
                    />
                </Grid>
                <Grid size={6}>
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
                            <MenuItem value={'Hour'}>Hour</MenuItem>
                            <MenuItem value={'Day'}>Day</MenuItem>
                            <MenuItem value={'Week'}>Week</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Divider sx={{my: 1}}/>
                <Typography variant={'caption'}>Team Members</Typography>
                <Box>
                    {newAlertErrorData.notifyUsers && <Typography color={'error'}>{newAlertErrorData.notifyUsers}</Typography>}
                    {notificationUserOptions.length ? newAlertData.notifyUsers?.map((member, index) => (
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
                                        const notifyUsers = [...(newAlertData.notifyUsers || [])];
                                        notifyUsers[index] = value.id;
                                        setNewAlertData({
                                            ...newAlertData,
                                            notifyUsers: notifyUsers
                                        });
                                    }}
                                    value={notificationUserOptions.find((option) => option.id == member)}
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
                    )) : <LinearProgress></LinearProgress>}
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
                {currentWorkspace?.jira?.status && (
                    <>
                        <Typography variant={'caption'}>Open Jira Ticket</Typography>
                        <Box>
                            {!jiraEvent ? (
                                <Grid container columnSpacing={3} >
                                    <Grid size={12}>
                                        <Button variant={'outlined'} onClick={() => setOpenJiraTicket(true)}>
                                            Configure Jira
                                        </Button>
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant={'subtitle2'}>
                                            No Jira ticket configuration found. Please configure Jira ticket to enable this feature.
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Grid container columnSpacing={3} >
                                    <Grid size={12}>
                                        <Button variant={'outlined'} onClick={() => setOpenJiraTicket(true)}>
                                            Re-configure Jira
                                        </Button>
                                        <IconButton color={'error'} onClick={() => {
                                            setJiraEvent(undefined);
                                        }}><Tooltip title={"Remove Jira Notification"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip></IconButton>
                                    </Grid>
                                    <Grid size={12}>
                                        <Typography variant={'subtitle2'}>
                                            Jira ticket configuration found. You can re-configure Jira ticket to change settings.
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                        <JiraTicketConfig open={openJiraTicket} setOpen={setOpenJiraTicket} config={jiraEvent?.config || {}} setConfig={(config) => {
                            console.log("config", config);
                            setJiraEvent({
                                type: 'jira',
                                config: config
                            });
                        }} ></JiraTicketConfig>
                    </>
                )}
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
                <AlertsWebsitesPreviewGrid filters={newAlertData.filters} workspaceId={workspaceId} setFilters={(filters) => {
                    setNewAlertData({...newAlertData, filters});
                }}></AlertsWebsitesPreviewGrid>
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
                            const events: IAlert['events'] = [];
                            if(slackEvent) {
                                events.push(slackEvent);
                            }
                            if(jiraEvent) {
                                events.push(jiraEvent);
                            }
                            async function save() {
                                if(newAlertData.title) {
                                    //check all members have user and role
                                    await updateAlert(alert.id, {
                                        title: newAlertData.title,
                                        enabled: newAlertData.enabled,
                                        filters: newAlertData.filters,
                                        notifyUsers: newAlertData.notifyUsers,
                                        interval: newAlertData.interval,
                                        intervalUnit: newAlertData.intervalUnit,
                                        events: events
                                    });
                                    setIsSaving(false);
                                    handleClose();
                                } else {
                                    throw new Error('Invalid data');
                                }
                            }
                            save().then(() => {
                            }).catch((e) => {
                                setIsSaving(false);
                                setGeneralError('Error creating team, please try again');
                            })
                        }}
                    >{isSaving ? 'Updating...' : 'Update'} </Button>
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