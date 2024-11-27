'use server'

import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {v4 as uuid4} from "uuid";
import {IMemberPopulated, IRole, IUser, IWorkspace, IWorkspacePopulated, User, Website, Workspace} from "@/app/models";
import {sendEmail} from "@/app/lib/email";
import {getWorkspaceRoles} from "@/app/actions/rolesActions";
import {connectMongo} from "@/app/lib/database";
import {convertHtmlToSchema} from "@/app/lib/utils";
import {getWebsitesTable, WebsiteStatistics} from "@/app/actions/websiteActions";
import {IAlertInfo} from "@/app/models/AlertInfo";
import {getAlertInfo} from "@/app/actions/alertsActions";

export type workspaceDashboardReturn = {
    workspace: IWorkspace;
    statistics: WebsiteStatistics;
    alerts: IAlertInfo[];
};
export async function getWorkspacesDashboard(): Promise<workspaceDashboardReturn[]> {
    await connectMongo();
    console.log('getWorkspacesDashboard');
    const user = await getUser();
    const workspaces = await Workspace.find({$or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]});
    const workspacesData: {
        workspace: IWorkspace;
        statistics: WebsiteStatistics;
        alerts: IAlertInfo[];
    }[] = [];
    for (const workspace of workspaces) {
        const websiteTableData = await getWebsitesTable(workspace.id)
        const alertInfo = await getAlertInfo(workspace.id);
        workspacesData.push({
            workspace: workspace.toJSON(),
            statistics: websiteTableData.statistics,
            alerts: alertInfo.slice(0, 5)
        })
    }

    return workspacesData;
}

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

export async function disconnectJiraToken(workspaceId: string): Promise<IWorkspace['jira']> {
    await connectMongo();
    console.log('disconnectJiraToken');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    workspace.jira = {
        status: false,
        token: '',
        refreshToken: ''
    }
    workspace.markModified('jira');
    await workspace.save();
    return workspace.jira;
}

export async function updateJiraToken(workspaceId: string): Promise<IWorkspace['jira']> {
    await connectMongo();
    console.log('updateJiraToken');
    const workspace = await Workspace.findOne({_id: workspaceId});
    if (!workspace) {
        throw new Error('Workspace not found');
    }
    if(workspace.jira) {
        const rawResponse =  await fetch('https://auth.atlassian.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "grant_type": "refresh_token",
                "client_id": "O7gNWsjkktg2YsCjQAFysD3ZZF5yH3aq",
                "client_secret": "ATOApFPc4FfNrEt36ecK7VONa7Js5gB4FghLiBJiVFsB6UCyfXn2JVmai2L2iQtFLfrk9496313A",
                "refresh_token": workspace.jira.refreshToken,
            })
        })
        const response: {
            access_token: string;
            expires_in: number;
            scope: string;
            refresh_token: string;
        } = await rawResponse.json();
        workspace.jira.token = response.access_token;
        workspace.jira.refreshToken = response.refresh_token
        workspace.jira.status = true;
        workspace.markModified('jira');
        await workspace.save();
    }
    return workspace.jira;
}

export async function getJiraResources(currentWorkspaceId: string): Promise<any> {
    await connectMongo();
    console.log('getJiraResources');
    const updateToken = await updateJiraToken(currentWorkspaceId);
    const rawResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    const response = await rawResponse.json();
    console.log('response', response);
    return response;
}

export async function getJiraProjects(currentWorkspaceId: string, jiraResourceId: string): Promise<any> {
    await connectMongo();
    console.log('getJiraProjects');
    const updateToken = await updateJiraToken(currentWorkspaceId);
    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/project/search`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    const response = await rawResponse.json();
    console.log('response', response);
    return response.values || [];
}

export async function getJiraUsers(currentWorkspaceId: string, jiraResourceId: string): Promise<any> {
    await connectMongo();
    console.log('getJiraUsers');
    const updateToken = await updateJiraToken(currentWorkspaceId);


    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/groupuserpicker?query=*`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    const response: {
        users?: {
            users: {
              accountId: string;
              accountType: string;
              html: string;
              displayName: string;
            }[];
            total: number;
            header: string;
        }
    } = await rawResponse.json();
    console.log('response users', response.users?.users);
    return response.users?.users.filter(user => user.accountType === 'atlassian') || [];
}

export type jiraIssueType = {
    id: string;
    iconUrl: string;
    name: string;
    subtask: boolean;
};
export async function getJiraIssues(currentWorkspaceId: string, jiraResourceId: string, projectId: string): Promise<any> {
    await connectMongo();
    console.log('getJiraIssues');
    const updateToken = await updateJiraToken(currentWorkspaceId);


    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/issuetype/project?projectId=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    const response: jiraIssueType[] = await rawResponse.json();
    console.log('response issues', response);
    return (response || []).filter(issue => !issue.subtask);
}

export async function createJiraTicket(currentWorkspaceId: string, jiraResourceId: string, newTicketData: {
    resource: string;
    project: string;
    dueDate: string;
    title?: string;
    text?: string;
    assignee?: string;
    issueType?: string;
}): Promise<any> {
    await connectMongo();
    console.log('createJiraTicket');
    const updateToken = await updateJiraToken(currentWorkspaceId);
    const rawResponseFields = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/field`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    const responseFields = await rawResponseFields.json();
    console.log('responseFields', responseFields);

    const contentSchema = convertHtmlToSchema(newTicketData.text || '<p></p>');
    console.log('contentSchema', JSON.stringify(contentSchema, null, 2));
    const bodyData: any = {
      "fields": {
        "description": contentSchema,
        "project": {
          "id": newTicketData.project
        },
        "summary": newTicketData.title,
        "duedate": newTicketData.dueDate
      },
      "update": {}
    };
    if(newTicketData.assignee) {
        bodyData.fields.assignee = {
            "accountId": newTicketData.assignee
        }
    }
    if(newTicketData.issueType) {
        bodyData.fields.issuetype = {
            "id": newTicketData.issueType
        }
    }
    console.log('bodyData', bodyData);
    const rawResponse = await fetch(`https://api.atlassian.com/ex/jira/${jiraResourceId}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${updateToken.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    })

    const response = await rawResponse.json();
    console.log('response', response, updateToken);
    return response;
}

export async function getWorkspaceMembers(workspaceId: string): Promise<IMemberPopulated[]> {
    await connectMongo();
    console.log('getWorkspaceMembers');
    const user = await getUser();
    if(!user) {
        throw new Error('User not found');
    }
    if(workspaceId == 'personal') {
        throw new Error('Workspace not selected, you can not invite users to personal workspace');
    }
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
                    const roleData = await getWorkspaceRoles(workspaceId);
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

export async function getWorkspaceUsers(workspaceId: string): Promise<IUser[]> {
    await connectMongo();
    console.log('getWorkspaceUsers');
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
    workspace.members = workspace.members?.filter(member => member.user.toString() !== userId);
    workspace.markModified('members');
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

    console.log('workspaceId', workspaceId, user.id);
    const workspace = await Workspace.findOne({ _id: workspaceId });
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