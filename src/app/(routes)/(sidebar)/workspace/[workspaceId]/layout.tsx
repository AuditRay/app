'use client'
import { DashboardLayout } from '@/layouts/dashboard';
import React from "react";
import {LicenseInfo} from "@mui/x-license";
import {userSessionState} from "@/app/lib/uiStore";
import {IUser} from "@/app/models";
import {getFullUser, getUser} from "@/app/actions/getUser";


// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

LicenseInfo.setLicenseKey('d180cacff967bbf4eb0152899dacbe68Tz05MzI0OCxFPTE3NTEwNDc4MDIwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

export default function Layout({children, params}: {
  children: React.ReactNode,
  params: Promise<{ workspaceId: string }>
}) {
  const {workspaceId} = React.use(params);
  const sessionUser = userSessionState((state) => state.user);
  const sessionFullUser = userSessionState((state) => state.fullUser);
  const setSessionUser = userSessionState((state) => state.setUser);
  const setSessionFullUser = userSessionState((state) => state.setFullUser);
  const setSessionUserWorkspaceRole = userSessionState((state) => state.setUserWorkspaceRole);
  const [user, setUser] = React.useState<IUser | null>(null);
  console.log("sessionUser12312312344", sessionUser);
  React.useEffect(() => {
    if(sessionUser){
      console.log("sessionUser");
      setUser(sessionUser);
      if(!sessionFullUser) {
        console.log("!sessionFullUser");
        getFullUser(sessionUser.id).then((user) => {
          setSessionFullUser(user);
          const userWorkspaceRole = user.roles.find((role: any) => role.workspace === workspaceId);
          if(userWorkspaceRole) {
            setSessionUserWorkspaceRole(userWorkspaceRole);
          }
        });
      } else {
        console.log("sessionFullUser");
      }
    } else {
      console.log("!sessionUser");
      getUser().then((user) => {
        setSessionUser(user);
      });
    }
  }, [sessionFullUser, sessionUser, setSessionFullUser, setSessionUser, workspaceId]);
  return (
      <DashboardLayout>{children}</DashboardLayout>
  );
}
