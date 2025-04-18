import {IRole} from "@/app/models";
import {AdminRolePermissions} from "@/app/premissions";
import {type UserPermissions} from "@/app/premissions";
export const AdminRole = async (workspaceId: string): Promise<IRole> => {
    const permissions = await AdminRolePermissions(workspaceId);
    const userPermissions: UserPermissions = {};
    for (const permission in permissions) {
        userPermissions[permission] = permissions[permission].default;
    }
    return {
        overrideId: 'default_admin',
        id: 'default_admin',
        name: 'Admin',
        workspace: workspaceId,
        isWorkspace: true,
        permissions: userPermissions,
        isDefault: true
    }
}