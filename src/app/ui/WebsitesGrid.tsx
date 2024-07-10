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
import {getWebsitesTable, tableSourceField} from "@/app/actions/websiteActions";
import {IFiltersView} from "@/app/models/FiltersView";
import UpdateFilterViewModal from "@/app/ui/UpdateFilterViewModal";
import useRightDrawerStore from "@/app/lib/uiStore";
import ViewItem from "@/app/ui/ViewItem";
import Typography from "@mui/material/Typography";
import WebsitesInfoGrid from "@/app/ui/WebsitesInfoGrid";
import ComponentInfo from "@/app/ui/ComponentInfo";
import {IWebsiteInfo, UpdateInfo} from "@/app/models";
import {getUser} from "@/app/actions/getUser";
import {styled} from "@mui/material/styles";

export type GridRow = {
    id: number|string;
    favicon: string;
    url: string;
    siteName: string;
    type: IWebsite['type'];
    tags: string[];
    components: UpdateInfo[];
    componentsNumber: number;
    componentsUpdated: UpdateInfo[];
    componentsUpdatedNumber: number;
    componentsWithUpdates: UpdateInfo[];
    componentsWithUpdatesNumber: number;
    componentsWithSecurityUpdates: UpdateInfo[];
    componentsWithSecurityUpdatesNumber: number;
    frameWorkUpdateStatus: 'Up to Date' | 'Needs Update' | 'Security Update' | 'Revoked' | 'Unknown' | 'Not Supported';
    frameworkVersion?: tableSourceField;
    [key: string]: string | number | string[] | IWebsite['type'] | boolean | tableSourceField | UpdateInfo[] | undefined
};
const columnsVisibility = (headers?: { id: string, label: string}[]) => {
    const cols: { [key: string]: boolean } = {
        componentsNumber: true,
        componentsUpdatedNumber: true,
        componentsWithUpdatesNumber: true,
        componentsWithSecurityUpdatesNumber: true,
    }
    for (const [key, value] of Object.entries(headers || {})) {
        cols[value.id] = false;
    }
    return cols;
}

const prepareColumns = (viewMore: (title: React.ReactNode | string, content: React.ReactNode | string) => void, headers?: { id: string, label: string}[]): GridColDef[] => {

    const cols: GridColDef[] = [
        { field: 'siteName', headerName: 'Website Name', flex: 1, minWidth: 450,
            align: 'left',
            headerAlign: 'left',
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
            align: 'left',
            headerAlign: 'left',
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
            minWidth: 120,
            sortable: false,
            align: 'left',
            headerAlign: 'left',
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
            minWidth: 150,
            align: 'left',
            headerAlign: 'left',
            valueOptions: ['Up to Date', 'Needs Update', 'Security Update', 'Revoked', 'Unknown', 'Not Supported'],
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['frameWorkUpdateStatus']>) => {
                const rawData = params.row.frameworkVersion;
                const updatedComponents = params.row.components;
                const componentsWithUpdates = params.row.componentsWithUpdates;
                const componentsWithSecurityUpdates = params.row.componentsWithSecurityUpdates;

                if (params.value === 'Up to Date') {
                    return <Chip sx={{bgcolor: 'green', color: 'white'}} label={'Up to Date'} onClick={() => rawData?.component && params.value && viewMore(params.value,  <WebsitesInfoGrid websiteInfo={updatedComponents}/>)}/>
                } else if (params.value === 'Needs Update') {
                    return <Chip sx={{bgcolor: 'orange', color: 'white'}} label={'Needs Update'} onClick={() => rawData?.component && params.value && viewMore(params.value,  <WebsitesInfoGrid websiteInfo={componentsWithUpdates}/>)}/>
                } else if (params.value === 'Not Supported') {
                    return <Chip sx={{bgcolor: 'darkkhaki', color: 'white'}} label={'Not Supported'} onClick={() => rawData?.component && params.value && viewMore(params.value,  <WebsitesInfoGrid websiteInfo={componentsWithUpdates}/>)}/>
                } else if (params.value === 'Revoked') {
                    return <Chip sx={{bgcolor: 'brown', color: 'white'}} label={'Revoked'} onClick={() => rawData?.component && params.value && viewMore(params.value,  <WebsitesInfoGrid websiteInfo={componentsWithUpdates}/>)}/>
                } else if (params.value === 'Security Update') {
                    return <Chip sx={{bgcolor: 'red', color: 'white'}} label={'Security Update'} onClick={() => rawData?.component && params.value && viewMore(params.value,  <WebsitesInfoGrid websiteInfo={componentsWithSecurityUpdates}/>)}/>
                } else {
                    return <Chip sx={{bgcolor: 'yellowgreen', color: 'white'}} label={'Unknown'} onClick={() => rawData?.component && params.value && viewMore(params.value,  <WebsitesInfoGrid websiteInfo={updatedComponents}/>)}/>
                }
            },
            type: 'singleSelect',
        },
        {
            field: 'componentsNumber',
            headerName: 'Total Components',
            flex: 1,
            minWidth: 160,
            type: 'number',
            align: 'left',
            headerAlign: 'left',
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['frameWorkUpdateStatus']>) => {
                const rawData = params.row.frameworkVersion;
                const updatedComponents = params.row.components;
                return <Chip label={params.value} onClick={() => rawData?.component && params.value && viewMore("Components",  <WebsitesInfoGrid websiteInfo={updatedComponents}/>)}/>
            },
        },
        {
            field: 'componentsUpdatedNumber',
            headerName: 'Up to Date',
            flex: 1,
            minWidth: 120,
            type: 'number',
            align: 'left',
            headerAlign: 'left',
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['frameWorkUpdateStatus']>) => {
                const rawData = params.row.frameworkVersion;
                const components = params.row.componentsUpdated;
                return <Chip
                    sx={{bgcolor: 'green', color: 'white'}}
                    label={params.value}
                    onClick={() => rawData?.component && params.value && viewMore("Components",  <WebsitesInfoGrid websiteInfo={components}/>)}
                />
            },
        },
        {
            field: 'componentsWithUpdatesNumber',
            headerName: 'Needs Updates',
            flex: 1,
            minWidth: 180,
            type: 'number',
            align: 'left',
            headerAlign: 'left',
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['frameWorkUpdateStatus']>) => {
                const rawData = params.row.frameworkVersion;
                const components = params.row.componentsWithUpdates;
                return <Chip
                    sx={{bgcolor: 'orange', color: 'white'}}
                    label={params.value}
                    onClick={() => rawData?.component && params.value && viewMore("Components",  <WebsitesInfoGrid websiteInfo={components}/>)}
                />
            },
        },
        {
            field: 'componentsWithSecurityUpdatesNumber',
            headerName: 'Security Updates',
            flex: 1,
            minWidth: 160,
            type: 'number',
            align: 'left',
            headerAlign: 'left',
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['frameWorkUpdateStatus']>) => {
                const rawData = params.row.frameworkVersion;
                const components = params.row.componentsWithSecurityUpdates;
                return <Chip
                    sx={{bgcolor: 'red', color: 'white'}}
                    label={params.value}
                    onClick={() => rawData?.component && params.value && viewMore("Components",  <WebsitesInfoGrid websiteInfo={components}/>)}
                />
            },
        }
    ]
    const containsOperator = getGridStringOperators().find((operator) => operator.value === 'contains');
    for (const [key, value] of Object.entries(headers || {})) {
        cols.push({
            field: value.id,
            headerName: value.label,
            flex: 1,
            minWidth: 160,
            align: 'left',
            headerAlign: 'left',
            filterOperators: [
                {
                    ...containsOperator!,
                    label: 'Contains',
                    getApplyFilterFn: (filterItem, column) => {
                        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
                            return null;
                        }
                        if (typeof filterItem.value !== 'string') {
                            return null;
                        }
                        return (value, row, column, apiRef) => {
                            let check = false;
                            if(typeof value === 'string') {
                                check ||= (value.toLowerCase()).includes(filterItem.value.toLowerCase());
                            }
                            if (value?.value && typeof value?.value  === 'string') {
                                check ||= (value?.value.toLowerCase()).includes(filterItem.value.toLowerCase());
                            }
                            if (value?.status && typeof value?.status  === 'string') {
                                check ||= (value?.status.toLowerCase()).includes(filterItem.value.toLowerCase());
                            }
                            if (value?.component?.title && typeof value?.component?.title  === 'string') {
                                check ||= (value?.component?.title.toLowerCase()).includes(filterItem.value.toLowerCase());
                            }
                            return check;
                        };
                    },
                },
                {
                    ...containsOperator!,
                    label: 'Does not contain',
                    value: 'notContains',
                    getApplyFilterFn: (filterItem, column) => {
                        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
                            return null;
                        }
                        if (typeof filterItem.value !== 'string') {
                            return null;
                        }

                        return (value, row, column, apiRef) => {
                            if(typeof value === 'string') {
                                return !(value.toLowerCase()).includes(filterItem.value.toLowerCase());
                            }
                            if (value?.component?.title && typeof value?.component?.title  === 'string') {
                                return !(value?.component?.title.toLowerCase()).includes(filterItem.value.toLowerCase());
                            }
                            if (value?.value && typeof value?.value  === 'string') {
                                return !(value?.value.toLowerCase()).includes(filterItem.value.toLowerCase());
                            }
                            if (value?.status && typeof value?.status  === 'string') {
                                return !(value?.status.toLowerCase()).includes(filterItem.value.toLowerCase());
                            }
                            return true;
                        };
                    },
                },
                {
                    label: 'Empty',
                    value: 'empty',
                    getApplyFilterFn: (filterItem, column) => {
                        return (value, row, column, apiRef) => {
                            if(typeof value === 'string') {
                                return !value || value === 'N/A';
                            }
                            return false
                        };
                    },
                },
                {
                    label: 'Not Empty',
                    value: 'notEmpty',
                    getApplyFilterFn: (filterItem, column) => {
                        return (value, row, column, apiRef) => {
                            if(typeof value === 'string') {
                                return !!value && value !== 'N/A';
                            }
                            return true
                        };
                    },
                }
            ],
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
                            onClick={() => rawData.raw && viewMore(
                                <Typography variant={'h2'}>
                                    <Chip
                                        sx={{bgcolor: rawData.status === 'success' ? 'green' : rawData.status === 'warning' ? 'orange' : 'red', color: 'white', mr: 2}}
                                        label={rawData.value}
                                    />
                                    {rawData.raw.label}
                                </Typography>,
                                <ViewItem data={rawData.raw} key={rawData.raw.id} websiteUrl={rawData.url} />
                            )}
                        />
                    )
                } else if (rawData.type === 'version') {
                    if (rawData.status === 'Up to Date') {
                        return <Chip
                            sx={{bgcolor: 'green', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component}/>)}
                        ></Chip>
                    } else if (rawData.status === 'Needs Update') {
                        return <Chip
                            sx={{bgcolor: 'orange', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component}/>)}
                        />
                    } else if (rawData.status === 'Not Supported') {
                        return <Chip
                            sx={{bgcolor: 'darkkhaki', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component}/>)}
                        />
                    } else if (rawData.status === 'Revoked') {
                        return <Chip
                            sx={{bgcolor: 'brown', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component}/>)}
                        />
                    } else if (rawData.status === 'Security Update') {
                        return <Chip
                            sx={{bgcolor: 'red', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component}/>)}
                        />
                    } else {
                        return <Chip
                            sx={{bgcolor: 'yellowgreen', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component}/>)}
                        />
                    }
                } else {
                    return (
                        <Box
                            onClick={() => rawData.value && viewMore(value.label, rawData.value)}
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

function CustomNoRowsOverlay() {
    return (
        <Box sx={{ mt: 2 }}>Loading Data</Box>
    );
}

export default function WebsitesGrid() {
    const searchParams = useSearchParams();
    const [filters, setFilters] = React.useState<GridFilterModel>();
    const [isFiltersLoaded, setIsFiltersLoaded] = React.useState<boolean>(false);
    const [isWebsitesLoading, setIsWebsitesLoading] = React.useState<boolean>(true);
    const [filtersView, setFiltersView] = React.useState<IFiltersView>();
    const [columns, setColumns] = React.useState<GridColumnVisibilityModel>();
    const [isSaveOpened, setIsSaveOpened] = React.useState<boolean>(false);
    const [isUpdateOpened, setIsUpdateOpened] = React.useState<boolean>(false);
    const [websites, setWebsites] = React.useState<GridRow[]>([])
    const [extraHeader, setExtraHeader] = React.useState<{ id: string, label: string}[]>([]);
    const openRightDrawer = useRightDrawerStore((state) => state.openRightDrawer);
    const CustomToolbar = useCallback(() => {
        const filterViewParam = searchParams.get('filterView');
        let enableSave = false;
        if (filters) {
            const compare = diff(filters, filtersView?.filters || { items: [] });
            enableSave = compare && Object.keys(compare).length > 0;
        }
        if(columns) {
            const compare = diff(columns, filtersView?.columns || columnsVisibility(extraHeader));
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
    }, [searchParams, filters, columns, filtersView, extraHeader])
    useEffect(() => {
        setIsWebsitesLoading(true);
        const getWebsites = async () => {
            const {data: websites, extraHeaders} = await getWebsitesTable();
            const WebsiteRows: GridRow[] = websites.map((website) => {
                const websiteData: GridRow = {
                    id: website.id,
                    url: website.url,
                    favicon: website.favicon,
                    siteName: website.title ? website.title : website.url,
                    type: website.type,
                    types:  website.type ? [website.type.name, ...(website.type.subTypes.map((subType) => subType.name))] : [],
                    tags: website.tags || [],
                    components: website.components,
                    componentsNumber: website.components.length,
                    componentsUpdated: website.componentsUpdated,
                    componentsUpdatedNumber: website.componentsUpdated.length,
                    componentsWithUpdates: website.componentsWithUpdates,
                    componentsWithUpdatesNumber: website.componentsWithUpdates.length,
                    componentsWithSecurityUpdates: website.componentsWithSecurityUpdates,
                    componentsWithSecurityUpdatesNumber: website.componentsWithSecurityUpdates.length,
                    frameWorkUpdateStatus: website.frameWorkUpdateStatus,
                    frameworkVersion: website.frameworkVersion,
                }
                for (const [key, value] of Object.entries(website)) {
                    if(!websiteData[key]) {
                        if(typeof value === 'object') {
                            switch (value.type) {
                                case 'text':
                                    websiteData[key] = value.value
                                    break
                                case 'status':
                                    websiteData[key] = value.status === 'success' ? "Success" : value.status === 'warning' ? "Warning" : "Error"
                                    break
                                case 'version':
                                    websiteData[key] = value.value
                                    break
                            }
                            websiteData[`${key}_raw`] = value;
                        }
                    }
                }
                return websiteData;
            });
            setWebsites(WebsiteRows);
            setExtraHeader(extraHeaders);
            setIsWebsitesLoading(false);
        }

        getWebsites();
    }, [])
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
            setColumns(columnsVisibility(extraHeader));
            setFiltersView(undefined);
        }
    }, [extraHeader, searchParams]);

    return (
        <div style={{ width: '100%' }}>
            <SaveFilterViewModal open={isSaveOpened} setOpen={setIsSaveOpened} filtersModel={filters} columnsModel={columns}/>
            {filtersView && (
                <UpdateFilterViewModal open={isUpdateOpened} setOpen={setIsUpdateOpened} filtersView={filtersView} filtersModel={filters} columnsModel={columns}/>
            )}
            <DataGridPro
                autoHeight={true}
                sx={{ '--DataGrid-overlayHeight': '300px' }}
                slots={{
                    loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                    toolbar: CustomToolbar
                }}
                loading={isWebsitesLoading}
                rows={websites}
                columns={prepareColumns(openRightDrawer, extraHeader)}
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
                        columnVisibilityModel: columnsVisibility(extraHeader),
                    },
                }}
                pageSizeOptions={[5, 20]}
            />
        </div>
    );
}