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
    GridToolbarExport, GridFilterModel, GridColumnVisibilityModel, GridPaginationModel, GridSortModel
} from '@mui/x-data-grid-pro';
import {diff} from 'deep-object-diff';
import {IWebsite} from "@/app/models/Website";
import {Box, Chip, debounce, Divider, InputLabel, LinearProgress, Paper} from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import {useCallback, useEffect} from "react";
import ReactDOM from "react-dom";
import Button from "@mui/material/Button";
import SaveFilterViewModal from "@/app/ui/SaveFilterViewModal";
import {useSearchParams} from "next/navigation";
import {getFiltersView} from "@/app/actions/filterViewsActions";
import {getWebsitesListing, getWebsitesTable, IWebsiteTable, tableSourceField} from "@/app/actions/websiteActions";
import {IFiltersView} from "@/app/models/FiltersView";
import UpdateFilterViewModal from "@/app/ui/UpdateFilterViewModal";
import useRightDrawerStore from "@/app/lib/uiStore";
import ViewItem from "@/app/ui/ViewItem";
import Typography from "@mui/material/Typography";
import WebsitesInfoGrid from "@/app/ui/WebsitesInfoGrid";
import ComponentInfo from "@/app/ui/ComponentInfo";
import {UpdateInfo} from "@/app/models";
import Link from "@/app/ui/Link";
import {GridFilterPanel} from "@mui/x-data-grid";
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
const prepareColumnsVisibility = (headers?: { id: string, label: string}[]) => {
    const cols: { [key: string]: boolean } = {
        frameworkVersion: true,
        componentsNumber: true,
        componentsUpdatedNumber: true,
        componentsWithUpdatesNumber: true,
        componentsWithSecurityUpdatesNumber: true,
    }
    for (const [key, value] of Object.entries(headers || {})) {
        if(value.id === 'frameworkVersion') continue;
        cols[value.id] = false;
    }
    return cols;
}

const prepareColumns = (viewMore: (title: React.ReactNode | string, content: React.ReactNode | string) => void, headers?: { id: string, label: string, type?: string}[], websites: IWebsite[] = []): GridColDef[] => {

    const cols: GridColDef[] = [
        { field: 'siteName', headerName: 'Website Name', flex: 1, minWidth: 450,
            align: 'left',
            headerAlign: 'left',
            type: 'singleSelect',
            valueOptions: (websites || []).filter((website) => website.title !== undefined).map((website) => website.title),
            renderCell: (params: GridRenderCellParams<GridRow, GridRow['siteName']>) => (
                params.value && (
                    <>
                        <Box>
                            <Link href={`/websites/${params.row.id}`} sx={{textDecoration: 'none', color: 'inherit'}}>
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
        if(value.id === 'frameworkVersion') continue;
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
                    label: value.type === 'component' ? 'No Installed' : 'Empty',
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
                    label: value.type === 'component' ? 'Installed' : 'Not Empty',
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
                            }}/>)}
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
                            }}/>)}
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
                            }}/>)}
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
                            }}/>)}
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
                            }}/>)}
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
                            }}/>)}
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


const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 10,
    '& .no-rows-primary': {
        fill: theme.palette.mode === 'light' ? '#AEB8C2' : '#3D4751',
    },
    '& .no-rows-secondary': {
        fill: theme.palette.mode === 'light' ? '#E8EAED' : '#1D2126',
    },
}));

function CustomNoRowsOverlay() {
    return (
        <StyledGridOverlay>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                width={96}
                viewBox="0 0 452 257"
                aria-hidden
                focusable="false"
            >
                <path
                    className="no-rows-primary"
                    d="M348 69c-46.392 0-84 37.608-84 84s37.608 84 84 84 84-37.608 84-84-37.608-84-84-84Zm-104 84c0-57.438 46.562-104 104-104s104 46.562 104 104-46.562 104-104 104-104-46.562-104-104Z"
                />
                <path
                    className="no-rows-primary"
                    d="M308.929 113.929c3.905-3.905 10.237-3.905 14.142 0l63.64 63.64c3.905 3.905 3.905 10.236 0 14.142-3.906 3.905-10.237 3.905-14.142 0l-63.64-63.64c-3.905-3.905-3.905-10.237 0-14.142Z"
                />
                <path
                    className="no-rows-primary"
                    d="M308.929 191.711c-3.905-3.906-3.905-10.237 0-14.142l63.64-63.64c3.905-3.905 10.236-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-63.64 63.64c-3.905 3.905-10.237 3.905-14.142 0Z"
                />
                <path
                    className="no-rows-secondary"
                    d="M0 10C0 4.477 4.477 0 10 0h380c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 20 0 15.523 0 10ZM0 59c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 69 0 64.523 0 59ZM0 106c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 153c0-5.523 4.477-10 10-10h195.5c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 200c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 247c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10Z"
                />
            </svg>
            <Typography sx={{ mt: 2, textAlign: "center" }} variant={'h2'}>No websites currently match the specified criteria yet, which may indicate that there are no sites requiring attention at this time. However, an alert will be triggered as soon as any website meets these parameters.</Typography>
        </StyledGridOverlay>
    );
}

export default function AlertWebsitePreviewGrid(
    {filters, workspaceId, gridData}:
    {
        gridData: {data: IWebsiteTable[], count: number, extraHeaders: {id: string, label: string}[]},
        filters?: GridFilterModel,
        workspaceId?: string
    }
) {
    const [isWebsitesLoading, setIsWebsitesLoading] = React.useState<boolean>(true);
    const [columnsVisibility, setColumnsVisibility] = React.useState<GridColumnVisibilityModel>();
    const [columns, setColumns] = React.useState<GridColDef[]>([]);
    const [websites, setWebsites] = React.useState<GridRow[]>([])
    const [websiteListing, setWebsiteListing] = React.useState<IWebsite[]>([]);
    const [rowCount, setRowCount] = React.useState<number>(0);
    const [extraHeader, setExtraHeader] = React.useState<{ id: string, label: string}[]>([]);
    const openRightDrawer = useRightDrawerStore((state) => state.openRightDrawer);
    // Inside your AlertsWebsitesPreviewGrid component

    const getWebsites = async (data?: {
        filters?: GridFilterModel,
        pagination?: GridPaginationModel
        sort?: GridSortModel
    }) => {
        setIsWebsitesLoading(true);

        setWebsiteListing([]);
        const {data: websites, extraHeaders, count} = gridData
        setRowCount(count);
        const WebsiteRows: GridRow[] = websites.map((website) => {
            const websiteData: GridRow = {
                id: website.id,
                url: website.url,
                favicon: website.favicon,
                siteName: website.title ? website.title : website.url,
                type: website.type,
                types: website.type ? [website.type.name, ...(website.type.subTypes.map((subType) => subType.name))] : [],
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
                if (!websiteData[key]) {
                    if (typeof value === 'object') {
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
        setColumnsVisibility(prepareColumnsVisibility(extraHeaders));
        setColumns(prepareColumns(openRightDrawer, extraHeaders, []));
        setIsWebsitesLoading(false);
        return {
            websites: WebsiteRows,
            extraHeaders: extraHeaders,
            count: count
        }
    }
    useEffect(() => {
        setColumns(prepareColumns(openRightDrawer, [], []))
        if (extraHeader.length) {
            setColumnsVisibility(prepareColumnsVisibility(extraHeader));
        }
        getWebsites({
            filters: filters
        }).then((data) => {
            setColumnsVisibility(prepareColumnsVisibility(data?.extraHeaders));
            setColumns(prepareColumns(openRightDrawer, data?.extraHeaders, websiteListing))
        });
    }, [workspaceId]);

    return columns.length ? (
        <div style={{ width: '100%' }}>
            <Paper id="header" sx={{ mb: 2 }} />
            <Divider sx={{my: 1}}/>
            <InputLabel id="interval-unit-select-label" sx={{my: 1}}>Results Preview ({rowCount})</InputLabel>
            <DataGridPro
                autoHeight={true}
                sx={{ '--DataGrid-overlayHeight': '300px' }}
                slots={{
                    loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],
                    noRowsOverlay: CustomNoRowsOverlay,
                    footer: undefined
                }}
                loading={isWebsitesLoading}
                rows={websites}
                columns={columns}
                rowSelection={false}
                onColumnVisibilityModelChange={(model) => {
                    setColumnsVisibility(model);  // save columns visibility
                }}
                filterModel={filters}
                columnVisibilityModel={columnsVisibility}
                pagination={true}
                rowCount={rowCount}
                pageSizeOptions={[1, 2, 3]}
            />
        </div>
    ) : <LinearProgress></LinearProgress>;
}