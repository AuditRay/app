'use server'
import {IRole, Role, Workspace} from "@/app/models";
import {getUser} from "@/app/actions/getUser";
import {AdminRole} from "@/app/premissions/roles/Admin";
import {MemberRole} from "@/app/premissions/roles/Member";
import {connectMongo} from "@/app/lib/database";

export async function createRole(roleData: Partial<IRole>) {
    await connectMongo();
    console.log('createRole');
    const user = await getUser();
    if(!user.currentSelectedWorkspace) {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }
    const workspace = await Workspace.findOne({
        _id: user.currentSelectedWorkspace,
        $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }

    const role = new Role({
        name: roleData.name,
        workspace: workspace._id,
        isWorkspace: roleData.isWorkspace || false,
        permissions: roleData.permissions || []
    });

    const savedRole = await role.save();
    return {
        data: savedRole.toJSON()
    }
}

export async function getWorkspaceAllRoles(workspaceId: string): Promise<IRole[]> {
    await connectMongo();
    console.log('getWorkspaceAllRoles');
    const user = await getUser();
    if(workspaceId == 'personal') {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    let roles = await Role.find({workspace: workspace._id});
    const adminRole = await AdminRole(workspace._id.toString());
    const memberRole = await MemberRole(workspace._id.toString());
    const memberOverride = roles.find((role) => role.overrideId == 'default_member');
    memberRole.permissions = memberOverride?.permissions || memberRole.permissions;
    roles = roles.filter((role) => role.overrideId != 'default_member');
    return [
        adminRole,
        memberRole,
        ...roles.map(role => role.toJSON())
    ];
}

export async function getWorkspaceRoles(workspaceId: string): Promise<IRole[]> {
    await connectMongo();
    console.log('getWorkspaceRoles');
    console.log('workspaceId', workspaceId);
    const user = await getUser();
    if(workspaceId == 'personal') {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    let roles = await Role.find({workspace: workspace._id, isWorkspace: true});
    const adminRole = await AdminRole(workspace._id.toString());
    const memberRole = await MemberRole(workspace._id.toString());
    const memberOverride = roles.find((role) => role.overrideId == 'default_member');
    memberRole.permissions = memberOverride?.permissions || memberRole.permissions;
    roles = roles.filter((role) => role.overrideId != 'default_member');
    return [
        adminRole,
        memberRole,
        ...roles.map(role => role.toJSON())
    ];
}

export async function getWorkspaceTeamRoles(workspaceId: string): Promise<IRole[]> {
    await connectMongo();
    console.log('getWorkspaceTeamRoles');
    const user = await getUser();
    if(workspaceId == 'personal') {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }

    const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    let roles = await Role.find({workspace: workspace._id, isWorkspace: false});
    return [
        ...roles.map(role => role.toJSON())
    ];
}

export async function deleteRole(roleId: string) {
    await connectMongo();
    console.log('deleteRole');
    const user = await getUser();
    if(!user.currentSelectedWorkspace) {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }

    const workspace = await Workspace.findOne({
        _id: user.currentSelectedWorkspace,
        $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    await Role.deleteOne({_id: roleId});
}

export async function updateRole(roleId: string, roleData: Partial<IRole>) {
    await connectMongo();
    console.log('updateRole');
    const user = await getUser();

    if(!user.currentSelectedWorkspace) {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }

    const workspace = await Workspace.findOne({
        _id: user.currentSelectedWorkspace,
        $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    if (roleId === "default_member") {
        const role = await Role.findOne({workspace: workspace._id, overrideId: roleId});
        if (!role) {
            //create default member role
            const memberRole = new Role({
                name: 'Member',
                overrideId: 'default_member',
                workspace: workspace._id,
                isWorkspace: true,
                isDefault: false,
                permissions: roleData.permissions
            })

            const savedRole = await memberRole.save();
            console.log('savedRole', savedRole.toJSON());
            return {
                data: savedRole.toJSON()
            }
        } else {
            role.set({
                isDefault: false,
                permissions: roleData.permissions || role.permissions
            });
            const savedRole = await role.save();
            return {
                data: savedRole.toJSON()
            }
        }
    } else {
        const role = await Role.findOne({workspace: workspace._id, _id: roleId});
        if (!role) {
            throw new Error('Role not found');
        }

        role.set({
            name: roleData.name,
            isDefault: false,
            isWorkspace: !!roleData.isWorkspace,
            permissions: roleData.permissions || role.permissions
        });

        role.markModified('permissions');
        const savedRole = await role.save();
        console.log('savedRole', savedRole.toJSON());
        return {
            data: savedRole.toJSON()
        }
    }
}

export async function getRole(roleId: string): Promise<IRole> {
    await connectMongo();
    console.log('getRole');
    const user = await getUser();
    if(!user.currentSelectedWorkspace) {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }

    const workspace = await Workspace.findOne({
        _id: user.currentSelectedWorkspace,
        $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    const role = await Role.findOne({workspace: workspace._id, _id: roleId});
    if(!role) {
        throw new Error('Role not found');
    }
    return role.toJSON();
}

