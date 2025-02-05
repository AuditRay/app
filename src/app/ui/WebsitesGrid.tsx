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
    GridToolbarExport,
    GridFilterModel,
    GridColumnVisibilityModel,
    GridPaginationModel,
    GridSortModel,
    GridColumnHeaderTitle
} from '@mui/x-data-grid-pro';
import {diff} from 'deep-object-diff';
import {IWebsite} from "@/app/models/Website";
import {Box, Chip, LinearProgress, Paper} from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import {useCallback, useEffect} from "react";
import Button from "@mui/material/Button";
import SaveFilterViewModal from "@/app/ui/SaveFilterViewModal";
import {useSearchParams} from "next/navigation";
import {getFiltersView} from "@/app/actions/filterViewsActions";
import {getWebsitesTable, tableSourceField} from "@/app/actions/websiteActions";
import {IFiltersView} from "@/app/models/FiltersView";
import UpdateFilterViewModal from "@/app/ui/UpdateFilterViewModal";
import useRightDrawerStore from "@/app/lib/uiStore";
import ViewItem from "@/app/ui/ViewItem";
import Typography from "@mui/material/Typography";
import WebsitesInfoGrid from "@/app/ui/WebsitesInfoGrid";
import ComponentInfo from "@/app/ui/ComponentInfo";
import {UpdateInfo} from "@/app/models";
import Link from "@/app/ui/Link";
import Grid from '@mui/material/Grid2';
import {BarChart, Gauge, gaugeClasses, PieChart} from "@mui/x-charts";
import theme from "@/theme";
import {CustomGridFilterForm} from "@/app/ui/DataGrid/CustomGridFilterForm";
import {CustomGridFilterPanel} from "@/app/ui/DataGrid/CustomGridFilterPanel";
import {GridFilterForm} from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";

export type GridRow = {
    id: number|string;
    favicon: string;
    url: string;
    siteName: string;
    type: IWebsite['type'];
    tags: string[];
    updatedAt: string,
    updateType: 'Auto' | 'Manual',
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
    [key: string]: string | number | string[] | IWebsite['type'] | boolean | tableSourceField | UpdateInfo[] | undefined | Partial<IWebsite['uptimeMonitorInfo']>
};
const prepareColumnsVisibility = (headers?: { id: string, label: string}[]) => {
    const cols: { [key: string]: boolean } = {
        frameworkVersion: true,
        componentsNumber: true,
        componentsUpdatedNumber: true,
        componentsWithUpdatesNumber: true,
        componentsWithSecurityUpdatesNumber: true,
        updatedAt: true,
        updateType: true,
    }
    for (const [key, value] of Object.entries(headers || {})) {
        if(value.id === 'frameworkVersion') continue;
        if(value.id === 'updatedAt') continue;
        if(value.id === 'updateType') continue;
        cols[value.id] = false;
    }
    return cols;
}


const prepareColumns = (workspaceId: string, viewMore: (title: React.ReactNode | string, content: React.ReactNode | string) => void, headers?: { id: string, label: string}[]): GridColDef[] => {

    const cols: GridColDef[] = [
        { field: 'siteName', headerName: 'Website Name', flex: 1, minWidth: 450,
            align: 'left',
            headerAlign: 'left',
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['siteName']>) => (
                params.value && (
                    <>
                        <Box>
                            <Link href={`/workspace/${workspaceId}/websites/${params.row.id}`} sx={{textDecoration: 'none', color: 'inherit'}}>
                                <Box component={'img'}  src={`${params.row.favicon ?? '/tech/other.png'}`} alt={params.value} sx={{width: '20px', verticalAlign: 'middle', mr: '10px'}} />{params.value}
                            </Link>
                            <Link href={params.row.url} target={'_blank'}>
                                <LaunchIcon fontSize={'small'} sx={{verticalAlign: 'middle', ml: '5px'}}></LaunchIcon>
                            </Link>
                        </Box>
                    </>
                )
            ),
        },
        { field: 'updateType', headerName: 'Update Type', flex: 1, minWidth: 120,
            align: 'left',
            headerAlign: 'left',
            sortable: false,
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['updateType']>) => (
                params.value && (
                    <Tooltip title={params.row.updatedAt ? params.row.updatedAt : ''} arrow>
                        <Chip
                            sx={{bgcolor: params.value === 'Auto' ? 'green' : 'gray', color: 'white'}}
                            label={params.value}
                        />
                    </Tooltip>
                )
            ),
        },
        // {
        //     field: 'uptimeMonitor',
        //     headerName: 'Up Monitor',
        //     flex: 1,
        //     minWidth: 120,
        //     sortable: false,
        //     align: 'left',
        //     headerAlign: 'left',
        //     filterOperators: getGridStringOperators().filter((operator) => operator.value === 'contains').map((operator) => {
        //         return operator;
        //     }),
        //     renderCell: (params: GridRenderCellParams<GridRow, GridRow['uptimeMonitor']>) => {
        //         const rawData = params.row.uptimeMonitor_raw as tableSourceField;
        //         console.log('rawData', rawData, params);
        //         if(!rawData) {
        //             return <Chip label={'Not Enabled'} />
        //         }
        //         if(rawData.status === 'warning') {
        //             return <Chip label={'Not Enabled'} />
        //         }
        //         return (<Chip
        //             sx={{bgcolor: rawData.status === 'success' ? 'green' : rawData.status === 'warning' ? 'orange' : 'red', color: 'white'}}
        //             label={rawData.value}
        //             title={rawData.info}
        //             onClick={() => rawData.raw && viewMore(
        //                 <Typography variant={'subtitle1'}>
        //                     Website Up Monitor
        //                 </Typography>,
        //                 <Typography variant={'h3'}>
        //                     <Chip
        //                         sx={{bgcolor: rawData.status === 'success' ? 'green' : rawData.status === 'warning' ? 'orange' : 'red', color: 'white', mr: 2}}
        //                         label={rawData.value}
        //                     /> {rawData.info}
        //                 </Typography>
        //             )}
        //         />)
        //     },
        // },
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
            field: 'frameworkVersion',
            headerName: 'Framework',
            flex: 1,
            minWidth: 120,
            sortable: false,
            align: 'left',
            headerAlign: 'left',
            filterOperators: getGridStringOperators().filter((operator) => operator.value === 'contains').map((operator) => {
                return operator;
            }),
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['frameworkVersion']>) => {
                const rawData = params.row.frameworkVersion;
                const updatedComponent = rawData?.component;
                if(!rawData || !updatedComponent) {
                    return <Chip label={'Unknown'} />
                }
                return <Chip label={updatedComponent.current_version} onClick={() => rawData?.component && params.value && viewMore(rawData?.component.title,  <WebsitesInfoGrid websiteInfo={[updatedComponent]}/>)}/>
            },
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
                    return <Chip label={'Unknown'} onClick={() => rawData?.component && params.value && viewMore(params.value,  <WebsitesInfoGrid websiteInfo={updatedComponents}/>)}/>
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
                    sx={{bgcolor: params.value ? 'green' : undefined, color: params.value ? 'white' : undefined}}
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
                    sx={{bgcolor: params.value ? 'orange' : undefined, color: params.value ? 'white' : undefined}}
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
                    sx={{bgcolor: params.value ? 'red' : undefined, color: params.value ? 'white' : undefined}}
                    label={params.value}
                    onClick={() => rawData?.component && params.value && viewMore("Components",  <WebsitesInfoGrid websiteInfo={components}/>)}
                />
            },
        }
    ]
    const containsOperator = getGridStringOperators().find((operator) => operator.value === 'contains');
    for (const [key, value] of Object.entries(headers || {})) {
        if(value.id === 'frameworkVersion') continue;
        if(value.id === 'uptimeMonitor') continue;
        cols.push({
            field: value.id,
            headerName: value.label,
            renderHeader: (params) => {
                const title = params.colDef.headerName?.includes('-') ? params.colDef.headerName?.split('-')[1].trim() : params.colDef.headerName;
                //return <Typography variant={'subtitle1'}>{title}</Typography>
                return <GridColumnHeaderTitle
                    label={title || ''}
                    description={params.colDef.description}
                    columnWidth={params.colDef.width || 0}
                />
            },
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
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component} websiteInfo={{
                                websiteName: params.row.siteName,
                                websiteUrl: params.row.url,
                                frameworkVersion: params.row.frameworkVersion?.value || 'Unknown',
                                frameworkType: params.row.type.name,
                            }} />)}
                        ></Chip>
                    } else if (rawData.status === 'Needs Update') {
                        return <Chip
                            sx={{bgcolor: 'orange', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component} websiteInfo={{
                                websiteName: params.row.siteName,
                                websiteUrl: params.row.url,
                                frameworkVersion: params.row.frameworkVersion?.value || 'Unknown',
                                frameworkType: params.row.type.name,
                            }} />)}
                        />
                    } else if (rawData.status === 'Not Supported') {
                        return <Chip
                            sx={{bgcolor: 'darkkhaki', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component} websiteInfo={{
                                websiteName: params.row.siteName,
                                websiteUrl: params.row.url,
                                frameworkVersion: params.row.frameworkVersion?.value || 'Unknown',
                                frameworkType: params.row.type.name,
                            }} />)}
                        />
                    } else if (rawData.status === 'Revoked') {
                        return <Chip
                            sx={{bgcolor: 'brown', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component} websiteInfo={{
                                websiteName: params.row.siteName,
                                websiteUrl: params.row.url,
                                frameworkVersion: params.row.frameworkVersion?.value || 'Unknown',
                                frameworkType: params.row.type.name,
                            }} />)}
                        />
                    } else if (rawData.status === 'Security Update') {
                        return <Chip
                            sx={{bgcolor: 'red', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component} websiteInfo={{
                                websiteName: params.row.siteName,
                                websiteUrl: params.row.url,
                                frameworkVersion: params.row.frameworkVersion?.value || 'Unknown',
                                frameworkType: params.row.type.name,
                            }} />)}
                        />
                    } else {
                        return <Chip
                            sx={{bgcolor: 'yellowgreen', color: 'white'}}
                            title={rawData.status}
                            label={rawData.value}
                            onClick={() => rawData.component && rawData.status && viewMore(rawData.component.title,  <ComponentInfo component={rawData.component} websiteInfo={{
                                websiteName: params.row.siteName,
                                websiteUrl: params.row.url,
                                frameworkVersion: params.row.frameworkVersion?.value || 'Unknown',
                                frameworkType: params.row.type.name,
                            }} />)}
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

    const customOrder = ['Website Info', 'Components'];
    return cols.sort(
        (a, b) => {
            const aGroup = a.headerName?.includes("-") ? a.headerName.split("-")[0].trim() : 'Website Info';
            const bGroup = b.headerName?.includes("-") ? b.headerName.split("-")[0].trim() : 'Website Info';
            const indexA = customOrder.indexOf(aGroup) !== -1 ? customOrder.indexOf(aGroup) : Infinity;
            const indexB = customOrder.indexOf(bGroup) !== -1 ? customOrder.indexOf(bGroup) : Infinity;
            return indexA - indexB;
        },
    );
};

function CustomNoRowsOverlay() {
    return (
        <Box sx={{ mt: 2 }}>Loading Data</Box>
    );
}

export default function WebsitesGrid({ workspaceId, viewId }: {workspaceId: string, viewId?: string}) {
    const [filters, setFilters] = React.useState<GridFilterModel>();
    const [isFiltersLoaded, setIsFiltersLoaded] = React.useState<boolean>(false);
    const [isWebsitesLoading, setIsWebsitesLoading] = React.useState<boolean>(true);
    const [filtersView, setFiltersView] = React.useState<IFiltersView>();
    const [columnsVisibility, setColumnsVisibility] = React.useState<GridColumnVisibilityModel>();
    const [columns, setColumns] = React.useState<GridColDef[]>();
    const [isSaveOpened, setIsSaveOpened] = React.useState<boolean>(false);
    const [isUpdateOpened, setIsUpdateOpened] = React.useState<boolean>(false);
    const [websites, setWebsites] = React.useState<GridRow[]>([])
    const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = React.useState<GridSortModel>();
    const [rowCount, setRowCount] = React.useState<number>(0);
    const [barChart, setBarChart] = React.useState<number[]>();
    const [securityIndex, setSecurityIndex] = React.useState<number>();
    const [pieChart, setPieChart] = React.useState<{ id: number, value: number, label: string }[]>();
    const [extraHeader, setExtraHeader] = React.useState<{ id: string, label: string}[]>([]);
    const openRightDrawer = useRightDrawerStore((state) => state.openRightDrawer);
    const CustomToolbar = useCallback(() => {
        const filterViewParam = viewId;
        let enableSave = false;
        if (filters) {
            const compare = diff(filters, filtersView?.filters || { items: [] });
            enableSave = compare && Object.keys(compare).length > 0;
        }
        if(columns) {
            const compare = diff(columns, filtersView?.columns || prepareColumnsVisibility(extraHeader));
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
    }, [viewId, filters, columns, filtersView, extraHeader])
    const getWebsites = async (data?: { filters?: GridFilterModel, pagination?: GridPaginationModel, sort?: GridSortModel }) => {
        console.log('data', data);
        setIsWebsitesLoading(true);
        console.log('filters', filters);

        const {data: websites, extraHeaders, count, statistics} = await getWebsitesTable(
            workspaceId,
            data?.pagination || paginationModel,
            data?.filters || filters,
            data?.sort || sortModel
        );
        setRowCount(count);
        const WebsiteRows: GridRow[] = websites.map((website) => {
            // chartNumbers[0] += website.componentsUpdated.length ? 1 : 0;
            // chartNumbers[1] += website.componentsWithUpdates.length ? 1 : 0;
            // chartNumbers[2] += website.componentsWithSecurityUpdates.length ? 1 : 0;
            // if(!pieChart.find((item) => item.label === website.frameworkVersion.value)) {
            //     pieChart.push({ id: pieChart.length, value: 1, label: website.frameworkVersion.value });
            // } else {
            //     const index = pieChart.findIndex((item) => item.label === website.frameworkVersion.value);
            //     pieChart[index].value += 1;
            // }
            const websiteData: GridRow = {
                id: website.id,
                url: website.url,
                favicon: website.favicon,
                siteName: website.title ? website.title : website.url,
                type: website.type,
                types:  website.type ? [website.type.name, ...(website.type.subTypes.map((subType) => subType.name))] : [],
                tags: website.tags || [],
                updatedAt: website?.updatedAt,
                updateType: website.updateType,
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

        const pieChart: {id: number, value: number, label: string}[] = [];
        for (const pieChartKey in statistics.frameworkVersions) {
            pieChart.push({
                id: pieChart.length,
                value: statistics.frameworkVersions[pieChartKey],
                label: pieChartKey,
            });
        }
        setBarChart([
            statistics.status.updated,
            statistics.status.withUpdates + statistics.status.withSecurityUpdates,
            statistics.status.withSecurityUpdates,
            statistics.status.notSupported,
            statistics.status.unknown,
        ]);
        setPieChart(pieChart);
        setWebsites(WebsiteRows);
        setSecurityIndex(statistics.securityIndex);
        setExtraHeader(extraHeaders);
        setColumns(prepareColumns(workspaceId, openRightDrawer, extraHeaders));
        setColumnsVisibility(prepareColumnsVisibility(extraHeaders));
        setIsWebsitesLoading(false);
    }
    useEffect(() => {
        if(viewId) return;
        setFilters({ items: [] });
        getWebsites({
            filters: { items: [] }
        }).then(() => {});
    }, []);
    useEffect(() => {
        if(isWebsitesLoading) return;
        if(columnsVisibility) {
            console.log('columnsVisibility1233', columnsVisibility, extraHeader);
        }
    }, [isWebsitesLoading, columnsVisibility]);
    useEffect(() => {
        console.log('acbd123', viewId);
        if (viewId) {
            getFiltersView(viewId).then((filter) => {
                if (filter) {
                    setIsFiltersLoaded(true);
                    setFiltersView(filter);
                    setFilters(filter.filters as GridFilterModel);
                    if (filter.columns) {
                        //setColumns(filter.columns as GridColumnVisibilityModel);
                    }
                    console.log('filtering', filter);
                    getWebsites({
                        filters: filter.filters as GridFilterModel,
                    });
                }
            })
        } else {
            setFilters({ items: [] });
            if (extraHeader.length) {
                //setColumnsVisibility(prepareColumnsVisibility(extraHeader));
            }
            setFiltersView(undefined);
        }
    }, [viewId]);

    return (
        <div style={{ width: '100%' }}>
            <SaveFilterViewModal open={isSaveOpened} setOpen={setIsSaveOpened} filtersModel={filters} columnsModel={columnsVisibility}/>
            {filtersView && (
                <UpdateFilterViewModal open={isUpdateOpened} setOpen={setIsUpdateOpened} filtersView={filtersView} filtersModel={filters} columnsModel={columnsVisibility}/>
            )}
            <Grid container spacing={2} sx={{mb: 3}}>
                <Grid size={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240,
                        }}
                    >
                        {barChart && (
                            <BarChart
                                borderRadius={10}
                                xAxis={[
                                    {
                                        id: 'barCategories',
                                        data: ['Updated', 'Needs Update', 'Not Secure', 'Not Supported', 'Unknown'],
                                        scaleType: 'band',
                                        labelStyle: {
                                            fontSize: 5,
                                        },
                                        colorMap: {
                                            type: 'ordinal',
                                            colors: ['green', 'orange', 'red', 'darkkhaki', 'gray'],
                                        }
                                    },
                                ]}
                                series={[
                                    {
                                        data: barChart,
                                    },
                                ]}
                            />
                        )}
                    </Paper>
                </Grid>
                <Grid size={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240,
                        }}
                    >
                        <PieChart
                            series={[
                                {
                                    data: pieChart || [],
                                    innerRadius: 30,
                                    outerRadius: 100,
                                    paddingAngle: 5,
                                    cornerRadius: 5,
                                    startAngle: -45,
                                },
                            ]}
                        />
                    </Paper>
                </Grid>
                <Grid size={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240,
                        }}
                    >
                        <Gauge
                            value={securityIndex && isNaN(securityIndex) ? 0 : securityIndex}
                            startAngle={-110}
                            endAngle={110}
                            cornerRadius="50%"
                            sx={{
                                [`& .${gaugeClasses.valueText}`]: {
                                    fontSize: 15,
                                    transform: 'translate(0px, 0px)',
                                },
                                [`& .${gaugeClasses.valueArc}`]: {
                                    fill: 'red',
                                },
                                [`& .${gaugeClasses.referenceArc}`]: {
                                    fill: theme.palette.text.disabled,
                                },
                            }}
                            text={
                                ({ value, valueMax }) => `Security Index ${value}%`
                            }
                        />
                    </Paper>
                </Grid>
            </Grid>
            <DataGridPro
                autoHeight={true}
                sx={{ '--DataGrid-overlayHeight': '300px' }}
                slots={{
                    loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                    toolbar: CustomToolbar,
                    filterPanel: CustomGridFilterPanel
                }}
                loading={isWebsitesLoading}
                rows={websites}
                columns={columns ? columns : []}
                rowSelection={false}
                filterMode={'server'}
                onPaginationModelChange={(model) => {
                    console.log('model', model);
                    setPaginationModel(model);
                    getWebsites({
                        pagination: model,
                    });
                }}
                onFilterModelChange={(model) => {
                    if(isWebsitesLoading) return
                    setFilters(model);
                    getWebsites({
                        filters: model,
                    });
                }}
                onColumnVisibilityModelChange={(model) => {
                    console.log('onColumnVisibilityModelChange', model, extraHeader);
                    const preparedModel = prepareColumnsVisibility(extraHeader);
                    setColumnsVisibility({
                        ...preparedModel,
                        ...model
                    });  // save columns visibility
                }}
                filterModel={filters}
                columnVisibilityModel={columnsVisibility}
                initialState={{
                    pagination: {
                        paginationModel: paginationModel,
                    },
                    columns: {
                        columnVisibilityModel: columnsVisibility,
                    }
                }}
                sortingMode={'server'}
                onSortModelChange={(model) => {
                  setSortModel(model);
                  // getWebsites({
                  //     sort: model,
                  // });
                }}
                pagination={true}
                paginationMode={'server'}
                rowCount={rowCount}
                pageSizeOptions={[5, 10, 20]}
            />
        </div>
    );
}