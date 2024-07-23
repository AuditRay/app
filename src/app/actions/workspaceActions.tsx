'use server'
import {IWebsite, Website} from "@/app/models/Website";
import {getUser} from "@/app/actions/getUser";
import {DefaultView, IWebsiteView, WebsiteView} from "@/app/models/WebsiteView";
import {revalidatePath} from "next/cache";
import {IWorkspace, Workspace} from "@/app/models";
// @ts-ignore

export async function getWorkspaces(userId?: string): Promise<IWorkspace[]> {
    if(!userId) {
        const user = await getUser();
        userId = user.id;
    }
    const workspaces = await Workspace.find({owner: userId});
    return workspaces.map(workspace => workspace.toJSON());
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
        owner: user.id
    });

    const savedWorkspace = await workspace.save();
    revalidatePath(`/`);
    return {
        data: savedWorkspace.toJSON()
    }
}