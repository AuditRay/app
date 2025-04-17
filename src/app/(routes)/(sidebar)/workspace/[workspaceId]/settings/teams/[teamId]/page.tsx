'use client'

import * as React from "react";
import {IAlert, IRole, ITeam, ITeamPopulated, IUserInternal, IWebsite} from "@/app/models";
import {useCallback, useEffect, useState} from "react";
import {getTeam, updateTeam} from "@/app/actions/teamActions";
import {Autocomplete, Box, FormControl, IconButton, InputLabel, LinearProgress, Select, Tab, Tabs} from "@mui/material";
import { createFilterOptions } from '@mui/material/Autocomplete';
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {getWorkspaceUsers} from "@/app/actions/workspaceActions";
import {getWebsitesListing} from "@/app/actions/websiteActions";
import {getWorkspaceTeamRoles} from "@/app/actions/rolesActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {green} from "@mui/material/colors";
import {DataGrid, GridSlots} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import AddAlertModal from "@/app/ui/Alerts/AddAlertModal";
import EditAlertModal from "@/app/ui/Alerts/EditAlertModal";
import DeleteAlertFromWorkspaceModal from "@/app/ui/Alerts/DeleteAlertFromWorkspaceModal";
import {getTeamAllAlerts, getWorkspaceAllAlerts} from "@/app/actions/alertsActions";
import AddTeamAlertModal from "@/app/ui/Alerts/AddTeamAlertModal";
import EditTeamAlertModal from "@/app/ui/Alerts/EditTeamAlertModal";
import {styled} from "@mui/material/styles";

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 10,
    '& .no-rows-primary': {
        fill: theme.palette.mode === 'light' ? '#AEB8C2' : '#3D4751',
    },
    '& .no-rows-secondary': {
        fill: theme.palette.mode === 'light' ? '#E8EAED' : '#1D2126',
    },
}));

const filterOptions = createFilterOptions({
    stringify: (option: IWebsite) => `${option.title} ${option.siteName} ${option.url}`,
});

function CustomNoRowsOverlay() {
    return (
        <StyledGridOverlay>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                width={96}
                viewBox="0 0 452 257"
                aria-hidden
                focusable="false"
            >
                <path
                    className="no-rows-primary"
                    d="M348 69c-46.392 0-84 37.608-84 84s37.608 84 84 84 84-37.608 84-84-37.608-84-84-84Zm-104 84c0-57.438 46.562-104 104-104s104 46.562 104 104-46.562 104-104 104-104-46.562-104-104Z"
                />
                <path
                    className="no-rows-primary"
                    d="M308.929 113.929c3.905-3.905 10.237-3.905 14.142 0l63.64 63.64c3.905 3.905 3.905 10.236 0 14.142-3.906 3.905-10.237 3.905-14.142 0l-63.64-63.64c-3.905-3.905-3.905-10.237 0-14.142Z"
                />
                <path
                    className="no-rows-primary"
                    d="M308.929 191.711c-3.905-3.906-3.905-10.237 0-14.142l63.64-63.64c3.905-3.905 10.236-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-63.64 63.64c-3.905 3.905-10.237 3.905-14.142 0Z"
                />
                <path
                    className="no-rows-secondary"
                    d="M0 10C0 4.477 4.477 0 10 0h380c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 20 0 15.523 0 10ZM0 59c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 69 0 64.523 0 59ZM0 106c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 153c0-5.523 4.477-10 10-10h195.5c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 200c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 247c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10Z"
                />
            </svg>
            <Box sx={{ mt: 2 }}>No rows</Box>
        </StyledGridOverlay>
    );
}

export default function TeamSettingsPage({params}: { params: Promise<{ workspaceId: string, teamId: string }> }) {
    const {workspaceId, teamId} = React.use(params);
    const [team, setTeam] = React.useState<ITeamPopulated>();
    const [value, setValue] = React.useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [workspaceUsers, setWorkspaceUsers] = useState<IUserInternal[]>([]);
    const [ownerUser, setOwnerUser] = useState<IUserInternal>();
    const [workspaceRoles, setWorkspaceRoles] = useState<IRole[]>([]);
    const [workspaceWebsites, setWorkspaceWebsites] = useState<IWebsite[]>([]);
    const [newTeamData, setNewTeamData] = useState<{
        name?: string;
        members?: {
            user: string,
            role: string;
            websites?: string[];
        }[];
        websites?: string[];
    }>({
        name: '',
        members: [],
        websites: []
    });
    const [newTeamErrorData, setNewTeamErrorData] = useState<{
        name?: string;
        members?: string;
        websites?: string;
    }>({
        name: '',
        members: '',
        websites: ''
    });

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    useEffect(() => {
        async function loadWorkspaceUsers() {
            const team = await getTeam(teamId);
            setTeam(team);
            const users = await getWorkspaceUsers(workspaceId);
            const websites = await getWebsitesListing(workspaceId);
            const roles = await getWorkspaceTeamRoles(workspaceId);
            //remove team members that are not in workspace
            const filteredMembers = team.members?.filter((member) => users.find((user) => user.id == member.user.id));
            setOwnerUser(team.owner);
            setWorkspaceRoles([
                {
                    id: '', name: 'Please Select Role', permissions: {},
                    overrideId: '',
                    workspace: '',
                    isWorkspace: false
                },
                {
                    id: 'team_admin', name: 'Team Admin', permissions: {},
                    overrideId: '',
                    workspace: workspaceId,
                    isWorkspace: false
                },
                {
                    id: 'team_member', name: 'Team Member', permissions: {},
                    overrideId: '',
                    workspace: workspaceId,
                    isWorkspace: false
                },
            ]);
            setWorkspaceUsers(users);
            setWorkspaceWebsites(websites);
            setNewTeamData({
                name: team.name,
                members: filteredMembers?.map((member) => ({
                    user: member.user.id,
                    role: member.role
                })),
                websites: team.websites?.map((website) => website.id)
            })

        }
        loadWorkspaceUsers().then(() => {}).catch(() => {});
    }, [teamId]);

    const [generalError, setGeneralError] = useState<string>('');

    //alerts
    const [teamAlerts, setTeamAlerts] = React.useState<IAlert[]>([]);
    const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [selectedAlert, setSelectedAlert] = React.useState<IAlert>();
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState<boolean>(false);
    const [isEditAlertOpen, setIsEditAlertOpen] = React.useState<boolean>(false);

    const handleOpen = function (isOpen: boolean, setIsOpen: (isOpen: boolean) => void) {
        //reload
        getTeamAllAlerts(workspaceId, teamId).then((alerts) => {
            setTeamAlerts(alerts);
        });
        setSelectedAlert(undefined);
        setIsOpen(isOpen);
    }
    React.useEffect(() => {
        setIsLoading(true);
        getTeamAllAlerts(workspaceId, teamId).then((alerts) => {
            setTeamAlerts(alerts);
            setIsLoading(false);
        });
    }, [workspaceId]);


    const saveData = useCallback((newTeamData: {
        name?: string;
        members?: {
            user: string,
            role: string;
            websites?: string[];
        }[];
        websites?: string[];
    }) => {
        setIsSaving(true);
        setNewTeamErrorData({});
        if(!newTeamData.name) {
            setNewTeamErrorData({
                ...newTeamErrorData,
                name: 'Name is required'
            });
            setIsSaving(false);
            return;
        }
        async function save() {
            if(newTeamData.name) {
                //check all members have user and role
                if(newTeamData.members) {
                    for(let i = 0; i < newTeamData.members.length; i++) {
                        const member = newTeamData.members[i];
                        console.log('member', member);
                        if(member.user == '') {
                            setNewTeamErrorData({
                                ...newTeamErrorData,
                                members: 'Please select user for all members'
                            });
                            setIsSaving(false);
                            return;
                        }
                        if(member.role == '') {
                            setNewTeamErrorData({
                                ...newTeamErrorData,
                                members: 'Please select role for all members'
                            });
                            setIsSaving(false);
                            return;
                        }
                    }
                }
                await updateTeam(team!.id, {
                    name: newTeamData.name,
                    members: newTeamData.members?.filter((m) => !!m.user),
                    websites: newTeamData.websites?.filter((w) => !!w)
                });
                setIsSaving(false);
            } else {
                throw new Error('Invalid data');
            }
        }
        save().then(() => {
        }).catch((e) => {
            setIsSaving(false);
            setGeneralError('Error creating team, please try again');
        })
    }, [newTeamData.members, newTeamData.name, newTeamData.websites]);
    return (
        <>
            <Box sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'center'
            }}>
                <Typography variant={'h2'} >{newTeamData?.name} team.</Typography>
                {team && Object.keys(newTeamData).length > 0 && (
                    <Box sx={{ml: 'auto', display: 'flex'}}>
                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Button
                                disabled={isSaving}
                                variant={'contained'}
                                onClick={() => {
                                    saveData(newTeamData);
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
                    </Box>
                    )
                }
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Members" {...a11yProps(0)} />
                    <Tab label="Projects" {...a11yProps(1)} />
                    <Tab label="Tests" {...a11yProps(2)} />
                    <Tab label="Settings" {...a11yProps(3)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                {newTeamErrorData.members && <Typography color={'error'}>{newTeamErrorData.members}</Typography>}
                <Grid container key={`member-owner`} columnSpacing={3} >
                    <Grid size={6}>
                        {ownerUser && <Autocomplete
                            disablePortal
                            fullWidth
                            disabled={true}
                            disableClearable={true}
                            options={[ownerUser]}
                            defaultValue={ownerUser}
                            value={ownerUser}
                            getOptionLabel={(option) => `${ownerUser?.firstName} ${ownerUser?.lastName} <${ownerUser?.email}>`}
                            renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="User" />}
                        />}
                    </Grid>
                    <Grid size={5}>
                        <Autocomplete
                            disablePortal
                            fullWidth
                            disabled={true}
                            options={["Owner"]}
                            value={"Owner"}
                            defaultValue={"Owner"}
                            renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="Role" />}
                        />
                    </Grid>
                </Grid>
                {workspaceUsers.length ? newTeamData.members?.map((member, index) => {
                    return (
                        <Grid container key={`member-${index}`} columnSpacing={3} >
                            <Grid size={6}>
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    disableClearable={true}
                                    options={workspaceUsers.filter((user) => !newTeamData.members?.find((m) => m.user == user.id)).filter((user) => user.id != ownerUser?.id)}
                                    onChange={(e, value) => {
                                        if(!value) {
                                            const newMembers = [...newTeamData.members || []];
                                            newMembers.splice(index, 1);
                                            setNewTeamData({
                                                ...newTeamData,
                                                members: newMembers
                                            });
                                            return;
                                        }
                                        if(index == newTeamData.members!.length - 1) {
                                            setNewTeamErrorData({
                                                ...newTeamErrorData,
                                                members: ''
                                            })
                                        }
                                        const newMembers = [...newTeamData.members || []];
                                        newMembers[index] = {
                                            ...newMembers[index],
                                            user: value.id
                                        }
                                        setNewTeamData({
                                            ...newTeamData,
                                            members: newMembers
                                        });

                                        saveData({
                                            ...newTeamData,
                                            members: newMembers
                                        });
                                    }}
                                    isOptionEqualToValue={(option, value) => !!workspaceUsers.find((user) => user.id == option.id)}
                                    value={workspaceUsers.find((user) => user.id == member.user)}
                                    getOptionLabel={(option) => `${option.firstName} ${option.lastName} <${option.email}>`}
                                    renderOption={(props, option, { selected }) => (
                                        <li  {...props} key={`user-${option.email}`} >
                                            <Box>
                                                <Typography variant={'h5'}>{`${option.firstName} ${option.lastName}`}</Typography>
                                                <Typography variant={'subtitle2'}>{`${option.email}`}</Typography>
                                            </Box>
                                        </li>
                                    )}
                                    renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="User" />}
                                />
                            </Grid>
                            <Grid size={5}>
                                <FormControl fullWidth margin={"dense"}>
                                    <InputLabel>
                                        Role
                                    </InputLabel>
                                    <Select
                                        value={workspaceRoles.find((role) => role.id == member.role)?.id}
                                        label="Role"
                                        onChange={(e) => {
                                            let value = e.target.value;
                                            if(!value) {
                                                //set default role
                                                value = 'team_admin';
                                            }
                                            const newMembers = [...newTeamData.members || []];
                                            newMembers[index] = {
                                                ...newMembers[index],
                                                role: value
                                            }
                                            setNewTeamData({
                                                ...newTeamData,
                                                members: newMembers
                                            });
                                            saveData({
                                                ...newTeamData,
                                                members: newMembers
                                            });
                                        }}
                                    >
                                        <MenuItem value={'team_admin'}>Team Admin</MenuItem>
                                        <MenuItem value={'team_member'}>Team Member</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={1}>
                                <IconButton sx={{
                                    mt: 2,
                                }} color={'error'} onClick={() => {
                                    //remove member
                                    const newMembers = [...newTeamData.members || []];
                                    newMembers.splice(index, 1);
                                    setNewTeamData({
                                        ...newTeamData,
                                        members: newMembers
                                    });
                                    saveData({
                                        ...newTeamData,
                                        members: newMembers
                                    });
                                }}><Tooltip title={"Remove User From Team"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip></IconButton>
                            </Grid>
                        </Grid>
                    )
                }) : ""}
                <Box sx={{textAlign: 'right'}}>
                    <Button sx={{
                        mt: 2
                    }} variant={'outlined'} onClick={() => {

                        console.log('newTeamData.websites', newTeamData.members);
                        //check if last member has user selected
                        if(newTeamData.members && newTeamData.members.length > 0) {
                            const lastMember = newTeamData.members[newTeamData.members.length - 1];
                            setNewTeamErrorData({members: ''});
                            if(!lastMember.user) {
                                setNewTeamErrorData({
                                    ...newTeamErrorData,
                                    members: 'Please select user for last member'
                                });
                                return;
                            }
                            if(!lastMember.role) {
                                setNewTeamErrorData({
                                    ...newTeamErrorData,
                                    members: 'Please select role for last member'
                                });
                                return;
                            }
                        }
                        setNewTeamData({
                            ...newTeamData,
                            members: [
                                ...(newTeamData.members || []),
                                {
                                    user: '',
                                    role: 'team_member',
                                    websites: []
                                }
                            ]
                        });
                    }}>Add New Member +</Button>
                </Box>
            </TabPanel>
            <TabPanel value={value} index={1}>
                {newTeamErrorData.websites && <Typography color={'error'}>{newTeamErrorData.websites}</Typography>}
                {workspaceWebsites.length ? newTeamData.websites?.map((website, index) => {
                    return (
                        <Grid container key={`website-${index}`} columnSpacing={3}>
                            <Grid size={11}>
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    disableClearable={true}
                                    options={workspaceWebsites.filter((ws) => !newTeamData.websites?.find((w) => w == ws.id))}
                                    onChange={(e, value) => {
                                        if (!value) return;
                                        if (index == newTeamData.websites!.length - 1) {
                                            setNewTeamErrorData({
                                                ...newTeamErrorData,
                                                websites: ''
                                            })
                                        }
                                        const newWebsites = [...newTeamData.websites || []];
                                        newWebsites[index] = value.id;
                                        setNewTeamData({
                                            ...newTeamData,
                                            websites: newWebsites
                                        });
                                        saveData({
                                            ...newTeamData,
                                            websites: newWebsites
                                        });
                                    }}
                                    filterOptions={filterOptions}
                                    isOptionEqualToValue={(option, value) => !!workspaceUsers.find((user) => user.id == option.id)}
                                    value={workspaceWebsites.find((ws) => website == ws.id)}
                                    getOptionLabel={(option) => option.title || option.url}
                                    renderInput={(params) => <TextField margin="dense" {...params} fullWidth
                                                                        label="Website"/>}
                                />
                            </Grid>
                            <Grid size={1}>
                                <IconButton sx={{
                                    mt: 2,
                                }} color={'error'} onClick={() => {
                                    //remove website
                                    const newWebsites = [...newTeamData.websites || []];
                                    newWebsites.splice(index, 1);
                                    setNewTeamData({
                                        ...newTeamData,
                                        websites: newWebsites
                                    });
                                    saveData({
                                        ...newTeamData,
                                        websites: newWebsites
                                    });
                                }}><Tooltip title={"Remove Website From Team"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip></IconButton>
                            </Grid>
                        </Grid>
                    )
                }) : ""}
                <Box sx={{textAlign: 'right'}}>
                    <Button sx={{
                        mt: 2
                    }} variant={'outlined'} onClick={() => {
                        //check if last website is selected
                        if(newTeamData.websites && newTeamData.websites.length > 0) {
                            const lastWebsite = newTeamData.websites[newTeamData.websites.length - 1];
                            if(!lastWebsite) {
                                setNewTeamErrorData({
                                    ...newTeamErrorData,
                                    websites: 'Please select last added website'
                                });
                                return;
                            }
                        }
                        setNewTeamData({
                            ...newTeamData,
                            websites: [
                                ...(newTeamData.websites || []),
                                ''
                            ]
                        });

                    }}>Add New Website +</Button>
                </Box>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <>
                    <Box sx={{
                        mb: 3,
                        alignItems: 'center',
                        display: 'flex'
                    }}>
                        <Box sx={{ml: 'auto'}}>
                            <Button onClick={() => setIsAlertOpen(true)} variant={'contained'}>Create New Test</Button>
                        </Box>
                    </Box>
                    <DataGrid
                        autoHeight
                        slots={{
                            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                            noRowsOverlay: CustomNoRowsOverlay
                        }}
                        loading={isLoading}
                        rows={teamAlerts}
                        getRowId={(row) => row.id}
                        columns={[
                            {
                                field: 'title', headerName: 'Title', flex: 1
                            },
                            {
                                field: 'ops', headerName: "", minWidth: 230,
                                renderCell: (params) => (
                                    <>
                                        <Box>
                                            <IconButton onClick={() => {
                                                const workspaceAlert = teamAlerts.find((alert) => alert.id == params.row.id )
                                                if (workspaceAlert) {
                                                    setSelectedAlert({...workspaceAlert})
                                                    setIsEditAlertOpen(true);
                                                }
                                            }}>
                                                <Tooltip title={"Edit"}><EditIcon></EditIcon></Tooltip>
                                            </IconButton>
                                            <IconButton color={"error"} onClick={() => {
                                                const workspaceAlert = teamAlerts.find((alert) => alert.id == params.row.id )
                                                if (workspaceAlert) {
                                                    setSelectedAlert({...workspaceAlert})
                                                    setIsDeleteAlertOpen(true);
                                                }
                                            }}>
                                                <Tooltip title={"Delete"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip>
                                            </IconButton>
                                        </Box>
                                    </>
                                ),
                            }
                        ]}
                        hideFooter={true}
                        rowSelection={false}
                        onRowClick={(params) => {
                            console.log('props.enableRightDrawer');
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 20 },
                            },
                        }}
                        pageSizeOptions={[5, 20]}
                        autosizeOptions={{
                            includeHeaders: true,
                            includeOutliers: true,
                            outliersFactor: 1,
                            expand: true
                        }}
                    />

                    <AddTeamAlertModal open={isAlertOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsAlertOpen)} workspaceId={workspaceId} teamId={teamId}></AddTeamAlertModal>
                    {selectedAlert && isEditAlertOpen && (
                        <EditTeamAlertModal open={isEditAlertOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsEditAlertOpen)} alert={selectedAlert} workspaceId={workspaceId}  teamId={teamId}></EditTeamAlertModal>
                    )}
                    {selectedAlert && isDeleteAlertOpen && (
                        <DeleteAlertFromWorkspaceModal open={isDeleteAlertOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsDeleteAlertOpen)} alert={selectedAlert} workspaceId={workspaceId}></DeleteAlertFromWorkspaceModal>
                    )}
                </>
            </TabPanel>
            <TabPanel value={value} index={3}>
                <TextField
                    autoFocus
                    error={!!newTeamErrorData.name}
                    helperText={newTeamErrorData.name}
                    onChange={
                        (e) => {
                            setNewTeamData({
                                ...newTeamData,
                                name: e.target.value
                            })
                            saveData({
                                ...newTeamData,
                                name: e.target.value
                            });
                        }
                    }
                    value={newTeamData.name}
                    margin="dense"
                    id="name"
                    name="name"
                    label="Team Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                />
            </TabPanel>
        </>
    );
}