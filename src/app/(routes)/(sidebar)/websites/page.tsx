'use server'
import {getUser} from "@/app/actions/getUser";
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {getWebsitesTable} from "@/app/actions/websiteActions";
import WebsitesGrid, {GridRow} from "@/app/ui/WebsitesGrid";
import AddWebsiteModal from "@/app/ui/AddWebsiteModal";
import {getFiltersView} from "@/app/actions/filterViewsActions";
import RightDrawer from "@/app/ui/RightDrawer";
import Typography from "@mui/material/Typography";

export default async function Websites({searchParams}: {searchParams: Record<string, string>}) {
    const user = await getUser()
    const {data: websites, extraHeaders} = await getWebsitesTable(user.id);
    console.time('Websites');
    const filterViewId = searchParams['filterView'] || '';
    const filterView = filterViewId ? await getFiltersView(filterViewId) : {title: ''};
    console.timeEnd('Websites');
    const WebsiteRows: GridRow[] = websites.map((website) => {
        const websiteData: GridRow = {
            id: website.id,
            url: website.url,
            favicon: website.favicon,
            siteName: website.title ? website.title : website.url,
            type: website.type,
            types:  website.type ? [website.type.name, ...(website.type.subTypes.map((subType) => subType.name))] : [],
            tags: website.tags || [],
            components: website.components,
            componentsNumber: website.components.length,
            componentsUpdated: website.componentsUpdated,
            componentsUpdatedNumber: website.componentsUpdated.length,
            componentsWithUpdates: website.componentsWithUpdates,
            componentsWithUpdatesNumber: website.componentsWithUpdates.length,
            componentsWithSecurityUpdates: website.componentsWithSecurityUpdates,
            componentsWithSecurityUpdatesNumber: website.componentsWithSecurityUpdates.length,
            frameWorkUpdateStatus: website.frameWorkUpdateStatus,
            frameworkVersion: website.frameworkVersion,
        }
        for (const [key, value] of Object.entries(website)) {
            if(!websiteData[key]) {
                if(typeof value === 'object') {
                    switch (value.type) {
                        case 'text':
                            websiteData[key] = value.value
                            break
                        case 'status':
                            websiteData[key] = value.status === 'success' ? "Success" : value.status === 'warning' ? "Warning" : "Error"
                            break
                        case 'version':
                            websiteData[key] = value.value
                            break
                    }
                    websiteData[`${key}_raw`] = value;
                }
            }
        }
        return websiteData;
    });

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
                {websites.length > 0 && (
                    <div>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            {filterView?.title ?
                                (<h1>Websites - {filterView.title}</h1>)
                                : (<h1>Websites List</h1>)
                            }
                            <Box sx={{ml: 'auto'}}>
                                <AddWebsiteModal></AddWebsiteModal>
                            </Box>
                        </Box>
                        <WebsitesGrid websites={WebsiteRows} extraHeader={extraHeaders}/>
                    </div>
                )}
                {websites.length == 0 && (
                    <Box sx={{textAlign: 'center'}}>
                        You have no websites yet <AddWebsiteModal></AddWebsiteModal>
                    </Box>
                )}
                <RightDrawer></RightDrawer>
            </Paper>
        </Grid>
    );
}
