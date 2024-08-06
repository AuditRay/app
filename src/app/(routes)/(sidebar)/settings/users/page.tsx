'use client'
import * as React from "react";
import {Box, LinearProgress, Link} from "@mui/material";
import Typography from "@mui/material/Typography";
import { useRouter } from 'next/navigation';
import {IFieldsTemplate, IUser} from "@/app/models";
import {getUser} from "@/app/actions/getUser";
import {DataGrid, GridSlots} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import {styled} from "@mui/material/styles";
import AddFieldsTemplateModal from "@/app/ui/AddFieldsTemplateModal";
import {getFieldsTemplates} from "@/app/actions/fieldTemplateActions";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditFieldsTemplateModal from "@/app/ui/EditFieldsTemplateModal";
import CloneFieldsTemplateModal from "@/app/ui/CloneFieldsTemplateModal";
import DeleteFieldsTemplateModal from "@/app/ui/DeleteFieldsTemplateModal";
import {getWorkspaceUsers} from "@/app/actions/workspaceActions";
import InviteUserModal from "@/app/ui/InviteUserModal";
import DeleteUserFromWorkspaceModal from "@/app/ui/DeleteUserFromWorkspaceModal";

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
            <Box sx={{ mt: 2 }}>No rows</Box>
        </StyledGridOverlay>
    );
}

export default function UsersSettings() {
    const [user, setUser] = React.useState<IUser | null>(null);
    const [workspaceUsers, setWorkspaceUsers] = React.useState<IUser[]>([]);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [selectedWorkspaceUser, setSelectedWorkspaceUser] = React.useState<IUser>();
    const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);
    const [isCloneOpen, setIsCloneOpen] = React.useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState<boolean>(false);

    const handleOpen = function (isOpen: boolean, setIsOpen: (isOpen: boolean) => void) {
        //reload
        getWorkspaceUsers().then((users) => {
            setWorkspaceUsers(users);
        })
        setSelectedWorkspaceUser(undefined);
        setIsOpen(isOpen);
    }
    React.useEffect(() => {
        setIsLoading(true);
        getUser().then((user) => {
            setUser(user);
        });
        getWorkspaceUsers().then((users) => {
            setWorkspaceUsers(users);
            setIsLoading(false);
        })
    }, []);

    return (
        <>
            {user && !user?.currentSelectedWorkspace ? (
                <>
                    <Box sx={{mb: 3}}>
                        <Typography variant={'h1'}>Users</Typography>
                    </Box>
                    <Box sx={{mb: 3}}>
                        <Typography variant={'subtitle1'}>You can&apos;t add users to personal workspace, please switch workspace from user menu in header</Typography>
                    </Box>
                </>
            ) : (
                <>
                    <Box sx={{
                        mb: 3,
                        display: 'flex'
                    }}>
                        <Typography variant={'h1'} >Users</Typography>
                        <Box sx={{ml: 'auto'}}>
                            <Button onClick={() => setIsOpen(true)} variant={'contained'}>Invite New User</Button>
                        </Box>
                    </Box>
                    <DataGrid
                        autoHeight
                        slots={{
                            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                            noRowsOverlay: CustomNoRowsOverlay
                        }}
                        loading={isLoading}
                        rows={workspaceUsers}
                        getRowId={(row) => row.id}
                        columns={[
                            {
                                field: 'firstName', headerName: 'Name', flex: 1,
                                renderCell: (params) => (
                                    <>
                                        {params.row.firstName} {params.row.lastName}
                                        {params.row.id == user?.id && (
                                            <Typography variant={'caption'} color={'green'}> (You)</Typography>
                                        )}
                                        {params.row.inviteToken && (
                                            <Typography variant={'caption'} color={'gray'}> (Invited)</Typography>
                                        )}
                                    </>
                                )
                            },
                            { field: 'email', headerName: 'Email', flex: 1},
                            {
                                field: 'ops', headerName: "", minWidth: 230,
                                renderCell: (params) => (
                                    <>
                                        {params.row.id != user?.id && (
                                            <Box>
                                                <Button color={"error"} onClick={() => {
                                                    const workspaceUser = workspaceUsers.find((user) => user.id == params.row.id )
                                                    if (workspaceUser) {
                                                        setSelectedWorkspaceUser({...workspaceUser})
                                                        setIsDeleteOpen(true);
                                                    }
                                                }}>
                                                    <DeleteForeverIcon></DeleteForeverIcon>
                                                </Button>
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

                    <InviteUserModal open={isOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsOpen)}></InviteUserModal>
                    {selectedWorkspaceUser && isDeleteOpen && user?.currentSelectedWorkspace && user.id !== selectedWorkspaceUser.id && (
                        <DeleteUserFromWorkspaceModal open={isDeleteOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsDeleteOpen)} user={selectedWorkspaceUser} workspaceId={user.currentSelectedWorkspace as string}></DeleteUserFromWorkspaceModal>
                    )}
                </>
            )}
        </>
    );
}
