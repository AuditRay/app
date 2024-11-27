'use server'
import {ITeam, ITeamPopulated, IUser, IWebsite, Team, Workspace} from "@/app/models";
import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {connectMongo} from "@/app/lib/database";

export async function createTeam(teamData: Partial<ITeam>) {
    await connectMongo();
    console.log('createTeam');
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
    teamData.members = teamData.members?.filter((m) => m.user != '').filter((m) => m.role != '') || []
    const team = new Team({
        name: teamData.name,
        owner: user.id,
        workspace: workspace._id,
        members: [...(teamData.members || [])],
        websites: teamData.websites?.filter((w) => w != '') || []
    });

    const savedTeam = await team.save();
    revalidatePath(`/`);
    return {
        data: savedTeam.toJSON()
    }
}

export async function getTeams(workspaceId: string): Promise<ITeamPopulated[]> {
    await connectMongo();
    console.log('getTeams');
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
    const teams = await Team.find({workspace: workspace._id}).populate<{
        members: {
            user: IUser;
            role: string;
            websites?: string[];
        }
    }>({
        path:     'members',
        populate: [
            {
                path:  'user',
                model: 'User'
            },
            {
                path:  'role',
                model: 'Role'
            },
        ]
    }).populate<{
        members: {
            user: IUser;
            role: string;
            websites?: IWebsite[];
        }
    }>('websites').populate<{
        owner: IUser;
        members: {
            user: IUser;
            role: string;
            websites?: IWebsite[];
        }
    }>('owner');

    return teams.map(team => team.toJSON()) as any as ITeamPopulated[];
}

export async function getTeam(teamId: string): Promise<ITeam> {
    await connectMongo();
    console.log('getTeam');
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
    const team = await Team.findOne({workspace: workspace._id, _id: teamId});
    if(!team) {
        throw new Error('Team not found');
    }
    return team.toJSON();
}

export async function updateTeam(teamId: string, teamData: Partial<ITeam>) {
    await connectMongo();
    console.log('updateTeam');
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
    const team = await Team.findOne({workspace: workspace._id, _id: teamId});
    if(!team) {
        throw new Error('Team not found');
    }
    teamData.members = teamData.members?.filter((m) => m.user != '').filter((m) => m.role != '') || []
    team.set({
        name: teamData.name,
        members: [...(teamData.members || team.members || [])],
        websites: teamData.websites?.filter((w) => w != '') || team.websites
    });
    const savedTeam = await team.save();
    revalidatePath(`/`);
    return {
        data: savedTeam.toJSON()
    }
}

export async function deleteTeam(teamId: string) {
    await connectMongo();
    console.log('deleteTeam');
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
    const team = await Team.findOne({workspace: workspace._id, _id: teamId});
    if(!team) {
        throw new Error('Team not found');
    }
    await Team.deleteOne({workspace: workspace._id, _id: teamId});
    revalidatePath(`/`);
    return {
        data: team.toJSON()
    }
}

export async function getUserTeams(userId: string, workspaceId: string): Promise<ITeam[]> {
    await connectMongo();
    console.log('getUserTeams');
    const teams = await Team.find({workspace: workspaceId, members: { $elemMatch: { user: userId } }});
    return teams.map(team => team.toJSON());
}