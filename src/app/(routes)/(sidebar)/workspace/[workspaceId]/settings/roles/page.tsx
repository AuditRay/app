'use client'
import * as React from "react";
import {Box, Icon, IconButton, LinearProgress, Tab, Tabs} from "@mui/material";
import Typography from "@mui/material/Typography";
import {IRole, IUser} from "@/app/models";
import {DataGrid, GridRenderCellParams, GridSlots} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import {styled} from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import AddRoleModal from "@/app/ui/Roles/AddRoleModal";
import DeleteRoleFromWorkspaceModal from "@/app/ui/Roles/DeleteRoleFromWorkspaceModal";
import Tooltip from "@mui/material/Tooltip";
import EditRoleModal from "@/app/ui/Roles/EditRoleModal";
import {getWorkspaceAllRoles, updateRole} from "@/app/actions/rolesActions";
import {buildWorkspaceBasePermissions, PermissionsValue} from "@/app/premissions";
import CircularProgress from "@mui/material/CircularProgress";
import {userSessionState} from "@/app/lib/uiStore";

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
            <Box sx={{ mt: 2 }}>No roles found</Box>
        </StyledGridOverlay>
    );
}

export default function RolesSettings({params}: { params: Promise<{ workspaceId: string }> }) {
    const [user, setUser] = React.useState<IUser | null>(null);
    const { workspaceId } = React.use(params);
    const [workspaceRoles, setWorkspaceRoles] = React.useState<IRole[]>([]);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [tabValue, setTabValue] = React.useState<string>('');
    const [selectedWorkspaceRole, setSelectedWorkspaceRole] = React.useState<IRole>();
    const [savingRoles, setSavingRoles] = React.useState<string[]>(['']);
    const sessionUser = userSessionState((state) => state.user);
    const [workspacePermissions, setWorkspacePermissions] = React.useState<PermissionsValue[]>();
    const [workspaceGroupedPermissions, setWorkspaceGroupedPermissions] = React.useState<Record<string, PermissionsValue[]>>();
    const [workspaceGroups, setWorkspaceGroups] = React.useState<{
        id: string;
        name: string;
        icon: string;
    }[]>();
    const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState<boolean>(false);
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };
    const currentWorkspaceId = workspaceId;

    const handleOpen = function (isOpen: boolean, setIsOpen: (isOpen: boolean) => void) {
        //reload
        getWorkspaceAllRoles(workspaceId).then((roles) => {
            setWorkspaceRoles(roles);
        })
        setSelectedWorkspaceRole(undefined);
        setIsOpen(isOpen);
    }
    React.useEffect(() => {
        if(workspaceId == 'personal') {
            return;
        }
        setIsLoading(true);
        setUser(sessionUser);
        getWorkspaceAllRoles(workspaceId).then((roles) => {
            setWorkspaceRoles(roles);
            console.log('roles', roles);
            setIsLoading(false);
        })
        buildWorkspaceBasePermissions(workspaceId).then((permissions) => {
            const groups: { id: string; name: string; icon: string }[] = [];
            const groupedPermissions: Record<string, PermissionsValue[]> = {};
            for (const permission in permissions) {
                if (permissions[permission]) {
                    const permissionData = permissions[permission];
                    if (!groupedPermissions[permissionData.group]) {
                        groupedPermissions[permissionData.group] = [];
                    }
                    groupedPermissions[permissionData.group].push(permissions[permission]);
                    if (!groups.find((group) => group.id === permissionData.group)) {
                        groups.push({
                            id: permissionData.group,
                            name: permissionData.group,
                            icon: permissionData.icon
                        });
                    }
                }
            }
            setTabValue(groups[0].id);
            setWorkspaceGroups(groups);
            setWorkspaceGroupedPermissions(groupedPermissions);
        })
    }, [sessionUser]);

    return (
        <>
            {currentWorkspaceId == 'personal' ? (
                <>
                    <Box sx={{mb: 3}}>
                        <Typography variant={'h1'}>Roles</Typography>
                    </Box>
                    <Box sx={{mb: 3}}>
                        <Typography variant={'subtitle1'}>You can&apos;t add roles to personal workspace, please switch workspace from user menu in header</Typography>
                    </Box>
                </>
            ) : (
                <>
                    <Box sx={{
                        mb: 3,
                        display: 'flex'
                    }}>
                        <Typography variant={'h1'} >Roles</Typography>
                        <Box sx={{ml: 'auto'}}>
                            <Button onClick={() => setIsOpen(true)} variant={'contained'}>Add New Role</Button>
                        </Box>
                    </Box>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                            {workspaceGroups?.map((group, index) => {
                                return (
                                    <Tab label={group.name} key={group.id} value={group.id} sx={{fontSize: '11x'}}/>
                                )
                            })}
                        </Tabs>
                    </Box>
                    <DataGrid
                        autoHeight
                        slots={{
                            loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                            noRowsOverlay: CustomNoRowsOverlay
                        }}
                        loading={isLoading}
                        rows={workspaceRoles}
                        disableRowSelectionOnClick={true}
                        getRowId={(row) => row.id}
                        sx={{
                            '& .MuiDataGrid-cell:focus': {
                                outline: ' none'
                            },
                        }}
                        columns={[
                            { field: 'name', headerName: 'Name', flex: 1,
                                minWidth: 250,
                                renderCell: (params) => (
                                    <Box sx={{
                                        display: 'flex', '&:hover': {
                                            '.showHover': {
                                                display: 'block',
                                            },
                                        }
                                    }}
                                    >
                                        {params.row.name} {params.row.isWorkspace ? '(Workspace)' : ''}
                                        {!params.row.isDefault && (
                                            <Box className={"showHover"} sx={{display: "none"}}>
                                                {!params.row.overrideId && (
                                                    <>
                                                        <IconButton color={"info"} sx={{ml:1}} onClick={() => {
                                                            const workspaceRole = workspaceRoles.find((role) => role.id == params.row.id )
                                                            if (workspaceRole) {
                                                                setSelectedWorkspaceRole({...workspaceRole})
                                                                setIsEditOpen(true);
                                                            }
                                                        }}><Tooltip title={'Edit'}><EditIcon fontSize={"small"}></EditIcon></Tooltip></IconButton>
                                                        <IconButton color={"error"} onClick={() => {
                                                            const workspaceRole = workspaceRoles.find((role) => role.id == params.row.id )
                                                            if (workspaceRole) {
                                                                setSelectedWorkspaceRole({...workspaceRole})
                                                                setIsDeleteOpen(true);
                                                            }
                                                        }}><Tooltip title={'Delete'}><DeleteForeverIcon fontSize={"small"}></DeleteForeverIcon></Tooltip></IconButton>
                                                    </>
                                                )}
                                                {params.row.overrideId && (
                                                    <IconButton color={"warning"} onClick={() => {
                                                        const workspaceRole = workspaceRoles.find((role) => role.id == params.row.id )
                                                        if (workspaceRole) {
                                                            setSelectedWorkspaceRole({...workspaceRole})
                                                            setIsDeleteOpen(true);
                                                        }
                                                    }}><Tooltip title={'Reset'}><RotateLeftIcon fontSize={"small"}></RotateLeftIcon></Tooltip></IconButton>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                )
                            },
                            ...(tabValue && workspaceGroupedPermissions && workspaceGroupedPermissions[tabValue] && workspaceGroupedPermissions[tabValue]?.map((permission) => {
                                return {
                                    field: permission.id,
                                    headerName: permission.id,
                                    sortable: false,
                                    resizable: false,
                                    disableColumnMenu: true,
                                    flex: 1,
                                    maxWidth: 100,
                                    renderHeader: () => (
                                        <Tooltip title={permission.description}>
                                            <Icon sx={{ml: 1}}>{permission.icon}</Icon>
                                        </Tooltip>
                                    ),
                                    renderCell: (params: GridRenderCellParams<IRole, any, any>) => (
                                        <>
                                            {params.row.permissions[permission.id] ?
                                                <Tooltip title={`${permission.id} is enabled`}>
                                                    <IconButton color="success"
                                                                disabled={params.row.id.includes("default_admin") || savingRoles.includes(`${params.row.id}_${permission.id}`)}
                                                                onClick={() => {
                                                        const workspaceRole = workspaceRoles.find((role) => role.id == params.row.id)
                                                        if (workspaceRole && !workspaceRole.id.includes("default_admin")) {
                                                            //set permission from workspaceRole to false
                                                            workspaceRole.permissions[permission.id] = false;
                                                            //update role
                                                            setSavingRoles([...savingRoles, `${params.row.id}_${permission.id}`]);
                                                            console.log('workspaceRole', workspaceRole);
                                                            updateRole(workspaceRole.id, {
                                                                ...workspaceRole,
                                                                permissions: {
                                                                    ...(workspaceRole.permissions || {}),
                                                                    [permission.id]: false
                                                                }
                                                            }).then((role) => {
                                                                console.log('role', role);
                                                                setWorkspaceRoles([...workspaceRoles]);
                                                                getWorkspaceAllRoles(currentWorkspaceId).then((roles) => {
                                                                    setWorkspaceRoles(roles);
                                                                })
                                                                setSavingRoles(savingRoles.filter((savingRole) => savingRole !== `${params.row.id}_${permission.id}`));
                                                            }).catch((e) => {
                                                                console.log('role e', e);
                                                                workspaceRole.permissions[permission.id] = true;
                                                                setWorkspaceRoles([...workspaceRoles]);
                                                                getWorkspaceAllRoles(currentWorkspaceId).then((roles) => {
                                                                    setWorkspaceRoles(roles);
                                                                })
                                                                setSavingRoles(savingRoles.filter((savingRole) => savingRole !== `${params.row.id}_${permission.id}`));
                                                            })
                                                        }
                                                    }}>
                                                        {savingRoles.includes(`${params.row.id}_${permission.id}`) ?
                                                            <>
                                                                <CircularProgress
                                                                    size={24}
                                                                    sx={{
                                                                        color: "red",
                                                                        position: 'absolute',
                                                                        top: '50%',
                                                                        left: '50%',
                                                                        marginTop: '-12px',
                                                                        marginLeft: '-12px',
                                                                    }}
                                                                />
                                                                <Icon>check_circle</Icon>
                                                            </>:
                                                            <Icon>check_circle</Icon>
                                                        }
                                                    </IconButton>
                                                </Tooltip> :
                                                <Tooltip title={`${permission.id} is disabled`}>
                                                    <IconButton color="error"
                                                                disabled={params.row.id.includes("default_admin") || savingRoles.includes(`${params.row.id}_${permission.id}`)}
                                                                onClick={() => {
                                                        const workspaceRole = workspaceRoles.find((role) => role.id == params.row.id )
                                                        if (workspaceRole && !workspaceRole.id.includes("default_admin")) {
                                                            //set permission from workspaceRole to false
                                                            workspaceRole.permissions[permission.id] = true;
                                                            //update role
                                                            setSavingRoles([...savingRoles, `${params.row.id}_${permission.id}`]);
                                                            console.log('workspaceRole', workspaceRole);
                                                            updateRole(workspaceRole.id, {
                                                                ...workspaceRole,
                                                                permissions: {
                                                                    ...(workspaceRole.permissions || {}),
                                                                    [permission.id]: true
                                                                }
                                                            }).then((role) => {
                                                                console.log('role', role);
                                                                setWorkspaceRoles([...workspaceRoles]);
                                                                getWorkspaceAllRoles(currentWorkspaceId).then((roles) => {
                                                                    setWorkspaceRoles(roles);
                                                                })
                                                                setSavingRoles(savingRoles.filter((savingRole) => savingRole !== `${params.row.id}_${permission.id}`));
                                                            }).catch((e) => {
                                                                console.log('role e', e);
                                                                workspaceRole.permissions[permission.id] = false;
                                                                setWorkspaceRoles([...workspaceRoles]);
                                                                getWorkspaceAllRoles(currentWorkspaceId).then((roles) => {
                                                                    setWorkspaceRoles(roles);
                                                                })
                                                                setSavingRoles(savingRoles.filter((savingRole) => savingRole !== `${params.row.id}_${permission.id}`));
                                                            })
                                                        }
                                                    }}>
                                                        {savingRoles.includes(`${params.row.id}_${permission.id}`) ?
                                                            <>
                                                                <CircularProgress
                                                                    size={24}
                                                                    sx={{
                                                                        color: "green",
                                                                        position: 'absolute',
                                                                        top: '50%',
                                                                        left: '50%',
                                                                        marginTop: '-12px',
                                                                        marginLeft: '-12px',
                                                                    }}
                                                                />
                                                                <Icon>cancel</Icon>
                                                            </> :
                                                            <Icon>cancel</Icon>
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                        </>
                                    )
                                }
                            }) || [])
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

                    <AddRoleModal open={isOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsOpen)}></AddRoleModal>
                    {selectedWorkspaceRole && isEditOpen && (
                        <EditRoleModal open={isEditOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsEditOpen)} role={selectedWorkspaceRole}></EditRoleModal>
                    )}
                    {selectedWorkspaceRole && isDeleteOpen && (
                        <DeleteRoleFromWorkspaceModal open={isDeleteOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsDeleteOpen)} role={selectedWorkspaceRole}></DeleteRoleFromWorkspaceModal>
                    )}
                </>
            )}
        </>
    );
}
