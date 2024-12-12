'use client'

import * as React from 'react';
import {DataGrid, GridColDef, GridRenderCellParams, GridSlots} from '@mui/x-data-grid';
import {Box, LinearProgress, Link} from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import {IWebsiteInfo, UpdateInfo} from "@/app/models/WebsiteInfo";
import useRightDrawerStore from "@/app/lib/uiStore";
import ComponentInfo from "@/app/ui/ComponentInfo";

export type WebsiteInfoRow = Partial<UpdateInfo>
const columns: GridColDef[] = [
    { field: 'title', headerName: 'Name', flex: 1},
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


export default function WebsitesInfoGrid(props: { websiteInfo: WebsiteInfoRow[], enableRightDrawer?: boolean }) {
    const openRightDrawer = useRightDrawerStore((state) => state.openRightDrawer);
    return (
        <div style={{ width: '100%' }}>
            <DataGrid
                slots={{
                    loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                }}
                loading={props.websiteInfo.length === 0}
                rows={props.websiteInfo}
                getRowId={(row) => row.name}
                columns={columns}
                rowSelection={false}
                onRowClick={(params) => {
                    console.log('props.enableRightDrawer', props.enableRightDrawer);
                    if (props.enableRightDrawer) {
                        openRightDrawer(params.row.title, <ComponentInfo component={params.row} websiteInfo={{
                            websiteName: params.row.siteName,
                            websiteUrl: params.row.url,
                            frameworkVersion: params.row.frameworkVersion?.value || 'Unknown',
                            frameworkType: params.row.type.name,
                        }} />)
                    }
                }}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 20 },
                    },
                }}
                pageSizeOptions={[5, 20]}
                autosizeOptions={{
                    includeHeaders: true,
                    includeOutliers: true,
                    outliersFactor: 1,
                    expand: true
                }}
            />
        </div>
    );
}