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
import {IAlert} from "@/app/models";
import {updateAlert} from "@/app/actions/alertsActions";
import Grid from "@mui/material/Unstable_Grid2";
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

export default function EditAlertModal({alert, open, setOpen}: {alert: IAlert, open: boolean, setOpen: (open: boolean) => void}) {
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
    const [notificationUserOptions, setNotificationUserOptions] = useState<notificationUserOptionsType[]>([]);
    const sessionUser = userSessionState((state) => state.user);
    useEffect(() => {
        async function loadWorkspaceUsers() {
            const currentUser = sessionUser;
            const users = await getWorkspaceUsers().catch(() => []);
            const teams = await getTeams().catch(() => []);
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
    }, [sessionUser]);

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
                <Grid xs={6}>
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
                <Grid xs={6}>
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
                            <Grid xs={6}>
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
                            <Grid xs={1}>
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
                <InputLabel id="interval-unit-select-label" sx={{my: 1}}>Alert Criteria</InputLabel>
                <FormHelperText error={!!newAlertErrorData.filters}>{newAlertErrorData.filters}</FormHelperText>
                <AlertsWebsitesPreviewGrid filters={newAlertData.filters} setFilters={(filters) => {
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
                                        events: newAlertData.events
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