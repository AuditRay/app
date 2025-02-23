'use server'
import {getUser} from "@/app/actions/getUser";
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {countWebsites} from "@/app/actions/websiteActions";
import WebsitesGrid from "@/app/ui/WebsitesGrid";
import AddWebsiteModal from "@/app/ui/Websites/AddWebsiteModal";
import {getFiltersView} from "@/app/actions/filterViewsActions";
import RightDrawer from "@/app/ui/RightDrawer";
import Typography from "@mui/material/Typography";
export default async function Websites(
    {params}: {
        params: Promise<{ workspaceId: string, viewId: string }>
    }
) {
    const { viewId, workspaceId } = await params;
    const filterView = await getFiltersView(viewId);
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
                                (<Typography variant={'h2'} >Websites - {filterView.title}</Typography>)
                                : (<Typography variant={'h2'}>Websites List</Typography>)
                            }
                            <Box sx={{ml: 'auto'}}>
                                <AddWebsiteModal workspaceId={workspaceId}></AddWebsiteModal>
                            </Box>
                        </Box>
                        <WebsitesGrid workspaceId={workspaceId} viewId={viewId}/>
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
