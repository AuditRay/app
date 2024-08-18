import {IRole} from "@/app/models";
import {MemberRolePermissions} from "@/app/premissions";
import {UserPermissions} from "@/app/premissions";
export const MemberRole = async (): Promise<IRole> => {
    const permissions = await MemberRolePermissions();
    const userPermissions: UserPermissions = {};
    for (const permission in permissions) {
        userPermissions[permission] = permissions[permission].default;
    }
    return {
        overrideId: 'default_admin',
        id: 'default_member',
        name: 'Member',
        workspace: '',
        isWorkspace: true,
        permissions: userPermissions,
        isDefault: true
    }
}