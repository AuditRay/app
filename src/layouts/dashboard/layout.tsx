'use client';

import type { Breakpoint } from '@mui/material/styles';
import type { NavSectionProps } from '@/components/nav-section';

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { _contacts, _notifications } from '@/_mock';

import { Logo } from '@/components/logo';
import { useSettingsContext } from '@/components/settings';

import { NavMobile } from './nav-mobile';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { layoutClasses } from '@/layouts/core';
import { NavHorizontal } from './nav-horizontal';
import { _account } from '../nav-config-account';
import { MainSection } from '@/layouts/core';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '@/layouts/core';
import { LayoutSection } from '@/layouts/core';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
import { LanguagePopover } from '../components/language-popover';
import { ContactsPopover } from '../components/contacts-popover';
import { WorkspacesPopover } from '../components/workspaces-popover';
import {ICONS, navData as dashboardNavData} from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { NotificationsDrawer } from '../components/notifications-drawer';

import type { MainSectionProps } from '@/layouts/core';
import type { HeaderSectionProps } from '@/layouts/core';
import type { LayoutSectionProps } from '@/layouts/core';
import { getFiltersViews } from '@/app/actions/filterViewsActions';
import {useParams} from "next/navigation";
import {IFiltersView, IUser} from "@/app/models";
import React from "react";
import {userSessionState} from "@/app/lib/uiStore";
import {getFullUser, getUser} from "@/app/actions/getUser";
import {Label} from "@/components/label";
import {CONFIG} from "@/global-config";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InputIcon from "@mui/icons-material/Input";
import SettingsIcon from '@mui/icons-material/Settings';
import ExtensionIcon from "@mui/icons-material/Extension";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from '@mui/icons-material/Person';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
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
          title: 'Websites',
          path: `/workspace/${workspaceId}/websites`,
          icon: <ViewModuleIcon />,
        },
        {
          title: 'Views',
          path: `/workspace/${workspaceId}/websites/views`,
          icon: <DashboardCustomizeIcon />,
          children: []
        },
        { title: 'Alerts', path: `/workspace/${workspaceId}/alerts`, icon: <NotificationsIcon /> },
      ],
    },
    settingsMenu,
  ]);
  React.useEffect(() => {
    getFiltersViews(workspaceId).then((filtersViews) => {
      setNavData([
        {
          subheader: 'Workspace',
          items: [
            {
              title: 'Websites',
              path: `/workspace/${workspaceId}/websites`,
              icon: <ViewModuleIcon />,
            },
            {
              title: 'Views',
              path: `/workspace/${workspaceId}/websites/views`,
              icon:  <DashboardCustomizeIcon />,
              children: filtersViews.map((view) => {
                return { title: view.title, path: `/workspace/${workspaceId}/websites/views/${view.id}` }
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
                <WorkspacesPopover
                    data={sessionFullUser?.workspaces?.map(workspace => ({
                      id: workspace.id,
                      name: workspace.name
                    })) || []}
                    sx={{ color: 'var(--layout-nav-text-primary-color)' }}
                    bottom={true}
                />
              </Box>
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
