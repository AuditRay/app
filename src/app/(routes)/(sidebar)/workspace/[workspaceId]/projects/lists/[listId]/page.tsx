'use server'
import {Paper, Box} from "@mui/material";
import * as React from "react";
import Typography from "@mui/material/Typography";
import WebsitesPageList from "@/app/ui/Websites/WebsitesPageList";
import {getList} from "@/app/actions/filterViewsActions";
import DeleteListComponent from "@/app/ui/Lists/DeleteListComponent";

export default async function List(
    {params}: {
        params: Promise<{ workspaceId: string, listId: string }>
    }
) {
    const { workspaceId, listId } = await params;
    const list = await getList(listId);
    return (
        <Paper
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 'xl'
            }}
        >
            <div>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography variant={'h2'}>Lists - {list?.title}</Typography>
                    <DeleteListComponent listId={listId} workspaceId={workspaceId}></DeleteListComponent>
                </Box>
                <WebsitesPageList workspaceId={workspaceId} filterId={listId}></WebsitesPageList>
            </div>
        </Paper>
    );
}
