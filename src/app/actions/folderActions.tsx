'use server'
import {IWebsite, IFolder, Folder, Workspace, Website, Team} from "@/app/models";
import {connectMongo} from "@/app/lib/database";
import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {getWebsitesPage, IWebsitePage, Pagination} from "@/app/actions/websiteActions";
import {GridPaginationModel} from "@mui/x-data-grid-pro";

export async function getWebsiteFolders(workspaceId: string, websiteId: string): Promise<IFolder[]> {
    await connectMongo();
    console.log('getWebsiteFolders');
    if (!workspaceId || workspaceId === 'personal') {
        const folders = await Folder.find({
            workspace: null,
            websites: websiteId
        });
        return folders.length ? folders.map(folder => folder.toJSON()) : [{
            id: 'all',
            name: 'All',
            image: 'https://via.placeholder.com/150',
            user: '',
            fieldValues: [],
        }]
    } else {
        const folders = await Folder.find({
            workspace: workspaceId,
            websites: websiteId
        });
        return folders.length ? folders.map(folder => folder.toJSON()) : [{
            id: 'all',
            name: 'All',
            image: 'https://via.placeholder.com/150',
            user: '',
            fieldValues: [],
        }]
    }
}

export async function getFolderInfo(
    workspaceId: string,
    folderId: string
): Promise<IFolder | null> {
    await connectMongo();
    console.log('getFolderInfo');
    if (folderId === 'all') {
        return {
            id: 'all',
            name: 'All',
            image: 'https://via.placeholder.com/150',
            user: '',
            fieldValues: [],
        }
    } else {
        const folder = await Folder.findOne({_id: folderId, workspace: workspaceId});
        return folder ? folder.toJSON() : null;
    }
}

export async function getFolder(
    workspaceId: string,
    folderId: string,
    pagination: GridPaginationModel = { page: 0, pageSize: 12 },
    filters: {
        text?: string;
        name?: string;
        type?: string[];
        folder?: string[];
        team?: string[];
        tags?: string[];
        status?: string[];
    } = {},
    sort: {
        field: string;
        sort: 'asc' | 'desc';
    } = {field: 'updatedAt', sort: 'desc'}
): Promise<IFolder & {websitesList: IWebsitePage[], pagination: Pagination} | null> {
    await connectMongo();
    console.log('getFolder');
    const user = await getUser();
    if (folderId === 'all') {
        if (!workspaceId || workspaceId === 'personal') {
            const websites = await getWebsitesPage(workspaceId, undefined, pagination, filters, sort);
            return {
                id: 'all',
                name: 'All',
                image: 'https://via.placeholder.com/150',
                user: '',
                fieldValues: [],
                websitesList: websites.data,
                pagination: websites.pagination
            }
        } else {
            const websites = await getWebsitesPage(workspaceId, undefined, pagination, filters, sort);
            return {
                id: 'all',
                name: 'All',
                image: 'https://via.placeholder.com/150',
                fieldValues: [],
                user: '',
                websitesList: websites.data,
                pagination: websites.pagination
            }
        }
    } else {
        const folder = await Folder.findOne({_id: folderId});
        if (!folder) {
            return null;
        }
        if (!workspaceId || workspaceId === 'personal') {
            const websites = await getWebsitesPage(workspaceId, folder.websites, pagination, filters, sort);
            return folder ? {...folder.toJSON(), websitesList: websites.data, pagination: websites.pagination} : null;
        } else {
            const websites = await getWebsitesPage(workspaceId, folder.websites, pagination, filters, sort);
            return folder ? {...folder.toJSON(), websitesList: websites.data, pagination: websites.pagination} : null;
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