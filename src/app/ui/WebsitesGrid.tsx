'use client'

import * as React from 'react';
import {DataGrid, GridColDef, GridRenderCellParams, GridSlots} from '@mui/x-data-grid';
import {IWebsite} from "@/app/models/Website";
import {Box, LinearProgress, Link} from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import {fontSize} from "@mui/system";

export type GridRow = {id: number|string, favicon: string, url: string, siteName: string, type: IWebsite['type']};
const columns: GridColDef[] = [
    { field: 'siteName', headerName: 'Website Name', width: 600,
        renderCell: (params: GridRenderCellParams<GridRow, GridRow['siteName']>) => (
            params.value && (
                <>
                    <Link href={`/websites/${params.row.id}`} sx={{textDecoration: 'none', color: 'inherit'}}>
                        <Box component={'img'}  src={`${params.row.favicon}`} alt={params.value} sx={{width: '20px', verticalAlign: 'middle', mr: '10px'}} />{params.value}
                    </Link>
                    <Link href={params.row.url} target={'_blank'}>
                        <LaunchIcon fontSize={'small'} sx={{verticalAlign: 'middle', ml: '5px'}}></LaunchIcon>
                    </Link>
                </>
            )
        ),
    },
    {
        field: 'type',
        headerName: 'Type',
        width: 90,
        renderCell: (params: GridRenderCellParams<GridRow, GridRow['type']>) => (
            params.value && (
                <Box component={'div'} sx={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
                    <Box key={`${params.value.slug}-wrapper`} component={'div'} sx={{width: '20px'}}>
                        <Box component={'img'}  src={`/tech/${params.value.icon}`} alt={params.value.name} sx={{width: '100%' }} />
                    </Box>
                    {params.value.subTypes?.length > 0 && params.value.subTypes.map((subType) => (
                        <Box key={`${subType.slug}-wrapper`} component={'div'} sx={{width: '20px'}}>
                            <Box component={'img'} key={subType.slug} src={`/tech/${subType.icon}`} alt={subType.name} sx={{width: '100%' }}/>
                        </Box>
                    ))}
                </Box>
            )
        ),
    },
];


export default function WebsitesGrid(props: { websites: GridRow[] }) {
    return (
        <div style={{ width: '100%' }}>
            <DataGrid
                slots={{
                    loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                }}
                loading={props.websites.length === 0}
                rows={props.websites}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
            />
        </div>
    );
}