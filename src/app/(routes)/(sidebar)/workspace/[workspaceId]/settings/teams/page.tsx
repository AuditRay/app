'use client'
import * as React from "react";
import {Box, IconButton, LinearProgress} from "@mui/material";
import Typography from "@mui/material/Typography";
import {ITeamPopulated, IUser} from "@/app/models";
import {DataGrid, GridSlots} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import {styled} from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {getTeams} from "@/app/actions/teamActions";
import AddTeamModal from "@/app/ui/Teams/AddTeamModal";
import DeleteTeamFromWorkspaceModal from "@/app/ui/Teams/DeleteTeamFromWorkspaceModal";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import EditTeamModal from "@/app/ui/Teams/EditTeamModal";
import {deepOrange} from "@mui/material/colors";
import {userSessionState} from "@/app/lib/uiStore";
import {GridRenderCellParams} from "@mui/x-data-grid-pro";
import Link from "@/app/ui/Link";
import LaunchIcon from "@mui/icons-material/Launch";
import {GridRow} from "@/app/ui/WebsitesGrid";
import {useRouter} from "next/navigation";

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
            <Box sx={{ mt: 2 }}>No teams found</Box>
        </StyledGridOverlay>
    );
}

export default function TeamsSettings({params}: { params: Promise<{ workspaceId: string }> }) {
    const [user, setUser] = React.useState<IUser | null>(null);
    const { workspaceId } = React.use(params);
    const [workspaceTeams, setWorkspaceTeams] = React.useState<ITeamPopulated[]>([]);
    const [isPersonal, setIsPersonal] = React.useState(workspaceId == 'personal');
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [selectedWorkspaceTeam, setSelectedWorkspaceTeam] = React.useState<ITeamPopulated>();
    const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState<boolean>(false);
    const sessionUser = userSessionState((state) => state.user);

    const router = useRouter();
    const getInitials = (firstName: string, lastName: string) => {
        return firstName?.charAt(0) + lastName?.charAt(0);
    }
    const handleOpen = function (isOpen: boolean, setIsOpen: (isOpen: boolean) => void) {
        //reload
        getTeams(workspaceId).then((teams) => {
            setWorkspaceTeams(teams);
        })
        setSelectedWorkspaceTeam(undefined);
        setIsOpen(isOpen);
    }
    React.useEffect(() => {
        if(workspaceId == 'personal') {
            setIsPersonal(true);
            return;
        }
        setIsLoading(true);
        setUser(sessionUser);
        getTeams(workspaceId).then((teams) => {
            setWorkspaceTeams(teams);
            console.log('teams', teams);
            setIsLoading(false);
        })
    }, []);

    return (
        <>
            { isPersonal ? (
                <>
                    <Box sx={{mb: 3}}>
                        <Typography variant={'h2'}>Teams</Typography>
                    </Box>
                    <Box sx={{mb: 3}}>
                        <Typography variant={'subtitle1'}>You can&apos;t add teams to personal workspace, please switch workspace from user menu in header</Typography>
                    </Box>
                </>
            ) : (
                <>
                    <Box sx={{
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Typography variant={'h2'} >Teams</Typography>
                        <Box sx={{ml: 'auto'}}>
                            <Button onClick={() => setIsOpen(true)} variant={'contained'}>Add New Team</Button>
                        </Box>
                    </Box>
                    <DataGrid
                        autoHeight
                        slots={{
                            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                            noRowsOverlay: CustomNoRowsOverlay
                        }}
                        loading={isLoading}
                        rows={workspaceTeams}
                        getRowId={(row) => row.id}
                        columns={[
                            {
                                field: 'name', headerName: 'Name', flex: 1,
                                renderCell: (params) => (
                                    params.value && (
                                        <>
                                            <Box>
                                                <Link href={`/workspace/${workspaceId}/settings/teams/${params.row.id}`} sx={{textDecoration: 'none', color: 'inherit'}}>
                                                    {params.value}
                                                </Link>
                                            </Box>
                                        </>
                                    )
                                ),
                            },
                            {
                                field: 'members', headerName: 'Members', flex: 1,
                                renderCell: (params) => (
                                    <Box sx={{display: 'flex', alignItems: "center", height: "100%"}}>
                                        <Tooltip
                                            key={params.row.owner.id} title={`${params.row.owner.firstName} ${params.row.owner.lastName} <${params.row.owner.email}> (Owner)`}
                                        >
                                            <Avatar sx={{ bgcolor: deepOrange[500], mr: 1 }}>{getInitials(params.row.owner.firstName, params.row.owner.lastName)}</Avatar>
                                        </Tooltip>
                                        {params.row.members?.map((member: any) => (
                                            <Tooltip
                                                key={member.user.id} title={`${member.user.firstName} ${member.user.lastName} <${member.user.email}> (${member.role.name})`}
                                            >
                                                <Avatar sx={{ mr: 1}}>{getInitials(member.user.firstName, member.user.lastName)}</Avatar>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                )
                            },
                            {
                                field: 'ops', headerName: "", minWidth: 230,
                                renderCell: (params) => (
                                    <>
                                        {params.row.id != user?.id && (
                                            <Box>
                                                <IconButton onClick={() => {
                                                    router.push(`/workspace/${workspaceId}/settings/teams/${params.row.id}`);
                                                }}>
                                                    <Tooltip title={"Edit"}><EditIcon></EditIcon></Tooltip>
                                                </IconButton>
                                                <IconButton color={"error"} onClick={() => {
                                                    const workspaceTeam = workspaceTeams.find((team) => team.id == params.row.id )
                                                    if (workspaceTeam) {
                                                        setSelectedWorkspaceTeam({...workspaceTeam})
                                                        setIsDeleteOpen(true);
                                                    }
                                                }}>
                                                    <Tooltip title={"Delete"}><DeleteForeverIcon></DeleteForeverIcon></Tooltip>
                                                </IconButton>
                                            </Box>
                                        )}
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

                    <AddTeamModal open={isOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsOpen)} workspaceId={workspaceId}></AddTeamModal>
                    {selectedWorkspaceTeam && isEditOpen && (
                        <EditTeamModal open={isEditOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsEditOpen)} team={selectedWorkspaceTeam}  workspaceId={workspaceId}></EditTeamModal>
                    )}
                    {selectedWorkspaceTeam && isDeleteOpen && (
                        <DeleteTeamFromWorkspaceModal open={isDeleteOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsDeleteOpen)} team={selectedWorkspaceTeam}  workspaceId={workspaceId}></DeleteTeamFromWorkspaceModal>
                    )}
                </>
            )}
        </>
    );
}
