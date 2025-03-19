'use client'
import {Paper, Box} from "@mui/material";
import Link from '@/app/ui/Link';
import * as React from "react";
import AddWebsiteModal from "@/app/ui/Websites/AddWebsiteModal";
import Typography from "@mui/material/Typography";
import {getFolder, getFolders} from "@/app/actions/folderActions";
import UpdateFolderFieldValuesModal from "@/app/ui/FieldsTemplate/UpdateFolderFieldValuesModal";
import {getWorkspaceFieldTemplate} from "@/app/actions/fieldTemplateActions";
import WebsitesPageList from "@/app/ui/Websites/WebsitesPageList";
import {useParams} from "next/navigation";
import {IFolder} from "@/app/models";
import {IWebsitePage, Pagination} from "@/app/actions/websiteActions";
import {LoadingScreen} from "@/components/loading-screen";

export default function Folder() {
    const urlParams = useParams<{
        workspaceId: string,
        folderId?: string,
        viewId?: string
    }>()
    const [folder, setFolder] = React.useState<IFolder & {websitesList: IWebsitePage[], pagination: Pagination} | null>();
    const [folderId, setFolderId] = React.useState<string>('');
    const [workspaceId, setWorkspaceId] = React.useState<string>('');
    const [workspaceFieldTemplateData, setWorkspaceFieldTemplateData] = React.useState<any>();
    const [folderFields, setFolderFields] = React.useState<any[]>();
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

    const load = async () => {
        const {workspaceId, folderId} = urlParams;
        if (!workspaceId || !folderId)  return;
        const folder = await getFolder(workspaceId, folderId);
        setFolderId(folderId);
        setFolder(folder);
        setWorkspaceId(workspaceId);
        let folderFields = [];
        const workspaceFieldTemplateData = await getWorkspaceFieldTemplate(workspaceId);
        if (folder && workspaceFieldTemplateData?.fields) {
            setWorkspaceFieldTemplateData(workspaceFieldTemplateData);
            for (const field of workspaceFieldTemplateData.fields) {
                const fieldValue = folder.fieldValues?.find((fieldValue) => fieldValue.id === field.id);
                if (fieldValue?.value) {
                    folderFields.push({
                        ...field,
                        value: fieldValue?.value
                    });
                } else {
                    folderFields.push({
                        ...field,
                        value: 'N/A'
                    });
                }
            }
            setFolderFields(folderFields);
        }
    }
    React.useEffect(() => {
        load().then(() => setIsLoaded(true));
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
            {!isLoaded ? (
                <Box sx={{height: '100%', pt: "20%"}}>
                    <LoadingScreen />
                </Box>
            ) : (
                <div>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant={'h2'}>Projects - {folder?.name}</Typography>
                        <Box sx={{ml: 'auto'}}>
                            <AddWebsiteModal workspaceId={workspaceId}></AddWebsiteModal>
                        </Box>
                    </Box>
                    {folder?.id != 'all' && workspaceFieldTemplateData && workspaceFieldTemplateData.fields.length > 0 && folderFields && folderFields.length > 0 ? (
                        <>
                            <Box sx={{mt: 2}}>
                                {folderFields.map((field) => (
                                    // print as field label: value
                                    <Typography key={field.id} variant={'body1'}>
                                        {field.title}: {field.value}
                                    </Typography>
                                ))}
                            </Box>
                            <Box sx={{textAlign: 'right'}}>
                                <UpdateFolderFieldValuesModal folder={folder as any} fieldsTemplateId={workspaceFieldTemplateData.id} fieldsTemplate={workspaceFieldTemplateData}></UpdateFolderFieldValuesModal>
                            </Box>
                        </>
                    ) : folder?.id != 'all' && workspaceFieldTemplateData && workspaceFieldTemplateData.fields.length > 0 && (
                        <Box sx={{textAlign: 'right'}}>
                            <UpdateFolderFieldValuesModal folder={folder as any} fieldsTemplateId={workspaceFieldTemplateData.id} fieldsTemplate={workspaceFieldTemplateData}></UpdateFolderFieldValuesModal>
                        </Box>
                    )}
                    <WebsitesPageList workspaceId={workspaceId} folderId={folderId}></WebsitesPageList>
                </div>
                )}
        </Paper>
    );
}
