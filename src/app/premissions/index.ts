import {IUser} from "@/app/models";
import {buildWorkspaceBasePermissions, type Permissions, PermissionsKeys} from "./BasePermissions";
import {getFullUser} from "@/app/actions/getUser";
import {handlers} from "@/app/premissions/handlers";

export * from './BasePermissions';

export type PermissionArgs = {
    user: IUser;
    permissionName: PermissionsKeys;
    data?: any;
};

export type UserPermissions = Record<PermissionsKeys, boolean>

const getUserPermissions = async (user: IUser): Promise<UserPermissions> => {
    console.log("getUserPermissions");
    const permissions = await buildWorkspaceBasePermissions();
    const userPermissions: UserPermissions = {};
    for (const permission in permissions) {
        userPermissions[permission] = permissions[permission].default;
    }
    console.log('user.roles', user.roles);
    // team roles false should override true
    user.roles?.forEach(role => {
        if (!role.isWorkspace) {
            Object.keys(role.permissions).forEach(permission => {
                userPermissions[permission] = role.permissions[permission];
            });
        }
    });
    // workspace roles should override team roles
    user.roles?.forEach(role => {
        if (role.isWorkspace) {
            Object.keys(role.permissions).forEach(permission => {
                userPermissions[permission] = role.permissions[permission];
            });
        }
    });

    return userPermissions;
}

export const checkUserAccess = async (args: PermissionArgs) => {
    const {user, permissionName} = args;
    const fullUser = await getFullUser(user.id) || user;
    const userPermissions = await getUserPermissions(fullUser);
    console.log('userPermissions', userPermissions);
    if(handlers[permissionName]) {
        return handlers[permissionName](args, userPermissions, fullUser);
    }
    return userPermissions[permissionName];
}
