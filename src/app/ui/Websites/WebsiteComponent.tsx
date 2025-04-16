'use client';
import {Box, Card, IconButton, Menu, Stack, Tooltip, MenuItem, Chip} from "@mui/material";
import Link from "@/app/ui/Link";
import {Image} from "@/components/image";
import * as React from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {IWebsite} from "@/app/models";
import {IWebsitePage} from "@/app/actions/websiteActions";
import WebsitesInfoGrid from "@/app/ui/WebsitesInfoGrid";
import UpdateWebsiteDialog from "@/app/ui/Websites/Dialogs/UpdateWebsiteDialog";
import WebsiteTokenDialog from "@/app/ui/Websites/Dialogs/WebsiteTokenDialog";
import WebsiteRunsDialog from "@/app/ui/Websites/Dialogs/WebsiteRunsDialog";
import UpdateWebsiteInfoDialog from "@/app/ui/Websites/Dialogs/UpdateWebsiteInfoDialog";
import {useUserStateStore} from "@/providers/user-store-provider";

const ITEM_HEIGHT = 48;

export default function WebsiteComponent({workspaceId, website}: {workspaceId: string, website: IWebsitePage}) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const userWorkspaceRole = useUserStateStore((state) => state.sessionUserWorkspaceRole);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [editOpen, setEditOpen] = React.useState<boolean>(false);
    const [tokenOpen, setTokenOpen] = React.useState<boolean>(false);
    const [runsOpen, setRunsOpen] = React.useState<boolean>(false);
    const [updateInfoOpen, setUpdateInfoOpen] = React.useState<boolean>(false);

    return (
        <Card
            sx={{
                '&:hover': {
                    'backgroundColor': '#eaedef',
                    "a": {
                        'textDecoration': 'none'
                    }
                },
                'backgroundColor': '#DFE3E8',
                height: '100%'
            }}
        >
            {editOpen && <UpdateWebsiteDialog open={editOpen} setOpenAction={setEditOpen} websiteId={website.id} workspaceId={workspaceId} />}
            {tokenOpen && <WebsiteTokenDialog open={tokenOpen} setOpenAction={setTokenOpen} websiteId={website.id} />}
            {runsOpen && <WebsiteRunsDialog open={runsOpen} setOpenAction={setRunsOpen} websiteId={website.id} />}
            {updateInfoOpen && <UpdateWebsiteInfoDialog open={updateInfoOpen} setOpenAction={setUpdateInfoOpen} websiteId={website.id} />}
            <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                sx={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
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

                {userWorkspaceRole?.isAdmin || userWorkspaceRole?.isOwner ? (
                    <MenuItem onClick={() => {
                        setEditOpen(true);
                        handleClose()
                    }}>
                        Edit Website
                    </MenuItem>
                ) : null}
                <MenuItem onClick={() => {
                    setTokenOpen(true);
                    handleClose()
                }}>
                    Connection Token
                </MenuItem>
                <MenuItem onClick={() => {
                    setRunsOpen(true);
                    handleClose()
                }}>
                    Update Runs
                </MenuItem>
                <MenuItem onClick={() => {
                    setUpdateInfoOpen(true);
                    handleClose()
                }}>
                    Update Website Info
                </MenuItem>
            </Menu>
            <Link href={`/workspace/${workspaceId}/projects/${website.id}`} color="inherit" variant="subtitle2" noWrap>
                <Box sx={{ p: 3, pt: 2, pr: 5, textAlign: 'left', fontSize: "12px", textWrap: 'auto', minHeight: "100px" }}>
                    <Box component={'img'}  src={`${website.favicon ?? '/tech/other.png'}`} alt={website.title || website.url} sx={{width: '30px', verticalAlign: 'middle', mr: '10px', pb: '5px'}} /> {website.siteName || website.url}
                </Box>
                <Box sx={{ p: 1, pt: 1, textAlign: 'center', fontSize: "12px" }}>
                    <Tooltip title={'Status'} placement="top">
                        {website.frameWorkUpdateStatus === 'Up to Date' ? (
                            <Chip label={website.frameWorkUpdateStatus} color={"success"} />
                        ) : website.frameWorkUpdateStatus === 'Security Update' ? (
                            <Chip label={website.frameWorkUpdateStatus} color={"error"} />
                        ) : website.frameWorkUpdateStatus === 'Needs Update' ? (
                            <Chip label={website.frameWorkUpdateStatus} color={"warning"} />
                        ) : (
                            <Chip label={website.frameWorkUpdateStatus} color={"info"} />
                        )}
                    </Tooltip>
                </Box>
                <Box sx={{ p: 1, pt: 1, textAlign: 'center', fontSize: "12px", display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title={'Total Components'} placement="top">
                        {website.componentsNumber > 0 ? (
                            <Chip label={website.componentsNumber} color={'default'} />
                        ) : (
                            <Chip label={0} color={"default"} />
                        )}
                    </Tooltip>
                    <Tooltip title={'Needs Update'} placement="top">
                        {website.componentsWithUpdatesNumber > 0 ? (
                            <Chip label={website.componentsWithUpdatesNumber} color={'warning'} />
                        ) : (
                            <Chip label={0} color={"success"} />
                        )}
                    </Tooltip>

                    <Tooltip title={'Security Updates'} placement="top">
                        {website.componentsWithSecurityUpdatesNumber > 0 ? (
                            <Chip label={website.componentsWithSecurityUpdatesNumber} color={'error'} />
                        ) : (
                            <Chip label={0} color={"success"} />
                        )}
                    </Tooltip>
                </Box>
                <Box sx={{ position: 'relative', p: 1, textAlign: 'center' }}>
                    <Tooltip title={website.frameWorkType} placement="right">
                        <Image
                            alt={website.frameWorkType}
                            src={website.frameWorkType ? `/type/${website.frameWorkType.toLowerCase()}.png` : '/type/other.png'}
                            sx={{ borderRadius: 1.5, p: 0, width: '50px', height: '50px' }}
                        />
                    </Tooltip>
                </Box>
                <Box sx={{ p: 0, pb: 3, textAlign: 'center', fontSize: "12px" }}>
                    <Tooltip title={'Framework Version'} placement="bottom">
                        <span>
                            {website.frameworkVersion ? (
                                website.frameworkVersion.currentVersion
                            ) : (
                                'Unknown'
                            )}
                        </span>
                    </Tooltip>
                </Box>
                <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
                    <Box sx={{ display: 'flex', gap: 1}}>
                        {website.tags && website.tags.length > 0 ? website.tags.map((tag, index) => (
                                <Tooltip key={`tag-${tag}`} title={'Tags'} placement="top">
                            <Chip  label={tag} color={"info"} />
                                </Tooltip>
                        )) : (
                            ''
                        )}
                    </Box>
                    <Box sx={{ textAlign: "right"}}>
                        <Tooltip title={'Last Update'} placement="top">
                            <span>{website.updatedAtText}</span>
                        </Tooltip>
                    </Box>
                </Box>
            </Link>
        </Card>
    )
}