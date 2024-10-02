'use server'
import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {FiltersView, IFiltersView} from "@/app/models/FiltersView";
import {connectMongo} from "@/app/lib/database";

export async function getFiltersView(filtersViewID: string): Promise<IFiltersView | null> {
    await connectMongo();
    console.log('getFiltersView');
    const user = await getUser();
    const filterView =  await FiltersView.findOne({_id: filtersViewID, user: user.id});
    return filterView ? filterView.toJSON() : null;
}

export async function getFiltersViews(): Promise<IFiltersView[]> {
    await connectMongo();
    console.log('getFiltersViews');
    const user = await getUser();
    if(user.currentSelectedWorkspace) {
        const filterViews = await FiltersView.find({user: user.id, workspace: user.currentSelectedWorkspace});
        return filterViews.map(filterView => filterView.toJSON());
    } else {
        const filterViews = await FiltersView.find({user: user.id});
        return filterViews.map(filterView => filterView.toJSON());
    }
}


export async function createFiltersViews(filterData: Partial<IFiltersView>) {
    await connectMongo();
    console.log('createFiltersViews');
    const user = await getUser();

    if(!filterData.title || !filterData.filters) {
        throw new Error('Title and filters are required');
    }
    const filtersView = new FiltersView({
        user: user.id,
        title: filterData.title,
        filters: filterData.filters,
        columns: filterData.columns,
        workspace: user.currentSelectedWorkspace
    });

    const savedFiltersView = await filtersView.save();
    revalidatePath(`/websites`, 'layout');
    return {
        data: savedFiltersView.toJSON()
    }
}

export async function updateFiltersViews(filterViewId: string, filterData: Partial<IFiltersView>) {
    await connectMongo();
    console.log('updateFiltersViews');
    const user = await getUser();

    if(!filterData.title || !filterData.filters) {
        throw new Error('Title and filters are required');
    }

    const filtersView = await FiltersView.findOne({_id: filterViewId, user: user.id});
    if(!filtersView) {
        throw new Error('Filter view not found');
    }
    filtersView.set({
        title: filterData.title,
        filters: filterData.filters,
        columns: filterData.columns
    })

    const savedFiltersView = await filtersView.save();
    revalidatePath(`/websites`, 'layout');
    return {
        data: savedFiltersView.toJSON()
    }
}