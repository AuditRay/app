import {IRole} from "@/app/models";
import {MemberRolePermissions} from "@/app/premissions";
import {UserPermissions} from "@/app/premissions";
export const MemberRole = async (workspaceId: string): Promise<IRole> => {
    const permissions = await MemberRolePermissions(workspaceId);
    const userPermissions: UserPermissions = {};
    for (const permission in permissions) {
        userPermissions[permission] = permissions[permission].default;
    }
    return {
        overrideId: 'default_member',
        id: 'default_member',
        name: 'Member',
        workspace: workspaceId,
        isWorkspace: true,
        permissions: userPermissions,
        isDefault: true
    }
}