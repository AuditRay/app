'use client'

import * as React from 'react';
import {DataGrid, GridColDef, GridRenderCellParams, GridSlots} from '@mui/x-data-grid';
import {IWebsite} from "@/app/models/Website";
import {Box, lighten, LinearProgress, Link} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import {color, fontSize} from "@mui/system";
import {DataSources} from "@/app/models/WebsiteInfo";
import ViewItem from "@/app/ui/ViewItem";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import {styled} from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export type GridRow = DataSources['data'][0];
const columns = (viewDetails: (data: GridRow) => void): GridColDef[] => {
    return [
        { field: 'detailsTitle', headerName: 'Message', width: 600},
        {
            field: 'details',
            headerName: 'Details',
            width: 90,
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['detailsTitle']>) => (
                <Link onClick={() => viewDetails(params.row)} sx={{cursor: 'pointer'}}>
                    <InfoIcon />
                </Link>
            )
        },
    ];
}


const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    '& .status-fail': {
        backgroundColor: lighten('rgb(255,0,0)', 0.7),
        '&:hover': {
            backgroundColor: lighten('rgb(255,0,0)', 0.6),
        },
        '&.Mui-selected': {
            backgroundColor: lighten('rgb(255,0,0)', 0.5),
            '&:hover': {
                backgroundColor: lighten('rgb(255,0,0)', 0.4),
            },
        },
    },
    '& .status-success': {
        backgroundColor: lighten('rgb(0,255,0)', 0.7),
        '&:hover': {
            backgroundColor: lighten('rgb(0,255,0)', 0.6),
        },
        '&.Mui-selected': {
            backgroundColor: lighten('rgb(0,255,0)', 0.5),
            '&:hover': {
                backgroundColor: lighten('rgb(0,255,0)', 0.4),
            },
        },
    },
    '& .status-info': {
        backgroundColor: lighten('rgb(0,0,255)', 0.7),
        '&:hover': {
            backgroundColor: lighten('rgb(0,0,255)', 0.6),
        },
        '&.Mui-selected': {
            backgroundColor: lighten('rgb(0,0,255)', 0.5),
            '&:hover': {
                backgroundColor: lighten('rgb(0,0,255)', 0.4),
            },
        },
    },
}));

export default function ViewGrid(props: { ViewItems: DataSources['data'], website: IWebsite }) {
    const [open, setOpen] = React.useState(false);
    const [data, setData] = React.useState<GridRow | null>(null);
    function viewDetails(data: GridRow) {
        setData(data);
        setOpen(true);
    }
    function handleClose() {
        setData(null);
        setOpen(false);
    }
    return (
        <div style={{ width: '100%' }}>
            <StyledDataGrid
                slots={{
                    loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                }}
                checkboxSelection={false}
                rowSelection={false}
                loading={props.ViewItems.length === 0}
                rows={props.ViewItems}
                getRowClassName={(params) => `status-${params.row.status}`}
                columns={columns(viewDetails)}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 100 },
                    },
                }}
                pageSizeOptions={[5, 10]}
            />
            {data && (
                <Dialog
                    open={open}
                    fullWidth={true}
                    maxWidth={'md'}
                    onClose={handleClose}
                >
                    <DialogTitle>
                        <Typography variant={'h2'}>
                            {data.label}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <ViewItem data={data} key={data.id} websiteUrl={props.website.url} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
}