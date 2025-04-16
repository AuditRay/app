'use client';
import {Box, Card, IconButton, Menu, Stack, Tooltip, MenuItem} from "@mui/material";
import Link from "@/app/ui/Link";
import {Image} from "@/components/image";
import * as React from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {IFolder} from "@/app/models";
import AddWebsiteToFolderModal from "@/app/ui/Folders/AddWebsiteToFolderModal";
import AddTeamModal from "@/app/ui/Teams/AddTeamModal";
import {getTeams} from "@/app/actions/teamActions";
import RenameFolderModal from "@/app/ui/Folders/RenameFolderModal";
import DeleteFolderModal from "@/app/ui/Folders/DeleteFolderModal";
import {useUserStateStore} from "@/providers/user-store-provider";

const ITEM_HEIGHT = 48;

export default function FolderComponent({workspaceId, folder}: {workspaceId: string, folder: IFolder}) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isRenameOpen, setIsRenameOpen] = React.useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState<boolean>(false);
    const userWorkspaceRole = useUserStateStore((state) => state.sessionUserWorkspaceRole);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleOpen = function (isOpen: boolean, setIsOpen: (isOpen: boolean) => void) {
        //reload
        setIsOpen(isOpen);
    }
    return (
        <Card
            sx={{
                '&:hover': {
                    'backgroundColor': '#eaedef',
                    "a": {
                        'textDecoration': 'none'
                    }
                },
                'backgroundColor': '#DFE3E8'
            }}
        >

            {userWorkspaceRole?.isAdmin || userWorkspaceRole?.isOwner ? (
                <>
                    <IconButton
                        aria-label="more"
                        id="long-button"
                        sx={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleClick}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                            paper: {
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: '20ch',
                                },
                            },
                        }}
                    >
                        <MenuItem onClick={() => {
                            setIsOpen(true);
                            handleClose();
                        }}>
                            Manage Websites
                        </MenuItem>
                        <MenuItem onClick={() => {
                            setIsRenameOpen(true);
                            handleClose();
                        }}>
                            Rename Folder
                        </MenuItem>
                        <MenuItem onClick={() => {
                            setIsDeleteOpen(true);
                            handleClose();
                        }} sx={{color: 'danger'}}>
                            Delete Folder
                        </MenuItem>
                    </Menu>
                </>
            ) : null}
            <Link href={`/workspace/${workspaceId}/projects/folder/${folder.id}`} color="inherit" variant="subtitle2" noWrap>
                <Box sx={{ position: 'relative', p: 1 }}>
                    <Tooltip title={folder.name} placement="bottom-end">
                        <Image
                            alt={folder.name}
                            src={`https://monit-dev-assets.s3.eu-west-1.amazonaws.com/${folder.image}`}
                            ratio="1/1"
                            sx={{ borderRadius: 1.5, p: 2 }}
                        />
                    </Tooltip>
                </Box>
                <Stack spacing={2.5} sx={{ p: 3, pt: 2, textAlign: 'center' }}>
                    {folder.name}
                </Stack>
            </Link>
            <AddWebsiteToFolderModal open={isOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsOpen)} workspaceId={workspaceId} folder={folder}></AddWebsiteToFolderModal>
            <RenameFolderModal open={isRenameOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsRenameOpen)} workspaceId={workspaceId} folder={folder}></RenameFolderModal>
            <DeleteFolderModal open={isDeleteOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsDeleteOpen)} workspaceId={workspaceId} folder={folder}></DeleteFolderModal>
        </Card>
    )
}