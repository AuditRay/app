'use server'
import {Paper, Box} from "@mui/material";
import Link from '@/app/ui/Link';
import * as React from "react";
import AddWebsiteModal from "@/app/ui/Websites/AddWebsiteModal";
import Typography from "@mui/material/Typography";
import {getFolder, getFolders} from "@/app/actions/folderActions";
import UpdateFolderFieldValuesModal from "@/app/ui/FieldsTemplate/UpdateFolderFieldValuesModal";
import {getWorkspaceFieldTemplate} from "@/app/actions/fieldTemplateActions";
import WebsitesPageList from "@/app/ui/Websites/WebsitesPageList";

export default async function Folder(
    {searchParams, params}: {
        searchParams: Promise<Record<string, string>>,
        params: Promise<{ workspaceId: string, folderId: string }>
    }
) {
    const { workspaceId, folderId } = await params;
    const searchParamsData = await searchParams;
    const folder = await getFolder(workspaceId, folderId);
    let folderFields = [];
    const workspaceFieldTemplateData = await getWorkspaceFieldTemplate(workspaceId);
    if(folder && workspaceFieldTemplateData?.fields) {
        for (const field of workspaceFieldTemplateData.fields) {
            const fieldValue = folder.fieldValues?.find((fieldValue) => fieldValue.id === field.id);
            if(fieldValue?.value) {
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
    }
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
                    <Typography variant={'h2'}>Projects - {folder?.name}</Typography>
                    <Box sx={{ml: 'auto'}}>
                        <AddWebsiteModal workspaceId={workspaceId}></AddWebsiteModal>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography variant={'h5'}>
                        <Link href={`/workspace/${workspaceId}/projects`} color="inherit" variant="subtitle2" noWrap>
                            Back
                        </Link>
                    </Typography>
                </Box>
                {folder?.id != 'all' && workspaceFieldTemplateData.fields.length > 0 && folderFields && folderFields.length > 0 ? (
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
                ) : folder?.id != 'all' && workspaceFieldTemplateData.fields.length > 0 && (
                    <Box sx={{textAlign: 'right'}}>
                        <UpdateFolderFieldValuesModal folder={folder as any} fieldsTemplateId={workspaceFieldTemplateData.id} fieldsTemplate={workspaceFieldTemplateData}></UpdateFolderFieldValuesModal>
                    </Box>
                )}
                <WebsitesPageList workspaceId={workspaceId} folderId={folderId}></WebsitesPageList>
            </div>
        </Paper>
    );
}
