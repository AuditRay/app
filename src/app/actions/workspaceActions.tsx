'use server'

import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {v4 as uuid4} from "uuid";
import {IUser, IWorkspace, User, Workspace} from "@/app/models";
import {findOne} from "domutils";
import {sendEmail} from "@/app/lib/email";
// @ts-ignore

export async function setCurrentSelectedWorkspace(workspaceId?: string): Promise<IUser> {
    const user = await getUser();
    if (!workspaceId) {
        await User.updateOne({_id: user.id}, {currentSelectedWorkspace: null});
        user.currentSelectedWorkspace = '';
        return user;
    }
    const workspace = await Workspace.findOne({_id: workspaceId, owner: user.id});
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    await User.updateOne({_id: user.id}, {currentSelectedWorkspace: workspaceId});
    user.currentSelectedWorkspace = workspaceId;
    return user;
}

export async function getWorkspaces(userId?: string): Promise<IWorkspace[]> {
    if(!userId) {
        const user = await getUser();
        userId = user.id;
    }
    const workspaces = await Workspace.find({$or: [{owner: userId}, {users: userId}]});
    return workspaces.map(workspace => workspace.toJSON());
}

export async function getWorkspaceUsers(): Promise<IUser[]> {
    const user = await getUser();
    const workspaceId = user.currentSelectedWorkspace;
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (workspace) {

        console.log('.workspace.users', workspace, workspace.users);
        const users = await User.find({_id: {$in: [...workspace.users, workspace.owner]}});
        return users?.map(user => user.toJSON());
    }
    return [];
}

export async function removeUserFromWorkspace(workspaceId: string, userId: string): Promise<IWorkspace> {
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


export async function inviteWorkspaceUser(userData: {firstName: string, lastName: string, email: string}): Promise<IUser> {
    const user = await getUser();
    console.log('user', user);
    if(!user.currentSelectedWorkspace) {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }
    const workspace = await Workspace.findOne({
        _id: user.currentSelectedWorkspace,
        $or: [{owner: user.id}, {users: user.id}]
    });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    const checkUser = await User.findOne({email: userData.email});
    if (checkUser) {
        //check if use isn't already in workspace then add the user to workspace
        if (!workspace.users?.includes(checkUser.id)) {
            if (!workspace.users) {
                workspace.users = [];
            }
            workspace.users.push(checkUser.id);
            workspace.markModified('users');
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
        if (!workspace.users) {
            workspace.users = [];
        }
        workspace.users.push(savedUser.id);
        workspace.markModified('users');
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
    const user = await getUser();

    const workspace = await Workspace.findOne({ _id: workspaceId, owner: user.id });
    if(!workspace) {
        throw new Error('Workspace not found');
    }
    workspace.set("name", workspaceData.name);
    const updatedWorkspace = await workspace.save();
    revalidatePath(`/`);
    return {
        data: updatedWorkspace.toJSON()
    }
}

export async function createWorkspace(workspaceData: Partial<IWorkspace>) {
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