'use server'
import {getUser} from "@/app/actions/getUser";
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {getWebsites} from "@/app/actions/websiteActions";
import WebsitesGrid, {GridRow} from "@/app/ui/WebsitesGrid";
import AddWebsiteModal from "@/app/ui/AddWebsiteModal";

export default async function Home() {
    const user = await getUser()
    const websites = await getWebsites(user.id);
    const WebsiteRows: GridRow[] = websites.map((website) => {
        return {
            id: website.id,
            url: website.url,
            favicon: website.favicon,
            siteName: website.title ? website.title : website.url,
            type: website.type,
        }
    });

    return (
        <Grid item xs={12}>
            <Paper
                sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                }}
            >
                {websites.length > 0 && (
                    <div>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <h1>Your Websites</h1>
                            <Box sx={{ml: 'auto'}}>
                                <AddWebsiteModal></AddWebsiteModal>
                            </Box>
                        </Box>
                        <WebsitesGrid websites={WebsiteRows}/>
                    </div>
                )}
                {websites.length == 0 && (
                    <Box sx={{textAlign: 'center'}}>
                        You have no websites yet <AddWebsiteModal></AddWebsiteModal>
                    </Box>
                )}
            </Paper>
        </Grid>
    );
}
