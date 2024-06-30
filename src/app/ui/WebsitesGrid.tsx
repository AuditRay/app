'use client'

import * as React from 'react';
import {
    DataGridPro,
    GridColDef,
    GridRenderCellParams,
    GridSlots,
    getGridStringOperators,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport, GridFilterModel, GridColumnVisibilityModel
} from '@mui/x-data-grid-pro';
import {diff} from 'deep-object-diff';
import {IWebsite} from "@/app/models/Website";
import {Box, Chip, LinearProgress, Link} from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import {fontSize} from "@mui/system";
import {useCallback, useEffect} from "react";
import Button from "@mui/material/Button";
import SaveFilterViewModal from "@/app/ui/SaveFilterViewModal";
import {useSearchParams} from "next/navigation";
import {getFiltersView} from "@/app/actions/filterViewsActions";
import {headers} from "next/headers";
import {tableSourceField} from "@/app/actions/websiteActions";
import {IFiltersView} from "@/app/models/FiltersView";
import UpdateFilterViewModal from "@/app/ui/UpdateFilterViewModal";
import useRightDrawerStore from "@/app/lib/uiStore";

export type GridRow = {
    id: number|string;
    favicon: string;
    url: string;
    siteName: string;
    type: IWebsite['type'];
    tags: string[];
    componentsNumber: number;
    componentsUpdatedNumber: number;
    componentsWithUpdatesNumber: number;
    componentsWithSecurityUpdatesNumber: number;
    frameWorkUpdateStatus: 'Up to Date' | 'Needs Update' | 'Security Update' | 'Revoked' | 'Unknown' | 'Not Supported';
    [key: string]: string | number | string[] | IWebsite['type'] | boolean | tableSourceField
};
const columnsVisibility = (headers?: { id: string, label: string}[]) => {
    const cols: { [key: string]: boolean } = {
        componentsNumber: true,
        componentsUpdatedNumber: true,
        componentsWithUpdatesNumber: false,
        componentsWithSecurityUpdatesNumber: false,
    }
    for (const [key, value] of Object.entries(headers || {})) {
        cols[value.id] = false;
    }
    return cols;
}

const prepareColumns = (viewMore: (title: string, content: string) => void, headers?: { id: string, label: string}[]): GridColDef[] => {

    const cols: GridColDef[] = [
        { field: 'siteName', headerName: 'Website Name', flex: 1, minWidth: 450,
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['siteName']>) => (
                params.value && (
                    <>
                        <Box>
                            <Link href={`/websites/${params.row.id}`} sx={{textDecoration: 'none', color: 'inherit'}}>
                                <Box component={'img'}  src={`${params.row.favicon}`} alt={params.value} sx={{width: '20px', verticalAlign: 'middle', mr: '10px'}} />{params.value}
                            </Link>
                            <Link href={params.row.url} target={'_blank'}>
                                <LaunchIcon fontSize={'small'} sx={{verticalAlign: 'middle', ml: '5px'}}></LaunchIcon>
                            </Link>
                        </Box>
                    </>
                )
            ),
        },
        {
            field: 'tags',
            headerName: 'Tags',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterOperators: getGridStringOperators().filter((operator) => operator.value === 'contains').map((operator) => {
                return operator;
            }),
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['tags']>) => (
                params.value && params.value.map((tag) => (
                    <Chip key={tag} label={tag} variant="filled" sx={{mr: 1}} size={'small'}/>
                ))
            ),
        },
        {
            field: 'types',
            headerName: 'Type',
            flex: 1,
            sortable: false,
            filterOperators: getGridStringOperators().filter((operator) => operator.value === 'contains').map((operator) => {
              return operator;
            }),
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['type']>) => (
                params.row.type && (
                    <Box component={'div'} sx={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
                        <Box key={`${params.row.type.slug}-wrapper`} component={'div'} sx={{width: '20px'}}>
                            <Box component={'img'}  src={`/tech/${params.row.type.icon}`} alt={params.row.type.name} sx={{width: '100%' }} />
                        </Box>
                        {params.row.type.subTypes?.length > 0 && params.row.type.subTypes.map((subType) => (
                            <Box key={`${subType.slug}-wrapper`} component={'div'} sx={{width: '20px'}}>
                                <Box component={'img'} key={subType.slug} src={`/tech/${subType.icon}`} alt={subType.name} sx={{width: '100%' }}/>
                            </Box>
                        ))}
                    </Box>
                )
            ),

        },
        {
            field: 'frameWorkUpdateStatus',
            headerName: 'Status',
            flex: 1,
            valueOptions: ['Up to Date', 'Needs Update', 'Security Update', 'Revoked', 'Unknown', 'Not Supported'],
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['frameWorkUpdateStatus']>) => {
                if (params.value === 'Up to Date') {
                    return <Chip sx={{bgcolor: 'green', color: 'white'}} label={'Up to Date'} />
                } else if (params.value === 'Needs Update') {
                    return <Chip sx={{bgcolor: 'orange', color: 'white'}} label={'Needs Update'} />
                } else if (params.value === 'Not Supported') {
                    return <Chip sx={{bgcolor: 'darkkhaki', color: 'white'}} label={'Not Supported'} />
                } else if (params.value === 'Revoked') {
                    return <Chip sx={{bgcolor: 'brown', color: 'white'}} label={'Revoked'} />
                } else if (params.value === 'Security Update') {
                    return <Chip sx={{bgcolor: 'red', color: 'white'}} label={'Security Update'} />
                } else {
                    return <Chip sx={{bgcolor: 'yellowgreen', color: 'white'}} label={'Unknown'} />
                }
            },
            type: 'singleSelect',
        },
        {
            field: 'componentsNumber',
            headerName: 'Components',
            flex: 1,
            type: 'number',
        },
        {
            field: 'componentsUpdatedNumber',
            headerName: 'Up to Date',
            flex: 1,
            type: 'number',
        },
        {
            field: 'componentsWithUpdatesNumber',
            headerName: 'Needs Updates',
            flex: 1,
            type: 'number',
        },
        {
            field: 'componentsWithSecurityUpdatesNumber',
            headerName: 'Security Updates',
            flex: 1,
            type: 'number',
        }
    ]
    for (const [key, value] of Object.entries(headers || {})) {
        cols.push({
            field: value.id,
            headerName: value.label,
            flex: 1,
            renderCell: (params: GridRenderCellParams<GridRow, GridRow[0]>) => {
                const rawData = params.row[`${value.id}_raw`] as tableSourceField;

                if(typeof rawData !== 'object') {
                    return rawData;
                }
                if(!rawData.type) {
                    return '';
                }
                if(rawData.type === 'status') {
                    return (
                        <Chip
                            sx={{bgcolor: rawData.status === 'success' ? 'green' : rawData.status === 'warning' ? 'orange' : 'red', color: 'white'}}
                            label={rawData.value}
                            title={rawData.info}
                            onClick={() => rawData.value && rawData.info && viewMore(rawData.value, rawData.info)}
                        />
                    )
                } else if (rawData.type === 'version') {
                    if (rawData.status === 'Up to Date') {
                        return <Chip
                            sx={{bgcolor: 'green', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.value && rawData.status && viewMore(rawData.status, rawData.value)}
                        ></Chip>
                    } else if (rawData.status === 'Needs Update') {
                        return <Chip
                            sx={{bgcolor: 'orange', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.value && rawData.status && viewMore(rawData.status, rawData.value)}
                        />
                    } else if (rawData.status === 'Not Supported') {
                        return <Chip
                            sx={{bgcolor: 'darkkhaki', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.value && rawData.status && viewMore(rawData.status, rawData.value)}
                        />
                    } else if (rawData.status === 'Revoked') {
                        return <Chip
                            sx={{bgcolor: 'brown', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.value && rawData.status && viewMore(rawData.status, rawData.value)}
                        />
                    } else if (rawData.status === 'Security Update') {
                        return <Chip
                            sx={{bgcolor: 'red', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.value && rawData.status && viewMore(rawData.status, rawData.value)}
                        />
                    } else {
                        return <Chip
                            sx={{bgcolor: 'yellowgreen', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.value && rawData.status && viewMore(rawData.status, rawData.value)}
                        />
                    }
                } else {
                    return (
                        <Box
                            onClick={() => rawData.value && rawData.status && viewMore(rawData.status, rawData.value)}
                        >
                            {rawData.value}
                        </Box>
                    );
                }
            },
            type: 'string',
        })
    }
    return cols;
};


export default function WebsitesGrid(props: { websites: GridRow[], extraHeader?: { id: string, label: string}[]}) {
    const searchParams = useSearchParams();
    const [filters, setFilters] = React.useState<GridFilterModel>();
    const [isFiltersLoaded, setIsFiltersLoaded] = React.useState<boolean>(false);
    const [filtersView, setFiltersView] = React.useState<IFiltersView>();
    const [columns, setColumns] = React.useState<GridColumnVisibilityModel>();
    const [isSaveOpened, setIsSaveOpened] = React.useState<boolean>(false);
    const [isUpdateOpened, setIsUpdateOpened] = React.useState<boolean>(false);
    const openRightDrawer = useRightDrawerStore((state) => state.openRightDrawer);
    const CustomToolbar = useCallback(() => {
        const filterViewParam = searchParams.get('filterView');
        let enableSave = false;
        if (filters) {
            const compare = diff(filters, filtersView?.filters || { items: [] });
            console.log('filters compare', compare);
            enableSave = compare && Object.keys(compare).length > 0;
        }
        if(columns) {
            const compare = diff(columns, filtersView?.columns || columnsVisibility(props.extraHeader));
            console.log('columns compare', compare);
            enableSave = compare && Object.keys(compare).length > 0;
        }
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarExport />
                {!filterViewParam && (
                    <Button variant={'contained'} onClick={() => setIsSaveOpened(true)}>
                        Save View
                    </Button>
                )}
                {filterViewParam && enableSave && (
                    <Button variant={'outlined'} onClick={() => setIsUpdateOpened(true)}>
                        Update View
                    </Button>
                )}
            </GridToolbarContainer>
        );
    }, [searchParams, filters, columns, filtersView, props.extraHeader])

    useEffect(() => {
        const filterView = searchParams.get('filterView');
        if (filterView) {
            getFiltersView(filterView).then((filter) => {
                filter && setIsFiltersLoaded(true);
                filter && setFiltersView(filter);
                filter && setFilters(filter.filters as GridFilterModel);
                filter && filter.columns && setColumns(filter.columns as GridColumnVisibilityModel);
            })
        } else {
            setFilters({ items: [] });
            setColumns(columnsVisibility(props.extraHeader));
            setFiltersView(undefined);
        }
    }, [props.extraHeader, searchParams]);

    return (
        <div style={{ width: '100%' }}>
            <SaveFilterViewModal open={isSaveOpened} setOpen={setIsSaveOpened} filtersModel={filters} columnsModel={columns}/>
            {filtersView && (
                <UpdateFilterViewModal open={isUpdateOpened} setOpen={setIsUpdateOpened} filtersView={filtersView} filtersModel={filters} columnsModel={columns}/>
            )}
            <DataGridPro
                slots={{
                    loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                    toolbar: CustomToolbar,
                }}
                loading={props.websites.length === 0}
                rows={props.websites}
                columns={prepareColumns(openRightDrawer, props.extraHeader)}
                rowSelection={false}
                onFilterModelChange={(model) => {
                    setFilters(model);
                }}
                onColumnVisibilityModelChange={(model) => {
                    setColumns(model);  // save columns visibility
                }}
                filterModel={filters}
                columnVisibilityModel={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 20 },
                    },
                    columns: {
                        columnVisibilityModel: columnsVisibility(props.extraHeader),
                    },
                }}
                pageSizeOptions={[5, 20]}
            />
        </div>
    );
}