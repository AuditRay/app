'use server'
import {getUser} from "@/app/actions/getUser";
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {countWebsites} from "@/app/actions/websiteActions";
import WebsitesGrid from "@/app/ui/WebsitesGrid";
import AddWebsiteModal from "@/app/ui/Websites/AddWebsiteModal";
import {getFiltersView} from "@/app/actions/filterViewsActions";
import RightDrawer from "@/app/ui/RightDrawer";
export default async function Websites(
    {params}: {
        params: { workspaceId: string, viewId: string }
    }
) {
    const filterView = await getFiltersView(params.viewId);
    const websitesCount = await countWebsites(params.workspaceId);
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
                                <AddWebsiteModal workspaceId={params.workspaceId}></AddWebsiteModal>
                            </Box>
                        </Box>
                        <WebsitesGrid workspaceId={params.workspaceId} viewId={params.viewId}/>
                    </div>
                )}
                {websitesCount == 0 && (
                    <Box sx={{textAlign: 'center'}}>
                        You have no websites yet <AddWebsiteModal workspaceId={params.workspaceId}></AddWebsiteModal>
                    </Box>
                )}
                <RightDrawer></RightDrawer>
            </Paper>
        </Grid>
    );
}
