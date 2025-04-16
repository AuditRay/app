'use client'
import { DashboardLayout } from '@/layouts/dashboard';
import React from "react";
import {LicenseInfo} from "@mui/x-license";
import {getFullUser, getUser} from "@/app/actions/getUser";
import {useUserStateStore} from "@/providers/user-store-provider";


// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

LicenseInfo.setLicenseKey(`${process.env.NEXT_PUBLIC_MUI_X_LICENSE_KEY}`);

export default function Layout({children, params}: {
  children: React.ReactNode,
  params: Promise<{ workspaceId: string }>
}) {
  const {workspaceId} = React.use(params);
  const {
    sessionUser,
    sessionFullUser,
    setSessionUser,
    setSessionFullUser,
    setSessionUserWorkspaceRole,
    clearSessionUserWorkspaceRole
  } = useUserStateStore((state => state));

  console.log('workspaceId', workspaceId);
  React.useEffect(() => {
    console.log('sessionUser', sessionUser, workspaceId);
    if(sessionUser){
      console.log("sessionUser");
      if(!sessionFullUser) {
        console.log("!sessionFullUser");
        getFullUser(sessionUser.id).then((user) => {
          setSessionFullUser(user);
          const userWorkspaceRole = user.roles.find((role: any) => role.workspace === workspaceId);
          if(userWorkspaceRole) {
            setSessionUserWorkspaceRole(userWorkspaceRole);
          } else {
            clearSessionUserWorkspaceRole()
          }
        });
      } else {
        console.log("sessionFullUser", sessionFullUser);
        const userWorkspaceRole = sessionFullUser.roles?.find((role: any) => role.workspace === workspaceId);
        if(userWorkspaceRole) {
          setSessionUserWorkspaceRole(userWorkspaceRole);
        } else {
          clearSessionUserWorkspaceRole()
        }
      }
    } else {
      console.log("!sessionUser");
      getUser().then((user) => {
        setSessionUser(user);
      });
    }
  }, [sessionUser, workspaceId]);
  return (
      <DashboardLayout>{children}</DashboardLayout>
  );
}
