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
import {useParams} from "next/navigation";
import {IFiltersView, IUser} from "@/app/models";
import React from "react";
import {userSessionState} from "@/app/lib/uiStore";
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

  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();


  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';
  const [filterViews, setFilterViews] = React.useState<IFiltersView[]>([]);
  const params = useParams<{ workspaceId: string, viewId: string }>()
  const { workspaceId, viewId } = params;
  const [user, setUser] = React.useState<IUser | null>(null);
  const sessionUser = userSessionState((state) => state.user);
  const sessionFullUser = userSessionState((state) => state.fullUser);
  const setSessionUser = userSessionState((state) => state.setUser);
  const setSessionFullUser = userSessionState((state) => state.setFullUser);
  const settingsMenu: NavSectionProps['data'][0] = {
    subheader: 'Settings',
    items: [
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
    ],
  }
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
        { title: 'Alerts', path: `/workspace/${workspaceId}/alerts`, icon: <NotificationsIcon /> },
      ],
    },
    settingsMenu,
  ]);
  React.useEffect(() => {
    getLists(workspaceId).then((lists) => {
      setNavData([
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
            { title: 'Alerts', path: `/workspace/${workspaceId}/alerts`, icon: <NotificationsIcon />},
          ],
        },
        settingsMenu,
      ])
    });
  }, []);

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
          {isNavMini && (<WorkspacesPopover
            data={sessionFullUser?.workspaces?.map(workspace => ({
              id: workspace.id,
              name: workspace.name
            })) || []}
            sx={{ color: 'var(--layout-nav-text-primary-color)' }}
          />)}
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
        bottomArea: !isNavMini && (
            <>
              <Box sx={{ py: 2.5, px: 4}}>
                <Tooltip title={"Workspaces"} placement={"top"}>
                  <WorkspacesPopover
                      data={sessionFullUser?.workspaces?.map(workspace => ({
                        id: workspace.id,
                        name: workspace.name
                      })) || []}
                      sx={{ color: 'var(--layout-nav-text-primary-color)' }}
                      bottom={true}
                  />
                </Tooltip>
              </Box>
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
        )
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
