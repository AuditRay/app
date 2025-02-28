'use server'
import {IWebsite, IFolder, Folder, Workspace, Website, Team} from "@/app/models";
import {connectMongo} from "@/app/lib/database";
import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";

export async function getFolder(workspaceId: string, folderId: string): Promise<IFolder & {websites: IWebsite[]} | null> {
    await connectMongo();
    console.log('getFolder');
    const user = await getUser();
    if (folderId === 'all') {
        if (!workspaceId || workspaceId === 'personal') {
            const websites = await Website.find({user: user.id, workspace: null});
            return {
                id: 'all',
                name: 'All Websites',
                image: 'https://via.placeholder.com/150',
                user: '',
                fieldValues: [],
                websites: websites.map(website => website._id.toJSON()) as any
            }
        } else {
            const websites = await Website.find({workspace: workspaceId});
            return {
                id: 'all',
                name: 'All Websites',
                image: 'https://via.placeholder.com/150',
                fieldValues: [],
                user: '',
                websites: websites.map(website => website.toJSON()) as any
            }
        }
    } else {
        const folder = await Folder.findOne({_id: folderId});
        if (!folder) {
            return null;
        }
        if (!workspaceId || workspaceId === 'personal') {
            const websites = await Website.find({_id: {$in: folder.websites}, workspace: null, user: user.id});
            return folder ? {...folder.toJSON(), websites: websites.map(website => website.toJSON()) as any} : null;
        } else {
            const websites = await Website.find({_id: {$in: folder.websites}, workspace: workspaceId});
            return folder ? {...folder.toJSON(), websites: websites.map(website => website.toJSON()) as any} : null;
        }
    }
}

export async function getFolders(workspaceId: string): Promise<IFolder[]> {
    await connectMongo();
    console.log('getFolders');
    const user = await getUser();
    if (!workspaceId || workspaceId === 'personal') {
        const folders = await Folder.find({workspace: null, user: user.id});
        return folders.map(folder => folder.toJSON());
    } else {
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
        });
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        const folders = await Folder.find({workspace: workspace._id});
        return folders.map(folder => folder.toJSON());
    }
}

export async function createFolder(workspaceId: string, folderData: Partial<IFolder>) {
    await connectMongo();
    console.log('createFolder');
    const user = await getUser();
    if (!workspaceId || workspaceId === 'personal') {
        const folder = new Folder({
            name: folderData.name,
            image: folderData.image,
            user: user.id
        });

        const savedFolder = await folder.save();
        revalidatePath(`/`);
        return {
            data: savedFolder.toJSON()
        }
    } else {
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
        });
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        const folder = new Folder({
            name: folderData.name,
            image: folderData.image,
            user: user.id,
            workspace: workspace._id,
        });

        const savedFolder = await folder.save();
        revalidatePath(`/`);
        return {
            data: savedFolder.toJSON()
        }
    }
}

export async function updateFolder(workspaceId: string, folderId: string, folderData: Partial<IFolder>) {
    await connectMongo();
    console.log('updateFolder');
    const user = await getUser();
    if (!workspaceId || workspaceId === 'personal') {
        const folder = await Folder.findOne({_id: folderId, user: user.id, workspace: null});
        if (!folder) {
            throw new Error('Folder not found');
        }
        folder.set(folderData);
        const savedFolder = await folder.save();
        revalidatePath(`/`);
        return savedFolder.toJSON();
    } else {
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
        });
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        const folder = await Folder.findOne({_id: folderId, workspace: workspace._id});
        if (!folder) {
            throw new Error('Folder not found');
        }
        folder.set(folderData);
        const savedFolder = await folder.save();
        revalidatePath(`/`);
        return savedFolder.toJSON();
    }
}

export async function deleteFolder(workspaceId: string, folderId: string) {
    await connectMongo();
    console.log('deleteFolder');
    const user = await getUser();
    if (!workspaceId || workspaceId === 'personal') {
        const folder = await Folder.findOne({_id: folderId, user: user.id, workspace: null});
        if (!folder) {
            throw new Error('Folder not found');
        }
        await Folder.deleteOne({_id: folderId});
        revalidatePath(`/`);
    } else {
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            $or: [{owner: user.id}, {users: user.id}, {"members.user": user.id}]
        });
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        const folder = await Folder.findOne({_id: folderId, workspace: workspace._id});
        if (!folder) {
            throw new Error('Folder not found');
        }
        await Folder.deleteOne({_id: folderId, workspace: workspace._id});
        revalidatePath(`/`);
    }
}