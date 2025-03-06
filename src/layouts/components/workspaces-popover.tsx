'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import {useState, useCallback, useEffect} from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';

import { Label } from '@/components/label';
import { Iconify } from '@/components/iconify';
import { CustomPopover } from '@/components/custom-popover';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import {useParams, useRouter} from "next/navigation";
// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  data?: {
    id: string;
    name: string;
  }[];
  bottom? : boolean;
};

export function WorkspacesPopover({ data = [], bottom, sx, ...other }: WorkspacesPopoverProps) {
  const mediaQuery = 'sm';
    const router = useRouter();
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const params = useParams<{ workspaceId: string }>()
  const { workspaceId } = params;
  const currentWorkspace = data.find((workspace) => workspace.id === workspaceId);

    console.log('workspace', workspaceId, data, currentWorkspace);
  const [workspace, setWorkspace] = useState(currentWorkspace);
  console.log('workspace', workspace, workspaceId, data, currentWorkspace);
  const handleChangeWorkspace = useCallback(
    (newValue: (typeof data)[0]) => {
        router.push(`/workspace/${newValue.id}/projects`)
        onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const currentWorkspace = data.find((workspace) => workspace.id === workspaceId);
    setWorkspace(currentWorkspace || { id: 'personal', name: 'Personal' });
  }, [data, workspaceId])
  const buttonBg: SxProps<Theme> = {
    height: 1,
    zIndex: -1,
    opacity: 0,
    content: "''",
    borderRadius: 1,
    position: 'absolute',
    visibility: 'hidden',
    bgcolor: 'action.hover',
    width: 'calc(100% + 8px)',
    transition: (theme) =>
      theme.transitions.create(['opacity', 'visibility'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
    ...(open && {
      opacity: 1,
      visibility: 'visible',
    }),
  };

  const renderButton = () => (
    <ButtonBase
      disableRipple
      onClick={onOpen}
      sx={[
        {
          py: 0.5,
          gap: { xs: 0.5, [mediaQuery]: 1 },
          '&::before': buttonBg,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <WorkspacesIcon />

      <Box
        component="span"
        sx={{ typography: 'subtitle2', display: { xs: 'none', [mediaQuery]: 'inline-flex' } }}
      >
        {workspace?.name}
      </Box>

      <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
    </ButtonBase>
  );

  const renderMenuList = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        arrow: { placement: bottom ? 'bottom-left' : 'top-left' },
        paper: { sx: { mt: 0.5, ml: -1.55 } },
      }}
    >
      <MenuList sx={{ width: 240 }}>
          <MenuItem
              key='personal'
              selected={'personal' === workspace?.id}
              onClick={() => handleChangeWorkspace({
                  id: 'personal',
                    name: 'Personal'
              })}
              sx={{ height: 48 }}
          >

              <WorkspacesIcon />
              <Box component="span" sx={{ flexGrow: 1, fontWeight: 'fontWeightMedium' }}>
                  Personal
              </Box>
          </MenuItem>
        {data.map((option) => (
          <MenuItem
            key={option.id}
            selected={option.id === workspace?.id}
            onClick={() => handleChangeWorkspace(option)}
            sx={{ height: 48 }}
          >
            <WorkspacesIcon />

            <Box component="span" sx={{ flexGrow: 1, fontWeight: 'fontWeightMedium' }}>
              {option.name}
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      {renderButton()}
      {renderMenuList()}
    </>
  );
}
