'use client'

import * as React from 'react';
import {DataGrid, GridColDef, GridRenderCellParams, GridSlots} from '@mui/x-data-grid';
import {Box, Chip, LinearProgress, Link} from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import {IWebsiteInfo, UpdateInfo} from "@/app/models/WebsiteInfo";
import Typography from "@mui/material/Typography";
import {userSessionState} from "@/app/lib/uiStore";
import JiraTicketModal from "@/app/ui/Integration/jira/JiraTicketModal";
import Button from "@mui/material/Button";
import { useParams } from 'next/navigation'
import {jiraType} from "@/app/models";

export type WebsiteInfoRow = Partial<UpdateInfo>
const columns: GridColDef[] = [
    { field: 'type', headerName: 'Status', flex: 1,
        valueGetter: (value: WebsiteInfoRow['type']) => {
            if (value === 'CURRENT') {
                return 'Up to Date'
            } else if (value === 'NOT_CURRENT') {
                return 'Needs Update'
            } else if (value === 'NOT_SUPPORTED') {
                return 'Not Supported'
            } else if (value === 'REVOKED') {
                return 'Revoked'
            } else if (value === 'NOT_SECURE') {
                return 'Not Secure'
            } else {
                return 'Unknown'
            }
        },
        renderCell: (params: GridRenderCellParams<WebsiteInfoRow, string>) => {
            if (params.value === 'Up to Date') {
                return <Box sx={{color: 'green'}}>Up to Date</Box>
            } else if (params.value === 'Needs Update') {
                return <Box sx={{color: 'orange'}}>Needs Update</Box>
            } else if (params.value === 'Not Supported') {
                return <Box sx={{color: 'darkkhaki'}}>Not Supported</Box>
            } else if (params.value === 'Revoked') {
                return <Box sx={{color: 'brown'}}>Revoked</Box>
            } else if (params.value === 'Not Secure') {
                return <Box sx={{color: 'red'}}>Not Secure</Box>
            } else {
                return <Box sx={{color: 'yellowgreen'}}>Unknown</Box>
            }
        }
    },
    { field: 'current_version', headerName: 'Current Version',  flex: 1},
    { field: 'latest_version', headerName: 'Latest Version',  flex: 1},
    { field: 'recommended_version', headerName: 'Recommended Version',  flex: 1},
];


export default function ComponentInfo(
    props: {
        component: WebsiteInfoRow,
        websiteInfo: {
            websiteName: string;
            websiteUrl: string;
            frameworkVersion: string;
            frameworkType: string;
        }
    }
) {
    const [open, setOpen] = React.useState(false);
    const params = useParams<{ workspaceId: string; }>()
    const [jiraIntegration, setJiraIntegration] = React.useState<jiraType>({
        status: false,
        token: ''
    });
    const sessionUser = userSessionState((state) => state.fullUser);

    React.useEffect(() => {
        const currentWorkspace = sessionUser?.workspaces?.find(workspace => workspace.id === params.workspaceId);
        if (currentWorkspace){
            setJiraIntegration(currentWorkspace.jira || {status: false, token: ''});
        }
    }, [params.workspaceId, sessionUser]);
    return (
        <div style={{ width: '100%', marginTop: '10px' }}>
            <DataGrid
                slots={{
                    loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                }}
                rows={[props.component]}
                getRowId={(row) => row.name}
                columns={columns}
                rowSelection={false}
                hideFooter={true}
                hideFooterPagination={true}
                autosizeOptions={{
                    includeHeaders: true,
                    includeOutliers: true,
                    outliersFactor: 1,
                    expand: true
                }}
            />
            {jiraIntegration.status && (
                <Box sx={{mt: 2}}>
                    <Button onClick={() => setOpen(true)} variant={"contained"}>
                        Create Jira Issue
                    </Button>
                    <JiraTicketModal open={open} setOpen={setOpen} context={{
                        component: props.component,
                        websiteInfo: props.websiteInfo
                    }}/>
                </Box>
            )}
            <Box>
                {(props.component.recommended_version != props.component.current_version ||  props.component.latest_version != props.component.current_version) && (
                    <h3>Update Helper</h3>
                )}
                {props.component.recommended_version != props.component.current_version && (
                    <>
                    <Typography variant={'body1'}>
                        To upgrade this module to recommended version {props.component.name}@<b>{props.component.recommended_version}</b>, you can use the following command in your terminal.
                        Please make sure you are in the root directory of your Drupal project.
                    </Typography>
                    <Typography sx={{backgroundColor: 'black', color: '#0FFF50', fontWeight: 'bold', padding: 2, mb: 3}}>
                        composer update drupal/{props.component.name}:^{props.component.recommended_version} --with-dependencies
                    </Typography>
                    </>
                )}

                {props.component.recommended_version != props.component.latest_version && (
                    <>
                        <Typography variant={'caption'} sx={{color: 'orange'}}>
                            It seems there is a newer version available. You can upgrade to the latest version by using the following command.
                        </Typography>
                        <Typography variant={'body1'}>
                            To upgrade this module to the latest version {props.component.name}@<b>{props.component.latest_version}</b>,
                            you can use the following command in your terminal.
                            Please make sure you are in the root directory of your Drupal project.
                        </Typography>
                        <Typography sx={{backgroundColor: 'black', color: '#0FFF50', fontWeight: 'bold', padding: 2, mb:3}}>
                            composer update drupal/{props.component.name}:^{props.component.latest_version} --with-dependencies
                        </Typography>
                    </>
                )}
            </Box>
            {props.component.available_releases && props.component.available_releases.length > 0 && (
                <Box>
                    <h3>Available Releases</h3>
                    <ul>
                        {props.component.available_releases.map((release, idx) => {
                            return (
                                <li key={idx}>
                                    {release.version}
                                    {release.version === props.component.current_version && (
                                        <Chip color={'primary'} label="Current Version" sx={{mx: 1}}/>
                                    )}
                                    {release.attributes?.security && (
                                        <Box sx={{fontSize: '10px', color: release.attributes.security.includes("not covered") ? 'red' : 'green'}}>
                                            {release.attributes.security}
                                        </Box>
                                    )}
                                    <Box sx={{fontSize: '12px', mb: 2}}>
                                        {release.attributes?.terms && Object.entries(release.attributes.terms).map(([key, value]) => {
                                            return (
                                                <span key={key}>
                                                    {key}: {value.join(', ')}
                                                </span>
                                            )
                                        })}
                                    </Box>
                                </li>
                            )
                        })}
                    </ul>
                </Box>
            )}
        </div>
    );
}