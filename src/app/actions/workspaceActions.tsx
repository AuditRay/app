'use server'

import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {v4 as uuid4} from "uuid";
import {
    IMemberPopulated,
    IRole,
    ITeam,
    IUser,
    IWorkspace,
    IWorkspacePopulated,
    Team,
    User,
    Workspace
} from "@/app/models";
import {findOne} from "domutils";
import {sendEmail} from "@/app/lib/email";
import {getWorkspaceRoles} from "@/app/actions/rolesActions";
import {connectMongo} from "@/app/lib/database";
// @ts-ignore

export async function setCurrentSelectedWorkspace(workspaceId?: string): Promise<IUser> {
    await connectMongo();
    console.log('setCurrentSelectedWorkspace');
    const user = await getUser();
    if (!workspaceId) {
        await User.updateOne({_id: user.id}, {currentSelectedWorkspace: null});
        user.currentSelectedWorkspace = '';
        return user;
    }
    const workspace = await Workspace.findOne({_id: workspaceId, $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]});
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    await User.updateOne({_id: user.id}, {currentSelectedWorkspace: workspaceId});
    user.currentSelectedWorkspace = workspaceId;
    return user;
}

export async function getWorkspaces(userId?: string): Promise<IWorkspace[]> {
    await connectMongo();
    console.log('getWorkspaces');
    if(!userId) {
        const user = await getUser();
        userId = user.id;
    }
    const workspaces = await Workspace.find({$or: [{owner: userId}, {users: userId}, {"members.user": userId}]});
    return workspaces.map(workspace => workspace.toJSON());
}

export async function getWorkspace(workspaceId?: string): Promise<IWorkspace> {
    await connectMongo();
    console.log('getWorkspace');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    return workspace.toJSON();
}

export async function getWorkspaceMembers(): Promise<IMemberPopulated[]> {
    await connectMongo();
    console.log('getWorkspaceMembers');
    const user = await getUser();
    if(!user) {
        throw new Error('User not found');
    }
    if(!user.currentSelectedWorkspace) {
        throw new Error('Workspace not selected');
    }
    const workspaceId = user.currentSelectedWorkspace;
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (workspace && workspace.members) {
        const workspaceOwner = (await User.findOne({_id: workspace.owner}))?.toJSON() || user;
        const members: IWorkspacePopulated['members'] = [{
            user: workspaceOwner,
            roles: [{
                id: 'owner',
                name: 'Owner',
                permissions: {},
                overrideId: "",
                workspace: workspaceId,
                isWorkspace: false
            }]
        }];
        for (const member of workspace.members) {
            const user = await User.findOne({_id: member.user});
            let roles: IRole[] = [];
            if(member.roles) {
                for (const role of member.roles) {
                    const roleData = await getWorkspaceRoles();
                    const roleObj = roleData.find(r => r.id === role);
                    if(roleObj) {
                        roles.push(roleObj);
                    }
                }
            }
            if (user) {
                members.push({
                    user: user.toJSON(),
                    roles: roles
                });
            }
        }

        return members;
    }
    return [];
}

export async function getWorkspaceUsers(): Promise<IUser[]> {
    await connectMongo();
    console.log('getWorkspaceUsers');
    const user = await getUser();
    const workspaceId = user.currentSelectedWorkspace;
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (workspace) {
        const memberUsers = workspace.members?.map(member => member.user) || [];
        const users = await User.find({_id: {$in: [...memberUsers, workspace.owner]}});
        //map users to members and roles
        return users?.map(user => user.toJSON());
    }
    return [];
}

export async function removeUserFromWorkspace(workspaceId: string, userId: string): Promise<IWorkspace> {
    await connectMongo();
    console.log('removeUserFromWorkspace');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    console.log('userId', userId);
    workspace.users = workspace.users?.filter(user => user.toString() !== userId);
    workspace.markModified('users');
    await workspace.save();
    return workspace.toJSON();
}

export async function inviteWorkspaceUser(userData: {firstName: string, lastName: string, email: string, role: string}): Promise<IUser> {
    await connectMongo();
    console.log('inviteWorkspaceUser');
    const user = await getUser();
    console.log('user', user);
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
    const checkUser = await User.findOne({email: userData.email});
    if (checkUser) {
        //check if use isn't already in workspace then add the user to workspace
        if (!workspace.members?.find(member => member.user.toString() === checkUser.id)) {
            if (!workspace.members) {
                workspace.members = [];
            }
            workspace.members.push({
                user: checkUser.id,
                roles: [userData.role]
            });
            workspace.markModified('members');
            await workspace.save();
        }
        //send email to user
        await sendEmail(
            checkUser.email,
            `You have been invited to ${workspace.name} workspace`,
            `
                <div>Hello ${checkUser.firstName} ${checkUser.lastName}</div>
                <div>You have been invited to <b>${workspace.name}</a> workspace</div>
                <div>Click on this link to open dashboard ${process.env.APP_URL}</div>
            `
        );
        return checkUser.toJSON();
    } else {
        const newUser = new User({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            currentSelectedWorkspace: user.currentSelectedWorkspace,
            inviteToken: uuid4(),
        });
        const savedUser = await newUser.save();
        if (!workspace.members) {
            workspace.members = [];
        }
        workspace.members.push({
            user: savedUser.id,
            roles: [userData.role]
        });
        workspace.markModified('members');
        await workspace.save();
        //send email to user
        await sendEmail(
            savedUser.email,
            `You have been invited to ${workspace.name} workspace`,
            `
                <div>Hello ${savedUser.firstName} ${savedUser.lastName}</div>
                <br/><br/>
                <div>You have been invited to <b>${workspace.name}</a> workspace</div>
                <div>Click on this link to join ${process.env.APP_URL}/join?inviteToken=${savedUser.inviteToken}</div>
            `
        );
        return savedUser.toJSON();
    }
}

export async function updateWorkspace(workspaceId: string, workspaceData: Partial<IWorkspace>) {
    await connectMongo();
    console.log('updateWorkspace');
    const user = await getUser();

    const workspace = await Workspace.findOne({ _id: workspaceId, owner: user.id });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    workspace.set("name", workspaceData.name || workspace.name);
    workspace.set("timezone", workspaceData.timezone || workspace.timezone);
    const updatedWorkspace = await workspace.save();
    revalidatePath(`/`);
    return {
        data: updatedWorkspace.toJSON()
    }
}

export async function createWorkspace(workspaceData: Partial<IWorkspace>) {
    await connectMongo();
    console.log('createWorkspace');
    const user = await getUser();
    const workspace = new Workspace({
        name: workspaceData.name,
        owner: user.id,
        users: [user.id]
    });

    const savedWorkspace = await workspace.save();
    revalidatePath(`/`);
    return {
        data: savedWorkspace.toJSON()
    }
}