'use server'
import {getUser} from "@/app/actions/getUser";
import {revalidatePath} from "next/cache";
import {FiltersView, IFiltersView} from "@/app/models/FiltersView";
import {List, IList} from "@/app/models/List";
import {connectMongo} from "@/app/lib/database";

export async function getFiltersView(filtersViewID: string): Promise<IFiltersView | null> {
    await connectMongo();
    console.log('getFiltersView');
    const user = await getUser();
    const filterView =  await FiltersView.findOne({_id: filtersViewID, user: user.id});
    return filterView ? filterView.toJSON() : null;
}

export async function getList(listId: string): Promise<IList | null> {
    await connectMongo();
    console.log('getList');
    const user = await getUser();
    const list =  await List.findOne({_id: listId, user: user.id});
    return list ? list.toJSON() : null;
}

export async function getFiltersViews(workspaceId: string): Promise<IFiltersView[]> {
    await connectMongo();
    console.log('getFiltersViews');
    const user = await getUser();
    if(workspaceId == 'personal') {
        const filterViews = await FiltersView.find({user: user.id, workspaceId: null});
        return filterViews.map(filterView => filterView.toJSON());
    } else {
        const filterViews = await FiltersView.find({workspace: workspaceId});
        return filterViews.map(filterView => filterView.toJSON());
    }
}

export async function getLists(workspaceId: string): Promise<IList[]> {
    await connectMongo();
    console.log('getLists');
    const user = await getUser();
    if(workspaceId == 'personal') {
        const lists = await List.find({user: user.id, workspaceId: null});
        return lists.map(list => list.toJSON());
    } else {
        const lists = await List.find({workspace: workspaceId});
        return lists.map(list => list.toJSON());
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

export async function createList(listData: Partial<IList>) {
    await connectMongo();
    console.log('createList');
    const user = await getUser();

    if(!listData.title || !listData.filters) {
        throw new Error('Title and filters are required');
    }
    const list = new List({
        user: user.id,
        title: listData.title,
        filters: listData.filters,
        workspace: user.currentSelectedWorkspace
    });

    const savedList = await list.save();
    revalidatePath(`/workspace`, 'layout');
    return {
        data: savedList.toJSON()
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

export async function updateList(listId: string, listData: Partial<IList>) {
    await connectMongo();
    console.log('updateList');
    const user = await getUser();

    if(!listData.title || !listData.filters) {
        throw new Error('Title and filters are required');
    }

    const list = await List.findOne({_id: listId, user: user.id});
    if(!list) {
        throw new Error('List not found');
    }
    list.set({
        title: listData.title,
        filters: listData.filters
    })

    const savedList = await list.save();
    revalidatePath(`/workspace`, 'layout');
    return {
        data: savedList.toJSON()
    }
}

export async function deleteFiltersViews(filterViewId: string) {
    await connectMongo();
    console.log('deleteFiltersViews');
    const user = await getUser();

    const filtersView = await FiltersView.findOne({_id: filterViewId, user: user.id});
    if(!filtersView) {
        throw new Error('Filter view not found');
    }
    await filtersView.deleteOne({_id: filterViewId});
    revalidatePath(`/websites`, 'layout');
    return {
        data: filtersView.toJSON()
    }
}

export async function deleteList(listId: string) {
    await connectMongo();
    console.log('deleteList');
    const user = await getUser();

    const list = await List.findOne({_id: listId, user: user.id});
    if(!list) {
        throw new Error('List not found');
    }
    await list.deleteOne({_id: listId});
    revalidatePath(`/workspace`, 'layout');
    return {
        data: list.toJSON()
    }
}