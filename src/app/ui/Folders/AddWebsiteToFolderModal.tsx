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
import {IFolder, IRole, IUser, IUserInternal, IWebsite} from "@/app/models";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import {getWorkspaceTeamRoles} from "@/app/actions/rolesActions";
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MenuItem from "@mui/material/MenuItem";
import {updateFolder} from "@/app/actions/folderActions";
import {useUserStateStore} from "@/providers/user-store-provider";

export default function AddWebsiteToFolderModal({open, setOpen, workspaceId, folder}: {open: boolean, setOpen: (open: boolean) => void, workspaceId: string, folder: IFolder}) {
    const [isSaving, setIsSaving] = useState(false);
    const [workspaceWebsites, setWorkspaceWebsites] = useState<IWebsite[]>([]);
    const sessionUser = useUserStateStore((state) => state.sessionUser);
    const folderWebsiteIds = folder.websites?.map((w) => w.toString());
    const [addWebsitesData, setAddWebsitesData] = useState<string[]>(folderWebsiteIds || []);
    const [generalError, setGeneralError] = useState<string>('');
    const handleClose = () => {
        setGeneralError('');
        setOpen(false);
    }

    useEffect(() => {
        async function loadWorkspaceUsers() {
            const websites = await getWebsitesListing(workspaceId);
            setWorkspaceWebsites(websites);
        }
        loadWorkspaceUsers().then(() => {}).catch(() => {});
    }, [workspaceId, sessionUser]);
    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'md'}
            onClose={() => {
                !isSaving && handleClose();
            }}
        >
            <DialogTitle>Manage folder websites</DialogTitle>
            <DialogContent>
                <Box>
                    {generalError && <Typography color={'error'}>{generalError}</Typography>}
                    {addWebsitesData?.map((website, index) => (
                        <Grid container key={`website-${index}`} columnSpacing={3} >
                            <Grid size={11}>
                                <Autocomplete
                                    fullWidth
                                    disableClearable={true}
                                    options={workspaceWebsites.filter((ws) => !addWebsitesData?.find((w) => w == ws.id))}
                                    onChange={(e, value) => {
                                        if(!value) return;
                                        if(index == addWebsitesData!.length - 1) {

                                        }
                                        const newWebsites = [...addWebsitesData || []];
                                        newWebsites[index] = value.id;
                                        setAddWebsitesData(newWebsites);
                                    }}
                                    isOptionEqualToValue={(option, value) => !!workspaceWebsites.find((website) => website.id == option.id)}
                                    value={workspaceWebsites.find((ws) => website == ws.id)}
                                    getOptionLabel={(option) => option.title || option.url}
                                    renderInput={(params) => <TextField margin="dense" {...params} fullWidth label="Website" />}
                                />
                            </Grid>
                            <Grid size={1}>
                                <IconButton sx={{
                                    mt: 2,
                                }} color={'error'} onClick={() => {
                                    //remove website
                                    const newWebsites = [...addWebsitesData || []];
                                    newWebsites.splice(index, 1);
                                    setAddWebsitesData(newWebsites);
                                }}><Tooltip title={"Remove Website"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip></IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Box sx={{textAlign: 'right'}}>
                        <Button sx={{
                            mt: 2
                        }} variant={'outlined'} onClick={() => {
                            //check if last website is selected
                            if(addWebsitesData && addWebsitesData.length > 0) {
                                const lastWebsite = addWebsitesData[addWebsitesData.length - 1];
                                if(!lastWebsite) {
                                    setGeneralError('Please select last added website');
                                    return;
                                }
                            }
                            setAddWebsitesData([
                                ...addWebsitesData,
                                ''
                            ]);

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
                            async function save() {
                                await updateFolder(workspaceId, folder.id, {
                                    websites: addWebsitesData
                                })
                            }
                            save().then(() => {
                                setIsSaving(false);
                                handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setGeneralError('Error saving folder, please try again');
                            })
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
    );
}