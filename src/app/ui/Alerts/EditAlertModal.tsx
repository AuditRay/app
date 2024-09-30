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
import {Divider, FormControl, InputLabel, Select} from "@mui/material";
import {IAlert, IUser} from "@/app/models";
import {getAllFacts, updateAlert} from "@/app/actions/alertsActions";
import Grid from "@mui/material/Unstable_Grid2";
import MenuItem from "@mui/material/MenuItem";
import ConditionComponent from "@/app/ui/Alerts/ConditionComponent";
import * as React from "react";
import {TopLevelCondition} from "json-rules-engine";
import {userSessionState} from "@/app/lib/uiStore";

export default function EditAlertModal({alert, open, setOpen}: {alert: IAlert, open: boolean, setOpen: (open: boolean) => void}) {
    const [isSaving, setIsSaving] = useState(false);
    const [ownerUser, setOwnerUser] = useState<IUser>();
    const [conditions, setConditions] = useState<TopLevelCondition>({
        all: []
    });
    const sessionUser = userSessionState((state) => state.user);

    const [factOptions, setFactOptions] = useState<{ id: string, label: string }[]>([]);
    useEffect(() => {
        async function loadWorkspaceFacts() {
            const {facts} = await getAllFacts();
            setFactOptions(facts);
        }
        loadWorkspaceFacts().then();
    }, []);
    const [newAlertData, setNewAlertData] = useState<{
        title?: string;
        enabled?: boolean;
        rules?: any;
        events?: any;
        interval?: number;
        intervalUnit? : string;
    }>(alert);
    console.log("alert", newAlertData);
    const [newAlertErrorData, setNewAlertErrorData] = useState<{
        title?: string;
        enabled?: string;
        rules?: string;
        events?: string;
        interval?: string;
        intervalUnit?: string;
    }>({
        title: '',
        enabled: '',
        rules: '',
        events: '',
        interval: '',
        intervalUnit: ''
    });
    const [generalError, setGeneralError] = useState<string>('');
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
            <DialogTitle>Add new team to workspace</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter alert information to add alert to workspace
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
                <Divider sx={{my: 3}}/>
                <ConditionComponent condition={newAlertData.rules[0]} setCondition={(c) => {
                    setConditions(c);
                    setNewAlertData({
                        ...newAlertData,
                        rules: c
                    });
                }} firstLevel={true} factOptions={factOptions}/>
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
                                        rules: newAlertData.rules,
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