'use client';
import {Box, Tab, Tabs} from "@mui/material";
import * as React from "react";
import {DataSource, DefaultView} from "@/app/models/WebsiteView";
import {IWebsite} from "@/app/models/Website";
import AddIcon from "@mui/icons-material/Add";
import MoreVert from "@mui/icons-material/MoreVert";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import {useRouter} from "next/navigation";
import {RichTreeView, TreeViewBaseItem, TreeViewItemId, useTreeViewApiRef} from "@mui/x-tree-view";
import {IWebsiteInfo} from "@/app/models/WebsiteInfo";
import {useEffect} from "react";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import {green} from "@mui/material/colors";
import {createWebsiteView, deleteWebsiteView, updateWebsiteView} from "@/app/actions/websiteViewsActions";

function TabContent(props: { websiteId: string, view: DefaultView, vertOnClick: () => void }) {
    const { websiteId, view , vertOnClick} = props;
    return (
        <Box sx={{display: 'flex'}}>
            <Typography sx={{textDecoration: 'none', color: 'inherit', mb: 0.3}}>{view.title}</Typography>
            {!view.isDefault && (
                <Box sx={{ml: 1, display: 'none'}} className={'innerBox'}>
                    <MoreVert fontSize="small" sx={{'&:hover': {color: 'red'}}} onClick={(e) => vertOnClick()}/>
                </Box>
            )}
        </Box>
    );
}
function getItemDescendantsIds(item: TreeViewBaseItem) {
    const ids: string[] = [];
    item.children?.forEach((child) => {
        ids.push(child.id);
        ids.push(...getItemDescendantsIds(child));
    });
    return ids;
}

const getAllItemsWithChildrenItemIds = (items: TreeViewBaseItem[]) => {
    const itemIds: TreeViewItemId[] = [];
    const registerItemId = (item: TreeViewBaseItem) => {
        if (item.children?.length) {
            itemIds.push(item.id);
            item.children.forEach(registerItemId);
        }
    };

    items.forEach(registerItemId);

    return itemIds;
};

export default function WebsitesTabs(props: { website: IWebsite, selectedViewId: string, views: DefaultView[], websiteInfo: IWebsiteInfo }) {
    const { views: websiteViews, website, selectedViewId, websiteInfo } = props;
    const [open, setOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const router = useRouter();
    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
    const [selectedEditItems, setSelectedEditItems] = React.useState<string[]>([]);
    const [viewName, setViewName] = React.useState<string>('');
    const [items, setItems] = React.useState<TreeViewBaseItem[]>([]);
    const toggledItemRef = React.useRef<{ [itemId: string]: boolean }>({});
    const apiRef = useTreeViewApiRef();
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedView, setSelectedView] = React.useState<DefaultView | null>(null);
    useEffect(() => {
        //format websiteInfo.dataSourcesInfo to TreeViewBaseItem
        const items: TreeViewBaseItem[] = [];
        websiteInfo.dataSourcesInfo.forEach((item) => {
            items.unshift({
                id: item.id,
                label: item.label || '',
                children: item.data?.map((child) => ({
                    id: child.id,
                    label: child.label || child.id,
                    parentId: item.id,
                })),
            });
        });
        setItems(items);
    }, [websiteInfo, websiteInfo.dataSourcesInfo]);

    useEffect(() => {
        //format websiteInfo.dataSourcesInfo to TreeViewBaseItem
        setExpandedItems(getAllItemsWithChildrenItemIds(items));
    }, [items]);

    const handleItemSelectionToggle = (
        event: React.SyntheticEvent,
        itemId: string,
        isSelected: boolean,
    ) => {
        toggledItemRef.current[itemId] = isSelected;
        const item = apiRef.current!.getItem(itemId);
    };

    const handleSelectedItemsChange = (
        event: React.SyntheticEvent,
        newSelectedItems: string[],
    ) => {
        setSelectedItems(newSelectedItems);

        // Select / unselect the children of the toggled item
        const itemsToSelect: string[] = [];
        const itemsToUnSelect: { [itemId: string]: boolean } = {};
        Object.entries(toggledItemRef.current).forEach(([itemId, isSelected]) => {
            const item = apiRef.current!.getItem(itemId);
            if (isSelected) {
                itemsToSelect.push(...getItemDescendantsIds(item));
            } else {
                getItemDescendantsIds(item).forEach((descendantId) => {
                    itemsToUnSelect[descendantId] = true;
                });
            }
        });

        const newSelectedItemsWithChildren = Array.from(
            new Set(
                [...newSelectedItems, ...itemsToSelect].filter(
                    (itemId) => !itemsToUnSelect[itemId],
                ),
            ),
        );

        setSelectedItems(newSelectedItemsWithChildren);

        toggledItemRef.current = {};
    };

    const handleEditItemSelectionToggle = (
        event: React.SyntheticEvent,
        itemId: string,
        isSelected: boolean,
    ) => {
        toggledItemRef.current[itemId] = isSelected;
        const item = apiRef.current!.getItem(itemId);
    };

    const handleEditSelectedItemsChange = (
        event: React.SyntheticEvent,
        newSelectedItems: string[],
    ) => {
        setSelectedEditItems(newSelectedItems);

        // Select / unselect the children of the toggled item
        const itemsToSelect: string[] = [];
        const itemsToUnSelect: { [itemId: string]: boolean } = {};
        Object.entries(toggledItemRef.current).forEach(([itemId, isSelected]) => {
            const item = apiRef.current!.getItem(itemId);
            if (isSelected) {
                itemsToSelect.push(...getItemDescendantsIds(item));
            } else {
                getItemDescendantsIds(item).forEach((descendantId) => {
                    itemsToUnSelect[descendantId] = true;
                });
            }
        });

        const newSelectedItemsWithChildren = Array.from(
            new Set(
                [...newSelectedItems, ...itemsToSelect].filter(
                    (itemId) => !itemsToUnSelect[itemId],
                ),
            ),
        );

        setSelectedEditItems(newSelectedItemsWithChildren);

        toggledItemRef.current = {};
    };

    return (
        <Box>
            <Tabs value={selectedViewId} aria-label="basic tabs example">
                <Tab value='' label="Updates"
                     onClick={(e: any) => {
                         router.push(`/websites/${website.id}`)
                     }}

                     sx={{mb: 0.4}}
                />
                {websiteViews && websiteViews.map((view) => (
                    <Tab value={view.id} key={view.id}
                         label={<TabContent websiteId={website.id} view={view} vertOnClick={() => {
                             console.log('vertOnClick', view)
                                setSelectedView(view);
                                const selectedItems: string[] = [...view.dataSources.flatMap((item) => {
                                    return item.fields
                                })]
                                setSelectedEditItems(selectedItems);
                                setEditOpen(true);
                         }}/>}
                         sx={{
                            '&:hover': {
                                '.innerBox': {
                                    display: 'flex',
                                },
                            }
                        }}
                        onClick={(e: any) => {
                            console.log(e.target.tagName);
                            if (e.target.tagName === 'svg') {
                                e.preventDefault();
                            } else {
                                router.push(`/websites/${website.id}/${view.id}`)
                            }
                        }}
                    />
                ))}
                <Tab icon={<AddIcon/>} onClick={() => setOpen(true)}/>
            </Tabs>
            {selectedView && (
                <Dialog
                    open={deleteOpen}
                    fullWidth={true}
                    maxWidth={'md'}
                    onClose={() => {
                        setDeleteOpen(false);
                    }}
                >
                    <DialogTitle>Delete View</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this view? This action cannot be undone.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=> setDeleteOpen(false)}>No</Button>
                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Button variant={'contained'} color={'error'} onClick={()=> {
                                setIsSaving(true);
                                async function deleteView() {
                                    if (!selectedView) return null;
                                    await deleteWebsiteView(selectedView.id);
                                }
                                deleteView().then(() => {
                                    setIsSaving(false);
                                    setDeleteOpen(false);
                                    setSelectedView(null);
                                }).catch((e) => {
                                    setIsSaving(false);
                                    console.error(e);
                                    setError('Error creating view, please try again.');
                                });
                            }}>{isSaving ? 'Deleting...' : 'Yes'} </Button>
                            {isSaving && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: green[500],
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                    }}
                                />
                            )}
                        </Box>
                    </DialogActions>
                </Dialog>
            )}
            {selectedView && (
                <Dialog
                    open={editOpen}
                    fullWidth={true}
                    maxWidth={'md'}
                    onClose={() => {
                        setEditOpen(false);
                    }}
                >
                    <DialogTitle>Update View</DialogTitle>
                    <DialogContent>
                        {error && <Typography color={'error'}>{error}</Typography>}
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            name="viewName"
                            label="View Name"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={selectedView?.title}
                            onChange={(e) => {
                                setSelectedView({
                                    ...selectedView,
                                    title: e.target.value
                                })
                            }}
                            placeholder={'Enter view name'}
                        />
                        <Box sx={{flexGrow: 1, mt: 2}}>
                            <Typography component={'label'}>View Data</Typography>
                            <RichTreeView
                                multiSelect
                                checkboxSelection
                                expandedItems={expandedItems}
                                apiRef={apiRef}
                                items={items}
                                selectedItems={selectedEditItems}
                                onSelectedItemsChange={handleEditSelectedItemsChange}
                                onItemSelectionToggle={handleEditItemSelectionToggle}
                                sx={{border: '1px solid #ccc', borderRadius: 4, mt:2}}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=> setDeleteOpen(true)} color={'error'} variant={'contained'} sx={{ml: 2, mr: 'auto'}}>Delete</Button>
                        <Button onClick={()=> setEditOpen(false)}>Close</Button>
                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Button variant={'contained'} onClick={()=> {
                                setIsSaving(true);
                                async function update() {
                                    if(!selectedView) {
                                        throw new Error('No view selected');
                                    }
                                    const dataSources: DataSource[] = [];
                                    selectedEditItems.forEach((itemId) => {
                                        const item = apiRef.current!.getItem(itemId);
                                        if(item?.parentId) {
                                            const checkParent = dataSources.find((d) => d.id === item.parentId);
                                            if(!checkParent) {
                                                dataSources.push({
                                                    id: item.parentId,
                                                    fields: [itemId],
                                                });
                                            } else {
                                                if(!checkParent.fields.includes(itemId)) {
                                                    checkParent.fields.push(itemId);
                                                }
                                            }
                                        } else {
                                            const checkParent = dataSources.find((d) => d.id === itemId);
                                            if(!checkParent) {
                                                dataSources.push({
                                                    id: itemId,
                                                    fields: [],
                                                });
                                            }
                                        }
                                    });
                                    await updateWebsiteView(selectedView, {
                                        title: selectedView.title,
                                        dataSources,
                                    })
                                }
                                update().then(() => {
                                    setIsSaving(false);
                                    setEditOpen(false);
                                    setSelectedView(null);
                                    setSelectedEditItems([]);
                                }).catch((e) => {
                                    setIsSaving(false);
                                    console.error(e);
                                    setError('Error creating view, please try again.');
                                });
                            }}>{isSaving ? 'Saving...' : 'Update'} </Button>
                            {isSaving && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: green[500],
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                    }}
                                />
                            )}
                        </Box>
                    </DialogActions>
                </Dialog>
            )}
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'md'}
                onClose={() => {
                    setOpen(false);
                }}
            >
                <DialogTitle>Add New View</DialogTitle>
                <DialogContent>
                    {error && <Typography color={'error'}>{error}</Typography>}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="viewName"
                        label="View Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={viewName}
                        onChange={(e) => setViewName(e.target.value)}
                        placeholder={'Enter view name'}
                    />
                    <Box sx={{ flexGrow: 1, mt: 2}}>
                        <Typography component={'label'}>View Data</Typography>
                        <RichTreeView
                            multiSelect
                            checkboxSelection
                            apiRef={apiRef}
                            items={items}
                            selectedItems={selectedItems}
                            onSelectedItemsChange={handleSelectedItemsChange}
                            onItemSelectionToggle={handleItemSelectionToggle}
                            sx={{border: '1px solid #ccc', borderRadius: 4, mt:2}}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=> setOpen(false)}>Close</Button>
                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button onClick={()=> {
                            setIsSaving(true);
                            async function create() {
                                const dataSources: DataSource[] = [];
                                selectedItems.forEach((itemId) => {
                                    const item = apiRef.current!.getItem(itemId);
                                    if(item?.parentId) {
                                        const checkParent = dataSources.find((d) => d.id === item.parentId);
                                        if(!checkParent) {
                                            dataSources.push({
                                                id: item.parentId,
                                                fields: [itemId],
                                            });
                                        } else {
                                            if(!checkParent.fields.includes(itemId)) {
                                                checkParent.fields.push(itemId);
                                            }
                                        }
                                    } else {
                                        const checkParent = dataSources.find((d) => d.id === itemId);
                                        if(!checkParent) {
                                            dataSources.push({
                                                id: itemId,
                                                fields: [],
                                            });
                                        }
                                    }
                                });
                                await createWebsiteView(website.id, {
                                    title: viewName,
                                    dataSources,
                                })
                            }
                            create().then(() => {
                                setIsSaving(false);
                                setOpen(false);
                                setViewName('');
                                setSelectedItems([]);
                            }).catch((e) => {
                                setIsSaving(false);
                                console.error(e);
                                setError('Error creating view, please try again.');
                            });
                        }}>{isSaving ? 'Saving...' : 'Add'} </Button>
                        {isSaving && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: green[500],
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}