'use client'
import {getUser} from "@/app/actions/getUser";
import {Grid2 as Grid, Paper, Box, Card, Tooltip, Stack} from "@mui/material";
import Link from '@/app/ui/Link';
import { Image } from "@/components/image";
import * as React from "react";
import {countWebsites} from "@/app/actions/websiteActions";
import WebsitesGrid from "@/app/ui/WebsitesGrid";
import AddWebsiteModal from "@/app/ui/Websites/AddWebsiteModal";
import {getFiltersView} from "@/app/actions/filterViewsActions";
import RightDrawer from "@/app/ui/RightDrawer";
import AddNewFolderModal from "@/app/ui/Folders/AddNewFolderModal";
import Typography from "@mui/material/Typography";
import {getFolders} from "@/app/actions/folderActions";
import { fabClasses } from '@mui/material/Fab';
import {useTheme} from "@mui/material/styles";
import FolderComponent from "@/app/ui/Folders/FolderComponent";
import {useUserStateStore} from "@/providers/user-store-provider";
import {useParams} from "next/navigation";
import {IFolder} from "@/app/models";
import {LoadingScreen} from "@/components/loading-screen";
export default function Websites() {
    const { workspaceId } = useParams<{
        workspaceId: string
    }>()
    const [folders, setFolders] = React.useState<IFolder[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const userWorkspaceRole = useUserStateStore((state) => state.sessionUserWorkspaceRole);
    const load = async () => {
        const folders = await getFolders(workspaceId);
        setFolders(folders);
        setIsLoading(false);
    }
    React.useEffect(() => {
        setIsLoading(true);
        load().then();
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
                        <Typography variant={'h2'}>Projects</Typography>
                        {userWorkspaceRole?.isAdmin || userWorkspaceRole?.isOwner ? (
                            <>
                                <Box sx={{ml: 'auto'}}>
                                    <AddWebsiteModal workspaceId={workspaceId}></AddWebsiteModal>
                                </Box>
                                <Box sx={{ml: 2}}>
                                    <AddNewFolderModal workspaceId={workspaceId}></AddNewFolderModal>
                                </Box>
                            </>
                        ) : null}
                    </Box>
                    <Grid container spacing={2} sx={{mt: 5}}>
                        <Grid size={{
                            xs: 12,
                            md: 3
                        }}>
                            <Card
                                sx={{
                                    '&:hover': {
                                        'backgroundColor': '#eaedef',
                                        "a": {
                                            'textDecoration': 'none'
                                        }
                                    },
                                    'backgroundColor': '#DFE3E8'
                                }}
                            >
                                <Link href={`/workspace/${workspaceId}/projects/folder/all`} color="inherit" variant="subtitle2" noWrap>
                                    <Box sx={{ position: 'relative', p: 1 }}>
                                        <Tooltip title={'All Websites'} placement="bottom-end">
                                            <Image
                                                alt={'All'}
                                                src={'/assets/all_folder.png'}
                                                ratio="1/1"
                                                sx={{ borderRadius: 1.5, p: 2 }}
                                            />
                                        </Tooltip>
                                    </Box>
                                    <Stack spacing={2.5} sx={{ p: 3, pt: 2, textAlign: 'center' }}>
                                            All
                                    </Stack>
                                </Link>
                            </Card>
                        </Grid>

                        {folders.length > 0 && folders.map((folder, index) => (
                            <Grid size={{
                                xs: 12,
                                md: 3
                            }} key={`folder-${index}`}>
                                <FolderComponent folder={folder} workspaceId={workspaceId}></FolderComponent>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            )}
        </Paper>
    );
}
