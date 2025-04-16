'use client';

import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from '@/components/nav-section';

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { Logo } from '@/components/logo';
import { useSettingsContext } from '@/components/settings';

import { NavMobile } from './nav-mobile';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { layoutClasses } from '@/layouts/core';
import { MainSection } from '@/layouts/core';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '@/layouts/core';
import { LayoutSection } from '@/layouts/core';
import { WorkspacesPopover } from '../components/workspaces-popover';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';

import type { MainSectionProps } from '@/layouts/core';
import type { HeaderSectionProps } from '@/layouts/core';
import type { LayoutSectionProps } from '@/layouts/core';
import {getLists} from '@/app/actions/filterViewsActions';
import {useParams, usePathname} from "next/navigation";
import {IFiltersView, IFolder, IUser} from "@/app/models";
import React from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InputIcon from "@mui/icons-material/Input";
import SettingsIcon from '@mui/icons-material/Settings';
import ExtensionIcon from "@mui/icons-material/Extension";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from '@mui/icons-material/Person';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import Link from "@/app/ui/Link";
import {Logout} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import {Breadcrumbs} from "@mui/material";
import {getFolderInfo, getWebsiteFolders} from "@/app/actions/folderActions";
import {useUserStateStore} from "@/providers/user-store-provider";
// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavSectionProps['data'];
    };
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();


  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';
  const params = useParams<{ workspaceId: string, folderId: string, websiteId: string }>()
  const { workspaceId, folderId, websiteId } = params;
  const [folder, setFolder] = React.useState<IFolder | null>(null);
  const [folders, setFolders] = React.useState<IFolder[]>([]);

  const sessionUser = useUserStateStore((state) => state.sessionUser);
  const sessionFullUser = useUserStateStore((state) => state.sessionFullUser);
  const userWorkspaceRole = useUserStateStore((state) => state.sessionUserWorkspaceRole);
  const canViewSettings = userWorkspaceRole?.isAdmin || userWorkspaceRole?.isOwner || userWorkspaceRole?.isTeamAdmin;
  const [settingsMenu, setSettingsMenu] = React.useState<NavSectionProps['data'][0]>({
    subheader: '',
    items: [],
  });
  const [navData, setNavData] = React.useState<NavSectionProps['data']>([
    /**
     * Overview
     */
    {
      subheader: 'Workspace',
      items: [
        {
          title: 'Projects',
          path: `/workspace/${workspaceId}/projects`,
          icon: <ViewModuleIcon />,
        },
        {
          title: 'Lists',
          path: `/workspace/${workspaceId}/projects/lists`,
          icon: <DashboardCustomizeIcon />,
          children: []
        },
        { title: 'Tests History', path: `/workspace/${workspaceId}/tests-history`, icon: <NotificationsIcon /> },
      ],
    },
    canViewSettings ? settingsMenu : {
      subheader: '',
      items: [],
    },
  ]);
  React.useEffect(() => {
    getWebsiteFolders(workspaceId, websiteId).then((folders) => {
      setFolders(folders);
    });
  }, [websiteId])
  React.useEffect(() => {
    console.log("workspaceId settings", workspaceId, userWorkspaceRole, canViewSettings);
    if(!workspaceId) return;
    const settings = {
      subheader: 'Settings',
      items: userWorkspaceRole?.isAdmin || userWorkspaceRole?.isOwner  ? [
        {
          title: 'General',
          path: `/workspace/${workspaceId}/settings`,
          icon: <SettingsIcon />,
        },
        {
          title: 'Tests',
          path: `/workspace/${workspaceId}/settings/tests`,
          icon: <NotificationsIcon />,
        },
        {
          title: 'Custom Fields',
          path: `/workspace/${workspaceId}/settings/custom-fields`,
          icon: <InputIcon />,
        },
        {
          title: 'Integrations',
          path: `/workspace/${workspaceId}/settings/integrations`,
          icon: <ExtensionIcon />,
        },
        {
          title: 'Users',
          path: `/workspace/${workspaceId}/settings/users`,
          icon: <PersonIcon />,
        },
        {
          title: 'Teams',
          path: `/workspace/${workspaceId}/settings/teams`,
          icon: <GroupsIcon />,
        },
      ] : userWorkspaceRole?.isTeamAdmin ? [
        {
          title: 'Teams',
          path: `/workspace/${workspaceId}/settings/teams`,
          icon: <GroupsIcon />,
        }
      ] : [
        {
          title: 'Tests',
          path: `/workspace/${workspaceId}/settings/tests`,
          icon: <NotificationsIcon />,
        },
        {
          title: 'Custom Fields',
          path: `/workspace/${workspaceId}/settings/custom-fields`,
          icon: <InputIcon />,
        }
      ]
    }
    setSettingsMenu(settings)
  }, [workspaceId, userWorkspaceRole, canViewSettings])
  React.useEffect(() => {
    getFolderInfo(workspaceId, folderId).then((folder) => {
      console.log("folder", folder);
        setFolder(folder);
    });
    getLists(workspaceId).then((lists) => {
      const nav = [
        {
          subheader: 'Workspace',
          items: [
            {
              title: 'Projects',
              path: `/workspace/${workspaceId}/projects`,
              icon: <ViewModuleIcon />,
            },
            {
              title: 'Lists',
              path: `/workspace/${workspaceId}/projects/lists`,
              icon:  <DashboardCustomizeIcon />,
              disabled: lists.length === 0,
              children: lists.map((list) => {
                return { title: list.title, path: `/workspace/${workspaceId}/projects/lists/${list.id}` }
              })
            },
            { title: 'Tests History', path: `/workspace/${workspaceId}/tests-history`, icon: <NotificationsIcon />},
          ],
        },
        settingsMenu,
      ]
      if(isNavMini) {
        nav.push({
          subheader: 'Account',
          items: [
            {
              title: 'Logout',
              path: '/logout',
              icon: <Logout/>,
            }
          ]
        })
      }
      setNavData(nav);
    });
  }, [folderId, canViewSettings, isNavMini, workspaceId, settingsMenu]);

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile data={navData} open={open} onClose={onClose} cssVars={navVars.section} />

          {/** @slot Logo */}
          {isNavHorizontal && (
            <Logo
              sx={{
                display: 'none',
                [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              }}
            />
          )}

          {/** @slot Divider */}
          {isNavHorizontal && (
            <VerticalDivider sx={{ [theme.breakpoints.up(layoutQuery)]: { display: 'flex' } }} />
          )}

          {/** @slot Workspace popover */}
          <Breadcrumbs aria-label="breadcrumb">
            <Box>
              {sessionFullUser?.workspaces?.length ? (
                <WorkspacesPopover
                    data={sessionFullUser?.workspaces?.map(workspace => ({
                      id: workspace.id,
                      name: workspace.name
                    })) || []}
                    sx={{ color: 'var(--layout-nav-text-primary-color)' }}
                />
              ) : (
                <Typography variant={'h6'}>...</Typography>
              )}
            </Box>
            {pathname.includes('/projects') && (
                <Link underline="hover" color="inherit" href={`/workspace/${workspaceId}/projects`}>
                  Projects
                </Link>
            )}
            {pathname.includes('/projects/folder') && (
                <Link underline="hover" color="inherit" href={`/workspace/${workspaceId}/projects/folder/${folderId}`}>
                  {folder?.name || 'Folder'}
                </Link>
            )}
            {pathname.includes('/projects') && websiteId && folders && (
                <Box>
                  {folders.map((folder, index) => (
                        <Link key={`folder-${index}`} underline="hover" color="inherit" href={`/workspace/${workspaceId}/projects/folder/${folder.id}`}>
                            {folder.name}
                        </Link>
                  ))}
                </Box>
            )}
            {pathname.includes('/projects') && websiteId && (
                <Typography sx={{ color: 'text.primary' }}>Project</Typography>
            )}
            {pathname.includes('/tests-history') && !pathname.includes('/settings') && (
                <Link underline="hover" color="inherit" href={`/workspace/${workspaceId}/tests-history`}>
                  Tests History
                </Link>
            )}
            {pathname.includes('/settings') && (
                <Link underline="hover" color="inherit" href={`/workspace/${workspaceId}/settings`}>
                  Settings
                </Link>
            )}
            {pathname.includes('/settings') && pathname.endsWith('/settings') &&  (
                <Typography sx={{ color: 'text.primary' }}>General</Typography>
            )}
            {pathname.includes('/settings') && pathname.endsWith('/tests') &&  (
                <Typography sx={{ color: 'text.primary' }}>Tests</Typography>
            )}
            {pathname.includes('/settings') && pathname.endsWith('/custom-fields') &&  (
                <Typography sx={{ color: 'text.primary' }}>Custom Fields</Typography>
            )}
            {pathname.includes('/settings') && pathname.endsWith('/integrations') &&  (
                <Typography sx={{ color: 'text.primary' }}>Integrations</Typography>
            )}
            {pathname.includes('/settings') && pathname.endsWith('/users') &&  (
                <Typography sx={{ color: 'text.primary' }}>Users</Typography>
            )}
            {pathname.includes('/settings') && pathname.includes('/teams') &&  (
                <Link underline="hover" color="inherit" href={`/workspace/${workspaceId}/settings/teams`}>
                  Teams
                </Link>
            )}
          </Breadcrumbs>
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>

        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
      slots={{
        bottomArea: !isNavMini ? (
            <>
              {sessionUser &&
                <Box sx={{ pb: 2.5, px: 4, display: "flex", gap: 1}}>
                  <PersonIcon/>
                  <Tooltip title={sessionUser.email} placement={"top"}>
                    <Typography variant={'caption'}>
                      {sessionUser.firstName} {sessionUser.lastName}
                    </Typography>
                  </Tooltip>
                  <Box sx={{ml: 'auto'}}>
                    <Tooltip title={'Logout'} placement={"top"}>
                      <Link href={'/logout'} variant="subtitle2">
                        <Logout fontSize={'small'}/>
                      </Link>
                    </Tooltip>
                  </Box>
                </Box>
              }
            </>
        ) :  null
      }}
    />
  );

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
