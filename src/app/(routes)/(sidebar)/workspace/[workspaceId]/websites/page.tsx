'use server'
import {getUser} from "@/app/actions/getUser";
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {countWebsites} from "@/app/actions/websiteActions";
import WebsitesGrid from "@/app/ui/WebsitesGrid";
import AddWebsiteModal from "@/app/ui/Websites/AddWebsiteModal";
import {getFiltersView} from "@/app/actions/filterViewsActions";
import RightDrawer from "@/app/ui/RightDrawer";
import AddNewFolderModal from "@/app/ui/Folders/AddNewFolderModal";
export default async function Websites(
    {searchParams, params}: {
        searchParams: Promise<Record<string, string>>,
        params: Promise<{ workspaceId: string }>
    }
) {
    const { workspaceId } = await params;
    const { filterView: filterViewParam } = await searchParams;
    const filterViewId = filterViewParam || '';
    const filterView = filterViewId ? await getFiltersView(filterViewId) : {title: ''};
    const websitesCount = await countWebsites(workspaceId);
    return (
        <Grid item xs={12}>
            <Paper
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: 'xl'
                }}
            >
                {websitesCount > 0 && (
                    <div>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            {filterView?.title ?
                                (<h1>Websites - {filterView.title}</h1>)
                                : (<h1>Websites List</h1>)
                            }
                            <Box sx={{ml: 'auto'}}>
                                <AddWebsiteModal workspaceId={workspaceId}></AddWebsiteModal>
                            </Box>
                            <Box>
                                <AddNewFolderModal workspaceId={workspaceId}></AddNewFolderModal>
                            </Box>
                        </Box>
                        <WebsitesGrid workspaceId={workspaceId}/>
                    </div>
                )}
                {websitesCount == 0 && (
                    <Box sx={{textAlign: 'center'}}>
                        You have no websites yet <AddWebsiteModal workspaceId={workspaceId}></AddWebsiteModal>
                    </Box>
                )}
                <RightDrawer></RightDrawer>
            </Paper>
        </Grid>
    );
}
