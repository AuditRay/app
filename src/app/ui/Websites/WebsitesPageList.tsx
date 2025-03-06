'use client'

import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";
import React from "react";
import {
    frameWorkUpdateStatus,
    getWebsitesPage,
    getWorkspaceTags,
    IWebsitePage,
    Pagination as PaginationType
} from "@/app/actions/websiteActions";
import {getFolder, getFolders} from "@/app/actions/folderActions";
import {IFolder, ITeam, ITeamPopulated} from "@/app/models";
import {
    Box,
    debounce,
    Grid2 as Grid,
    Input,
    PaginationItem,
    Pagination,
    FormControlLabel,
    Switch,
    Autocomplete, Chip
} from "@mui/material";
import WebsiteComponent from "@/app/ui/Websites/WebsiteComponent";
import Typography from "@mui/material/Typography";
import {LoadingScreen} from "@/components/loading-screen";
import TextField from "@mui/material/TextField";
import Link from "@/app/ui/Link";
import Button from "@mui/material/Button";
import {getTeams} from "@/app/actions/teamActions";
import SaveListModal from "@/app/ui/Lists/SaveListModal";
import {IList} from "@/app/models/List";
import {getList} from "@/app/actions/filterViewsActions";
import UpdateFilterViewModal from "@/app/ui/Lists/UpdateListModal";

function useDebounce(cb: any, delay: number) {
    const [debounceValue, setDebounceValue] = React.useState(cb);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceValue(cb);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [cb, delay]);
    return debounceValue;
}

export default function WebsitesPageList({workspaceId, folderId, filterId}: {workspaceId: string, folderId?: string, filterId?: string}) {
    const router = useRouter();
    const params = useSearchParams();
    const pathname = usePathname();
    const urlParams = useParams<{
        workspaceId: string,
        folderId?: string,
        viewId?: string
    }>()

    const [isLoading, setIsLoading] = React.useState<boolean>(true)
    const [folder, setFolder] = React.useState<IFolder & {websitesList: IWebsitePage[], pagination: PaginationType} | null>(null)

    const [saveListOpen, setSaveListOpen] = React.useState(false);
    const [updateListOpen, setUpdateListOpen] = React.useState(false);
    const load = async (filters?: {
        text?: string;
        name?: string;
        type?: string[];
        folder?: string[];
        tags?: string[];
        team?: string[];
        status?: string[];
    }) => {
        const folderIdInfo = filterId ? 'all' : folderId || urlParams.folderId || 'all'
        const page = params.get('page') ? parseInt(params.get('page') as string) - 1 : 0
        console.log('load', workspaceId, folderIdInfo);
        let folderData;
        if(filters?.text || filters?.name || filters?.type || filters?.folder || filters?.tags || filters?.team || filters?.status) {
            folderData = await getFolder(workspaceId, folderIdInfo, {
                page,
                pageSize: 12
            }, {text: filters.text, tags: filters.tags, name: filters.name, folder: filters.folder, type: filters.type, team: filters.team, status: filters?.status})
        } else {
            folderData = await getFolder(workspaceId, folderIdInfo, {
                page,
                pageSize: 12
            })
        }
        console.log('folderData', folderData);
        setFolder(folderData)
        setIsLoading(false)
    }


    const [list, setList] = React.useState<IList>()
    const [workspaceTags, setWorkspaceTags] = React.useState<string[]>([])
    const [workspaceFolders, setWorkspaceFolders] = React.useState<IFolder[]>([])
    const [workspaceTeams, setWorkspaceTeams] = React.useState<ITeamPopulated[]>([]);
    const [searchTags, setSearchTags] = React.useState<string[]>([])
    const [searchFolder, setSearchFolder] = React.useState<string[]>([])
    const [searchTeams, setSearchTeams] = React.useState<string[]>([])
    const [searchType, setSearchType] = React.useState<string[]>(['Drupal', 'Wordpress', 'Other'])
    const [searchStatus, setSearchStatus] = React.useState<frameWorkUpdateStatus[]>(['Up to Date', 'Needs Update', 'Security Update', 'Not Supported', 'Unknown'])
    const [searchVal, setSearchVal] = React.useState("");
    const [searchNameVal, setSearchNameVal] = React.useState("");
    const [searchValueSet, setSearchValueSet] = React.useState(false);
    const [searchNameValueSet, setSearchNameValueSet] = React.useState(false);
    const [searchValueOldValue, setSearchValueOldValue] = React.useState("");
    const [searchNameValueOldValue, setSearchNameValueOldValue] = React.useState("");
    const [showAdvancedSearch, setShowAdvancedSearch] = React.useState(false);

    const debounceValue = useDebounce(searchVal, 500);
    const debounceNameValue = useDebounce(searchNameVal, 500);
    React.useEffect(() => {
        if(!filterId) return;
        const load = async () => {
            const list = await getList(filterId);
            if(list) {
                setList(list);
                setSearchVal(list.filters.text || '');
                setSearchNameVal(list.filters.name || '');
                setSearchTags(list.filters.tags || []);
                setSearchFolder(list.filters.folder || []);
                setSearchTeams(list.filters.team || []);
                setSearchType(list.filters.type || []);
                setSearchStatus(list.filters.status || []);
            } else {
                setList(undefined);
            }
        }
        load().then().catch();
    }, [filterId])
    React.useEffect(() => {
        if(!workspaceId) return;
        const load = async () => {
            const tags = await getWorkspaceTags(workspaceId);
            const teams = await getTeams(workspaceId);
            const folders = await getFolders(workspaceId);
            if(tags) {
                setWorkspaceTags(tags);
            } else {
                setWorkspaceTags([])
            }
            if (teams) {
                setWorkspaceTeams(teams);
            } else {
                setWorkspaceTeams([]);
            }
            if (folders) {
                setWorkspaceFolders(folders);
            } else {
                setWorkspaceFolders([]);
            }
        }
        load().then().catch();
    }, [workspaceId])
    React.useEffect(() => {
        setIsLoading(true);
        if(filterId && !list) return;
        if(searchVal || searchNameVal || searchTags.length > 0 || searchFolder.length > 0 || searchTeams.length > 0 || searchType.length > 0 || searchStatus.length > 0) {
            setSearchValueSet(true);
            if(!searchValueOldValue) {
                setSearchValueOldValue(searchVal);
            }
            if(!searchNameValueOldValue) {
                setSearchNameValueOldValue(searchNameVal);
            }
            if(searchValueOldValue !== searchVal && params.get('page')) {
                setSearchValueSet(false);
                setSearchValueOldValue(searchVal);
                router.push(pathname);
                return;
            }
            if(searchNameValueOldValue !== searchNameVal && params.get('page')) {
                setSearchNameValueSet(false);
                setSearchNameValueOldValue(searchNameVal);
                router.push(pathname);
                return;
            }
            console.log('filters', {
                text: searchVal ? searchVal : undefined,
                name: searchNameVal ? searchNameVal : undefined,
                tags: searchTags.length > 0 ? searchTags : undefined,
            });
            load({
                text: searchVal ? searchVal : undefined,
                name: searchNameVal ? searchNameVal : undefined,
                tags: searchTags.length > 0 ? searchTags : undefined,
                folder: searchFolder.length > 0 ? searchFolder : undefined,
                team: searchTeams.length > 0 ? searchTeams : undefined,
                type: searchType.length > 0 ? searchType : undefined,
                status: searchStatus.length > 0 ? searchStatus : undefined
            }).then().catch(() => setIsLoading(false))
        } else {
            if(searchValueSet) {
                setSearchValueSet(false);
                if (params.get('page')) {
                    router.push(pathname);
                    return;
                }
            }
            if(searchNameValueSet) {
                setSearchNameValueSet(false);
                if (params.get('page')) {
                    router.push(pathname);
                    return;
                }
            }
            console.log('page', params.get('page'));
            load().then().catch(() => setIsLoading(false))
        }
    }, [workspaceId, folderId, params, debounceValue, debounceNameValue, searchTags, searchFolder, searchTeams, searchType, searchStatus]);


    React.useEffect(() => {
        console.log("Debounced:", searchVal);
        if(!searchVal && !searchNameVal) {
            return
        }
        setIsLoading(true);
    }, [debounceValue, debounceNameValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSearchVal(e.target.value);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSearchNameVal(e.target.value);
    }
    return (
        <div>
            <Box>
                <TextField
                    autoFocus
                    margin="dense"
                    id="search"
                    label="Search"
                    type="text"
                    placeholder={'Search by name, url, type or tags'}
                    fullWidth
                    variant="outlined"
                    value={searchVal}
                    onChange={handleChange}
                />
            </Box>
            <Box sx={{textAlign: "right"}}>
                <Typography variant={'caption'} sx={{mt: 2, cursor: "pointer"}} onClick={() => {
                    setShowAdvancedSearch(!showAdvancedSearch)
                }}>Advanced Search {showAdvancedSearch ? "<" : ">"}</Typography>
            </Box>
            {showAdvancedSearch && (

                <Box>
                    {saveListOpen && (
                        <SaveListModal open={saveListOpen} setOpenAction={setSaveListOpen} filters={{
                            text: searchVal,
                            name: searchNameVal,
                            type: searchType,
                            folder: searchFolder,
                            team: searchTeams,
                            tags: searchTags,
                            status: searchStatus
                        }}/>
                    )}
                    {updateListOpen && list && (
                        <UpdateFilterViewModal open={updateListOpen} list={list} setOpenAction={setUpdateListOpen} filters={{
                            text: searchVal,
                            name: searchNameVal,
                            type: searchType,
                            folder: searchFolder,
                            team: searchTeams,
                            tags: searchTags,
                            status: searchStatus
                        }}/>
                    )}
                    <Typography variant={'caption'}>Name & Tags</Typography>
                    <Box>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            type="text"
                            placeholder={'Name'}
                            fullWidth
                            variant="outlined"
                            value={searchNameVal}
                            onChange={handleNameChange}
                        />

                        <Autocomplete
                            multiple
                            id="tags"
                            options={workspaceTags}
                            autoSelect={true}
                            value={searchTags}
                            onChange={(event, newValue) => {
                                setSearchTags(newValue)
                            }}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => {
                                    const { key, ...tagProps } = getTagProps({ index });
                                    return (
                                        <Chip variant="outlined" label={option} key={key} {...tagProps} />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin={'dense'}
                                    disabled={false}
                                    error={false}
                                    helperText={''}
                                    variant="outlined"
                                    label="Tags"
                                    placeholder="tags"
                                />
                            )}
                        />
                    </Box>
                    <Typography variant={'caption'}>Folder & Teams</Typography>
                    <Box>
                        <Autocomplete
                            multiple
                            id="folders"
                            options={workspaceFolders}
                            getOptionLabel={(option) => option.name}
                            getOptionKey={(option) => option.id}
                            autoSelect={true}
                            value={workspaceFolders.filter((folder) => searchFolder.includes(folder.id))}
                            onChange={(event, newValue) => {
                                setSearchFolder(newValue.map((folder) => folder.id))
                            }}
                            renderTags={(value: readonly IFolder[], getTagProps) =>
                                value.map((option: IFolder, index: number) => {
                                    const { key, ...tagProps } = getTagProps({ index });
                                    return (
                                        <Chip variant="outlined" label={option.name} key={key} {...tagProps} />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin={'dense'}
                                    disabled={false}
                                    error={false}
                                    helperText={''}
                                    variant="outlined"
                                    label="Folders"
                                    placeholder="Folders"
                                />
                            )}
                        />
                        <Autocomplete
                            multiple
                            id="teams"
                            options={workspaceTeams}
                            getOptionLabel={(option) => option.name}
                            getOptionKey={(option) => option.id}
                            autoSelect={true}
                            value={workspaceTeams.filter((team) => searchTeams.includes(team.id))}
                            onChange={(event, newValue) => {
                                setSearchTeams(newValue.map((team) => team.id))
                            }}
                            renderTags={(value: readonly ITeamPopulated[], getTagProps) =>
                                value.map((option: ITeamPopulated, index: number) => {
                                    const { key, ...tagProps } = getTagProps({ index });
                                    return (
                                        <Chip variant="outlined" label={option.name} key={key} {...tagProps} />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin={'dense'}
                                    disabled={false}
                                    error={false}
                                    helperText={''}
                                    variant="outlined"
                                    label="Teams"
                                    placeholder="Teams"
                                />
                            )}
                        />
                    </Box>
                    <Typography variant={'caption'}>Type</Typography>
                    <Box>
                        <FormControlLabel control={<Switch checked={searchType.includes('Drupal')} onChange={
                            (e) => {
                                if(e.target.checked) {
                                    setSearchType([...searchType, 'Drupal'])
                                } else {
                                    setSearchType(searchType.filter((type) => type !== 'Drupal'))
                                }
                            }
                        }/>} label="Drupal" />

                        <FormControlLabel control={<Switch  checked={searchType.includes('Wordpress')} onChange={
                            (e) => {
                                if(e.target.checked) {
                                    setSearchType([...searchType, 'Wordpress'])
                                } else {
                                    setSearchType(searchType.filter((type) => type !== 'Wordpress'))
                                }
                            }
                        }/>} label="Wordpress" />
                        <FormControlLabel control={<Switch  checked={searchType.includes('Other')} onChange={
                            (e) => {
                                if(e.target.checked) {
                                    setSearchType([...searchType, 'Other'])
                                } else {
                                    setSearchType(searchType.filter((type) => type !== 'Other'))
                                }
                            }
                        }/>} label="Other" />
                    </Box>
                    <Typography variant={'caption'}>Status</Typography>
                    <Box>
                        <FormControlLabel control={<Switch  checked={searchStatus.includes('Up to Date')} onChange={
                            (e) => {
                                if(e.target.checked) {
                                    setSearchStatus([...searchStatus, 'Up to Date'])
                                } else {
                                    setSearchStatus(searchStatus.filter((type) => type !== 'Up to Date'))
                                }
                            }
                        }/>} label="Updated" />
                        <FormControlLabel control={<Switch checked={searchStatus.includes('Needs Update')}  defaultChecked onChange={
                            (e) => {
                                if(e.target.checked) {
                                    setSearchStatus([...searchStatus, 'Needs Update'])
                                } else {
                                    setSearchStatus(searchStatus.filter((type) => type !== 'Needs Update'))
                                }
                            }
                        }/>} label="Needs Update" />
                        <FormControlLabel control={<Switch checked={searchStatus.includes('Security Update')} onChange={
                            (e) => {
                                if(e.target.checked) {
                                    setSearchStatus([...searchStatus, 'Security Update'])
                                } else {
                                    setSearchStatus(searchStatus.filter((type) => type !== 'Security Update'))
                                }
                            }
                        }/>} label="Security Update" />
                        <FormControlLabel control={<Switch checked={searchStatus.includes('Not Supported')} onChange={
                            (e) => {
                                if(e.target.checked) {
                                    setSearchStatus([...searchStatus, 'Not Supported'])
                                } else {
                                    setSearchStatus(searchStatus.filter((type) => type !== 'Not Supported'))
                                }
                            }
                        }/>} label="Not Supported" />
                        <FormControlLabel control={<Switch checked={searchStatus.includes('Unknown')} onChange={
                            (e) => {
                                if(e.target.checked) {
                                    setSearchStatus([...searchStatus, 'Unknown'])
                                } else {
                                    setSearchStatus(searchStatus.filter((type) => type !== 'Unknown'))
                                }
                            }
                        }/>} label="Unknown" />
                    </Box>
                    <Box sx={{textAlign: "right"}}>
                        {(filterId) ? (
                                <Button variant={'outlined'} onClick={() => {
                                    setUpdateListOpen(true);
                                }}>Update List</Button>
                            ) : (
                                <Button variant={'outlined'} onClick={() => {
                                    setSaveListOpen(true);
                                }}>Save List</Button>
                            )
                        }
                    </Box>
                </Box>
            )}
            {isLoading ? (
                <Box sx={{mt: 5}}>
                    <LoadingScreen />
                </Box>
            ) : (
                <>
                    <Grid container spacing={2} sx={{mt: 5}}>
                        {folder?.websitesList?.length && folder?.websitesList?.length > 0 ? folder?.websitesList?.map((website, index) => (
                            <Grid size={{
                                xs: 12,
                                md: 4
                            }} key={`folder-${index}`}>
                                <WebsiteComponent workspaceId={workspaceId} website={website}></WebsiteComponent>
                            </Grid>
                        )) : (
                            <Typography variant={'body1'}>No websites found</Typography>
                        )}
                    </Grid>
                    {folder?.pagination?.totalPages && folder?.pagination?.totalPages > 1 ? (
                        <Box sx={{justifyContent: 'center', mt: 2, display: 'flex'}}>
                            <Pagination
                                count={folder?.pagination?.totalPages}
                                page={params.get('page') ? parseInt(params.get('page') as string) : 1}
                                variant="outlined"
                                shape="rounded"
                                renderItem={(item) => (
                                    // @ts-ignore
                                    <PaginationItem
                                        component={Link}
                                        href={`${item.page === 1 ? '?page=1' : `?page=${item.page}`}`}
                                        {...item}
                                    />
                                )}
                            />
                        </Box>
                    ) : (
                        <></>
                    )}
                </>
            )}
        </div>
    )
}