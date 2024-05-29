'use server'
import {Website} from "@/app/models/Website";
import {getUser} from "@/app/actions/getUser";
import {DefaultView, IWebsiteView, WebsiteView} from "@/app/models/WebsiteView";
import {revalidatePath} from "next/cache";
// @ts-ignore

export async function deleteWebsiteView(viewId) {
    const user = await getUser();
    if (!user) {
        throw new Error('User not found');
    }
    const view = await WebsiteView.findOne({ _id: viewId });
    if(!view) {
        throw new Error('View not found');
    }

    const savedDataSource = await WebsiteView.deleteOne({ _id: viewId });
    revalidatePath(`/website/${view.website}`);
    return {
        data: view.toJSON()
    }
}


export async function updateWebsiteView(view: DefaultView, viewData: Partial<IWebsiteView>) {
    const user = await getUser();
    console.log('user', user);
    if(view.isDefault) {
        throw new Error('Cannot update default view');
    }
    const websiteView = await WebsiteView.findOne({ _id: view.id });
    if(!websiteView) {
        throw new Error('View not found');
    }
    if(!viewData.title || !viewData.dataSources) {
        throw new Error('Title and dataSources are required');
    }
    websiteView.title = viewData.title;
    websiteView.dataSources = viewData.dataSources;
    const savedDataSource = await websiteView.save();
    revalidatePath(`/website/${websiteView.website}`);
    return {
        data: savedDataSource.toJSON()
    }
}

export async function createWebsiteView(websiteId: string, viewData: Partial<IWebsiteView>) {
    const user = await getUser();
    console.log('user', user);
    const website = await Website.findOne({ _id: websiteId });
    if (!website) {
        throw new Error('Website not found');
    }
    if(!viewData.title || !viewData.dataSources) {
        throw new Error('Title and dataSources are required');
    }
    const view = new WebsiteView({
        website: websiteId,
        user: user.id,
        weight: 2,
        enabled: true,
        title: viewData.title,
        dataSources: viewData.dataSources,
    });

    const savedDataSource = await view.save();
    revalidatePath(`/website/${websiteId}`);
    return {
        data: savedDataSource.toJSON()
    }
}