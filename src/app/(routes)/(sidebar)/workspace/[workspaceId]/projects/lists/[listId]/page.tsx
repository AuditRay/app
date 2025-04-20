'use client';
import {Paper, Box} from "@mui/material";
import * as React from "react";
import Typography from "@mui/material/Typography";
import WebsitesPageList from "@/app/ui/Websites/WebsitesPageList";
import {getList} from "@/app/actions/filterViewsActions";
import DeleteListComponent from "@/app/ui/Lists/DeleteListComponent";
import {useParams} from "next/navigation";
import {IList} from "@/app/models/List";
import {LoadingScreen} from "@/components/loading-screen";

export default function List() {
    const { workspaceId, listId } = useParams<{
        workspaceId: string,
        listId: string
    }>()
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [list, setList] = React.useState<IList | null>(null);
    const loadList = async () => {
        const list = await getList(listId);
        setList(list);
        setIsLoading(false);
    }
    React.useEffect(() => {
        setIsLoading(true);
        loadList().then()
    }, []);
    return (
        <Paper
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 'xl'
            }}
        >
            {isLoading ? (
                    <Box sx={{height: '100%', pt: "20%"}}>
                        <LoadingScreen />
                    </Box>
            ) : (
                <div>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant={'h2'}>Lists - {list?.title}</Typography>
                        <DeleteListComponent listId={listId} workspaceId={workspaceId}></DeleteListComponent>
                    </Box>
                    <WebsitesPageList workspaceId={workspaceId} filterId={listId}></WebsitesPageList>
                </div>
            )}
        </Paper>
    );
}
