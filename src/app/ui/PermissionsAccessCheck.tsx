'use client'

import React from "react";
import {IUser} from "@/app/models";
import {checkUserAccess, PermissionsKeys} from "@/app/premissions";
import {userSessionState} from "@/app/lib/uiStore";
type props = {
    user?: IUser
    workspaceId: string
    permission: PermissionsKeys
    data? : any
    children: React.ReactNode
    noAccessComponent?: React.ReactNode
}
export default function PermissionsAccessCheck (props: props) {
    const {user, permission, data, workspaceId} = props;
    const sessionUser = userSessionState((state) => state.user);
    const [hasAccess, setHasAccess] = React.useState<boolean>(false);

    React.useEffect(() => {
        if(!sessionUser && !user) return;
        if(!permission) return;
        const currentUser = user || sessionUser;
        checkUserAccess({
            user: currentUser!,
            workspaceId,
            permissionName: permission,
            data: data
        }).then((access) => {
            console.log('access', access);
            setHasAccess(access);
        });
    }, [user, sessionUser, permission, data]);

    return (
        <>
            {hasAccess ? props.children : props.noAccessComponent && props.noAccessComponent || ""}
        </>
    )
}
