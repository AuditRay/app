import {useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {getWebsitesListing} from "@/app/actions/websiteActions";
import {useEffect} from "react";
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {Autocomplete, Divider, FormControl, IconButton, InputLabel, Select} from "@mui/material";
import {getWorkspaceUsers} from "@/app/actions/workspaceActions";
import {createTeam} from "@/app/actions/teamActions";
import {IRole, IUser, IUserInternal, IWebsite} from "@/app/models";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MenuItem from "@mui/material/MenuItem";
import {useUserStateStore} from "@/providers/user-store-provider";
import {createFilterOptions} from "@mui/material/Autocomplete";

const filterOptions = createFilterOptions({
    stringify: (option: IWebsite) => `${option.title} ${option.siteName} ${option.url}`,
});

export default function AddTeamModal({open, setOpen, workspaceId}: {open: boolean, setOpen: (open: boolean) => void, workspaceId: string}) {
    const [isSaving, setIsSaving] = useState(false);
    const [ownerUser, setOwnerUser] = useState<IUser>();
    const [workspaceUsers, setWorkspaceUsers] = useState<IUserInternal[]>([]);
    const [workspaceRoles, setWorkspaceRoles] = useState<IRole[]>([]);
    const [workspaceWebsites, setWorkspaceWebsites] = useState<IWebsite[]>([]);
    const sessionUser = useUserStateStore((state) => state.sessionUser);
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
    const [generalError, setGeneralError] = useState<string>('');
    const handleClose = () => {
        setNewTeamErrorData({
            name: '',
            members: '',
            websites: ''
        });
        setNewTeamData({
            name: '',
            members: [],
            websites: []
        });
        setOpen(false);
    }

    useEffect(() => {
        async function loadWorkspaceUsers() {
            if(!sessionUser) return;
            const users = await getWorkspaceUsers(workspaceId);
            const websites = await getWebsitesListing(workspaceId);
            setOwnerUser(sessionUser);
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
        }
        loadWorkspaceUsers().then(() => {}).catch(() => {});
    }, [workspaceId, sessionUser]);
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
                    Please enter team information to add team to workspace
                </DialogContentText>
                {newTeamErrorData.name}
                <TextField
                    autoFocus
                    disabled={isSaving}
                    error={!!newTeamErrorData.name}
                    helperText={newTeamErrorData.name}
                    onChange={
                        (e) => {
                            setNewTeamErrorData({
                                ...newTeamErrorData,
                                name: '',
                            })
                            setNewTeamData({
                                ...newTeamData,
                                name: e.target.value
                            })
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
                <Divider sx={{my: 3}}/>
                <Typography variant={'caption'}>Team Members</Typography>
                <Box>
                    {newTeamErrorData.members && <Typography color={'error'}>{newTeamErrorData.members}</Typography>}
                    <Grid container key={`member-owner`} columnSpacing={3} >
                        <Grid size={6}>
                            <Autocomplete
                                disablePortal
                                fullWidth
                                disabled={true}
                                disableClearable={true}
                                options={[ownerUser]}
                                defaultValue={ownerUser}
                                value={ownerUser}
                                getOptionLabel={(option) => `${ownerUser?.firstName} ${ownerUser?.lastName} <${ownerUser?.email}>`}
                                renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="User" />}
                            />
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
                    {newTeamData.members?.map((member, index) => (
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
                                        const newMembers = [...(newTeamData.members || [])];
                                        newMembers[index] = {
                                            ...newMembers[index],
                                            user: value.id
                                        }
                                        setNewTeamData({
                                            ...newTeamData,
                                            members: newMembers
                                        });
                                    }}
                                    isOptionEqualToValue={(option, value) => value.id === option.id}
                                    value={workspaceUsers.find((user) => user.id == member.user) || {id: '', firstName: '', lastName: '', email: ''}}
                                    getOptionLabel={(option) => option.id ? `${option.firstName} ${option.lastName} <${option.email}>` : ''}
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
                                }}><Tooltip title={"Remove User From Team"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip></IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Box sx={{textAlign: 'right'}}>
                        <Button sx={{
                            mt: 2
                        }} variant={'outlined'} onClick={() => {
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
                </Box>
                <Divider sx={{my: 3}}/>
                <Typography variant={'caption'}>Team Websites</Typography>
                <Box>
                    {newTeamErrorData.websites && <Typography color={'error'}>{newTeamErrorData.websites}</Typography>}
                    {newTeamData.websites?.map((website, index) => (
                        <Grid container key={`website-${index}`} columnSpacing={3} >
                            <Grid size={11}>
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    disableClearable={true}
                                    options={workspaceWebsites.filter((ws) => !newTeamData.websites?.find((w) => w == ws.id))}
                                    onChange={(e, value) => {
                                        if(!value) return;
                                        if(index == newTeamData.websites!.length - 1) {
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
                                    }}
                                    isOptionEqualToValue={(option, value) => !!workspaceUsers.find((user) => user.id == option.id)}
                                    value={workspaceWebsites.find((ws) => website == ws.id)}
                                    filterOptions={filterOptions}
                                    getOptionLabel={(option) => option.title || option.url}
                                    renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="Website" />}
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
                                }}><Tooltip title={"Remove User From Team"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip></IconButton>
                            </Grid>
                        </Grid>
                    ))}
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
                </Box>

            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        onClick={() => {
                            setIsSaving(true);

                            setNewTeamErrorData({
                                name:'',
                                members: '',
                                websites: '',
                            });
                            setNewTeamErrorData({
                                name:'',
                                members: '',
                                websites: '',
                            });
                            console.log('newTeamData', newTeamErrorData);
                            if(!newTeamData.name) {
                                setNewTeamErrorData({
                                    ...newTeamErrorData,
                                    name: 'Name is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(newTeamData.members) {
                                for(let i = 0; i < newTeamData.members.length; i++) {
                                    const member = newTeamData.members[i];
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
                            async function save() {
                                if(newTeamData.name) {
                                    await createTeam(workspaceId, {
                                        name: newTeamData.name,
                                        members: newTeamData.members,
                                        websites: newTeamData.websites
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