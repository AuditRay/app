'use client';
import {Box, Card, IconButton, Menu, Stack, Tooltip, MenuItem} from "@mui/material";
import Link from "@/app/ui/Link";
import {Image} from "@/components/image";
import * as React from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {IWebsite} from "@/app/models";

const ITEM_HEIGHT = 48;

export default function WebsiteComponent({workspaceId, website}: {workspaceId: string, website: IWebsite}) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Card
            sx={{
                '&:hover': {
                    'background-color': '#eaedef',
                },
                'background-color': '#DFE3E8'
            }}
        >
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
                <MenuItem onClick={handleClose}>
                    Edit Website
                </MenuItem>
            </Menu>
            <Link href={`/workspace/${workspaceId}/websites/${website.id}`} color="inherit" variant="subtitle2" noWrap>
                <Box sx={{ position: 'relative', p: 1, textAlign: 'center' }}>
                    <Tooltip title={website.type?.name} placement="top">
                        <Image
                            alt={website.type?.name}
                            src={website.type?.name ? `/type/${website.type?.name.toLowerCase()}.png` : '/type/other.png'}
                            sx={{ borderRadius: 1.5, p: 2, maxWidth: "60%"}}
                        />
                    </Tooltip>
                </Box>
                <Box sx={{ p: 3, pt: 2, textAlign: 'center', fontSize: "12px" }}>
                    <Box component={'img'}  src={`${website.favicon ?? '/tech/other.png'}`} alt={website.title || website.url} sx={{width: '20px', verticalAlign: 'middle', mr: '10px'}} /> {website.title || website.url}
                </Box>
            </Link>
        </Card>
    )
}