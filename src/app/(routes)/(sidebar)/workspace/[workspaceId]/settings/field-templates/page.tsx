'use client'
import * as React from "react";
import {
    Box,
    Divider,
    FormControl,
    Grid, IconButton,
    InputLabel, List, ListItem,
    Select
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { useRouter } from 'next/navigation';
import {Field, IFieldsTemplate, IUser} from "@/app/models";
import Button from "@mui/material/Button";
import {styled} from "@mui/material/styles";
import {getWorkspaceFieldTemplate, updateFieldsTemplate} from "@/app/actions/fieldTemplateActions";
import {v4 as uuidV4} from "uuid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import {useState} from "react";
import CircularProgress from "@mui/material/CircularProgress";
import {green} from "@mui/material/colors";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from '@mui/icons-material/Edit';

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
            <Box sx={{ mt: 2 }}>No rows</Box>
        </StyledGridOverlay>
    );
}

export default function Settings({params}: {params: Promise<{workspaceId: string}>}) {
    const { workspaceId } = React.use(params);
    //const [user, setUser] = React.useState<IUser | null>(null);
    //const [nameError, setNameError] = useState<string>('');
    //const [fieldsTemplates, setFieldsTemplates] = React.useState<IFieldsTemplate[]>([]);
    const [fieldsTemplate, setFieldsTemplate] = React.useState<IFieldsTemplate>();
    // const [isOpen, setIsOpen] = React.useState<boolean>(false);
    // const [isLoading, setIsLoading] = React.useState<boolean>(false);
    // const [selectedFieldTemplate, setSelectedFieldTemplate] = React.useState<IFieldsTemplate>();
    // const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false);
    // const [isCloneOpen, setIsCloneOpen] = React.useState<boolean>(false);
    // const [isDeleteOpen, setIsDeleteOpen] = React.useState<boolean>(false);
    const [fieldsError, setFieldsError] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [fields, setFields] = useState<Field[]>([]);
    const [selectedField, setSelectedField] = useState<Field | null>(null);

    // const handleOpen = function (isOpen: boolean, setIsOpen: (isOpen: boolean) => void) {
    //     //reload
    //     getFieldsTemplates().then((fieldTemplates) => {
    //         setFieldsTemplates(fieldTemplates);
    //     })
    //     setSelectedFieldTemplate(undefined);
    //     setIsOpen(isOpen);
    // }
    React.useEffect(() => {
        //setIsLoading(true);
        // getUser().then((user) => {
        //     setUser(user);
        // });
        getWorkspaceFieldTemplate(workspaceId).then((fieldTemplate) => {
            setFieldsTemplate(fieldTemplate);
            setFields([...fieldTemplate.fields]);
        })
        //getFieldsTemplates().then((fieldTemplates) => {
            //setFieldsTemplates(fieldTemplates);
            //setIsLoading(false);
        //})
    }, []);
    const router = useRouter();
    return (
        <>
            <Box sx={{
                mb: 2,
                display: 'flex'
            }}>
                <Typography variant={'h1'} >Custom Fields</Typography>
                {/*<Box sx={{ml: 'auto'}}>*/}
                {/*    <Button onClick={() => setIsOpen(true)} variant={'contained'}>Add New Template</Button>*/}
                {/*</Box>*/}
            </Box>
            {fieldsError && (
                <Box sx={{
                    mb: 3,
                    display: 'flex'
                }}>
                    <Typography color={'error'}>{fieldsError}</Typography>
                </Box>
            )}
            {fieldsTemplate && (
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{mb: 1, textAlign: "end"}}>
                                <Button onClick={() => {
                                    const newField: Field = {
                                        id: `field-preview-${uuidV4()}`,
                                        title: `New field ${fields.length + 1}`,
                                        type: 'text',
                                        required: false,
                                        defaultValue: '',
                                        options: [],
                                        position: fields.length + 1,
                                        enabled: true
                                    }
                                    setFields([...fields, newField])
                                    setSelectedField(newField);
                                }} variant={'contained'}>Add New field</Button>
                            </Box>
                            <Divider sx={{my:2}}/>
                        </Grid>
                        {fields.length ? (
                            <Grid item xs={12} md={selectedField ? 8 : 12}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: fields.length > 0 ? 300 : "auto",
                                        overflowX: 'hidden',
                                        overflowY: 'auto',
                                    }}
                                >
                                    <Typography variant={'h1'} sx={{mb: 2}}>Fields List</Typography>
                                    {fields.length > 1 && (
                                        <List sx={{ width: '100%'}}>
                                            {fields.sort((a, b) => a.position - b.position).map((field) => (
                                                <ListItem
                                                    key={field.id}
                                                    disableGutters
                                                    secondaryAction={
                                                        <IconButton aria-label="Edit"
                                                            onClick={() => {
                                                                setSelectedField(field);
                                                            }}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    }
                                                >
                                                    <ListItemText primary={field.title} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </Grid>
                        ) : (
                            <Grid item xs={12}>
                                <Box sx={{textAlign: 'center'}}>
                                    <Typography variant={'h2'}>
                                        No fields found
                                        <Button
                                            sx={{mx: 2}}
                                            onClick={() => {
                                            const newField: Field = {
                                                id: `field-preview-${uuidV4()}`,
                                                title: `New field ${fields.length + 1}`,
                                                type: 'text',
                                                required: false,
                                                defaultValue: '',
                                                options: [],
                                                position: fields.length + 1,
                                                enabled: true
                                            }
                                            setFields([...fields, newField])
                                            setSelectedField(newField);
                                        }} variant={'outlined'}>Add New field</Button>
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                        {selectedField && (
                            <Grid item xs={12} md={4}>
                                <Box
                                    sx={{
                                        pl: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: 300,
                                        height: '100%',
                                        borderLeft: "1px solid #e0e0e0",
                                    }}
                                >

                                    <Typography variant={'h1'}>Field Options</Typography>
                                    <Box sx={{mt: 2}}>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id={`field-title`}
                                            name={`field-title`}
                                            label="Field Title"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={selectedField.title}
                                            onChange={(e) => {
                                                //replace the field with the new value based on field.id
                                                let newFields = [...fields];
                                                let fieldIndex = newFields.findIndex((f) => f.id === selectedField.id);
                                                newFields[fieldIndex].title = e.target.value;
                                                setFields(newFields);
                                            }}
                                        />
                                        <Box sx={{ minWidth: 120 }}>
                                            <FormControl margin="dense" fullWidth>
                                                <InputLabel id="field-type-label">Field Type</InputLabel>
                                                <Select
                                                    id={`field-type`}
                                                    name={`field-type`}
                                                    label="Field Type"
                                                    value={selectedField.type}
                                                    variant={'outlined'}
                                                    onChange={(e) => {
                                                        //replace the field with the new value
                                                        let newFields = [...fields];
                                                        let selectedFieldIndex = newFields.findIndex((f) => f.id === selectedField.id);
                                                        newFields[selectedFieldIndex].type = e.target.value;
                                                        setFields(newFields);
                                                    }}
                                                >
                                                    <MenuItem value={'text'}>Text</MenuItem>
                                                    <MenuItem value={'email'}>Email</MenuItem>
                                                    <MenuItem value={'number'}>Number</MenuItem>
                                                    <MenuItem value={'select'}>Select</MenuItem>
                                                    <MenuItem value={'date'}>Date</MenuItem>
                                                    <MenuItem value={'multiline'}>Multiline</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        {selectedField.type === 'select' && (
                                            <>
                                                <TextField
                                                    autoFocus
                                                    margin="dense"
                                                    id={`field-options`}
                                                    name={`field-options`}
                                                    helperText={'Separate options with comma'}
                                                    label="Options"
                                                    type="text"
                                                    fullWidth
                                                    variant="outlined"
                                                    value={selectedField.options.join(',')}
                                                    onChange={(e) => {
                                                        //replace the field with the new value
                                                        let newFields = [...fields];
                                                        let selectedFieldIndex = newFields.findIndex((f) => f.id === selectedField.id);
                                                        newFields[selectedFieldIndex].options = e.target.value.split(',');
                                                        setFields(newFields);
                                                    }}
                                                />
                                            </>
                                        )}
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id={`field-default-value`}
                                            name={`field-default-value`}
                                            label="Default Value"
                                            type={selectedField.type}
                                            fullWidth
                                            variant="outlined"
                                            multiline={selectedField.type === 'multiline'}
                                            value={selectedField.defaultValue}
                                            onChange={(e) => {
                                                //replace the field with the new value
                                                let newFields = [...fields];
                                                let selectedFieldIndex = newFields.findIndex((f) => f.id === selectedField.id);
                                                newFields[selectedFieldIndex].defaultValue = e.target.value;
                                                setFields(newFields);
                                            }}
                                        />
                                        {/*only positive numbers*/}
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id={`field-position`}
                                            name={`field-position`}
                                            label="Field Position"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={selectedField.position}
                                            onChange={(e) => {
                                                // change the position of the field based on the weight and move the field that is currently in that position to the position of the selected field
                                                let newFields = [...fields];
                                                let selectedFieldIndex = newFields.findIndex((f) => f.id === selectedField.id);
                                                let oldWeight = newFields[selectedFieldIndex].position;
                                                let newWeight = parseInt(e.target.value);
                                                if(newWeight < 1) {
                                                    newWeight = 1;
                                                }
                                                if(newWeight > newFields.length) {
                                                    newWeight = newFields.length;
                                                }
                                                newFields[selectedFieldIndex].position = newWeight;
                                                const currentField = newFields.find((f) => f.id != selectedField?.id && f.position === newWeight);
                                                const currentFieldIndex = newFields.findIndex((f) => f.id == currentField?.id);
                                                if(currentField) {
                                                    newFields[currentFieldIndex].position = oldWeight;
                                                }
                                                setFields(newFields);
                                            }}
                                        />
                                        <Box sx={{mt: 3, textAlign: 'right'}}>
                                            <Button
                                                onClick={() => {
                                                    //remove the field
                                                    let newFields = [...fields];
                                                    let selectedFieldIndex = newFields.findIndex((f) => f.id === selectedField.id);
                                                    newFields.splice(selectedFieldIndex, 1);
                                                    //update the position of the fields
                                                    newFields = newFields.map((f, idx) => {
                                                        f.position = idx + 1;
                                                        return f;
                                                    });
                                                    setFields(newFields);
                                                    setSelectedField(null);
                                                }}
                                                variant={'contained'}
                                                color={'error'}
                                            >Remove Field</Button>
                                        </Box>

                                    </Box>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                    <Divider sx={{mt:2}}/>
                    <Box sx={{ mt: 2, position: 'relative', textAlign: "end"}}>
                        <Button
                            disabled={isSaving || !fields.length}
                            variant={'contained'}
                            onClick={() => {
                                setIsSaving(true);
                                if(!fields.length) {
                                    setFieldsError('Fields are required');
                                    setIsSaving(false);
                                    return;
                                }
                                async function save() {
                                    if(!fieldsTemplate) {
                                        setIsSaving(false);
                                        return;
                                    }
                                    await updateFieldsTemplate(fieldsTemplate.id, {
                                        fields: fields
                                    }, workspaceId);
                                }
                                save().then(() => {
                                    setIsSaving(false);
                                    setFieldsError('');
                                }).catch((e) => {
                                    setIsSaving(false);
                                    //setNameError('Error saving the template. Please try again.');
                                });
                            }}
                        >{isSaving ? 'Saving...' : 'Save'} </Button>
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
                </>
            )}
            {/*<DataGrid*/}
            {/*    autoHeight*/}
            {/*    slots={{*/}
            {/*        loadingOverlay: LinearProgress as GridSlots['loadingOverlay'],*/}
            {/*        noRowsOverlay: CustomNoRowsOverlay*/}
            {/*    }}*/}
            {/*    loading={isLoading}*/}
            {/*    rows={fieldsTemplates}*/}
            {/*    getRowId={(row) => row.id}*/}
            {/*    columns={[*/}
            {/*        { field: 'title', headerName: 'Name', flex: 1},*/}
            {/*        {*/}
            {/*            field: 'ops', headerName: "", minWidth: 230,*/}
            {/*            renderCell: (params) => (*/}
            {/*                <>*/}
            {/*                    <Box>*/}
            {/*                        <IconButton color={"warning"} onClick={() => {*/}
            {/*                            const fieldTemplate = fieldsTemplates.find((ft) => ft.id == params.row.id )*/}
            {/*                            if (fieldTemplate) {*/}
            {/*                                setSelectedFieldTemplate({...fieldTemplate})*/}
            {/*                                setIsEditOpen(true);*/}
            {/*                            }*/}
            {/*                        }}>*/}
            {/*                            <EditIcon></EditIcon>*/}
            {/*                        </IconButton>*/}
            {/*                        <IconButton onClick={() => {*/}
            {/*                            const fieldTemplate = fieldsTemplates.find((ft) => ft.id == params.row.id )*/}
            {/*                            if (fieldTemplate) {*/}
            {/*                                setSelectedFieldTemplate({...fieldTemplate})*/}
            {/*                                setIsCloneOpen(true);*/}
            {/*                            }*/}
            {/*                        }}>*/}
            {/*                            <ContentCopyIcon></ContentCopyIcon>*/}
            {/*                        </IconButton>*/}
            {/*                        <IconButton color={"error"} onClick={() => {*/}
            {/*                            const fieldTemplate = fieldsTemplates.find((ft) => ft.id == params.row.id )*/}
            {/*                            if (fieldTemplate) {*/}
            {/*                                setSelectedFieldTemplate({...fieldTemplate})*/}
            {/*                                setIsDeleteOpen(true);*/}
            {/*                            }*/}
            {/*                        }}>*/}
            {/*                            <DeleteForeverIcon></DeleteForeverIcon>*/}
            {/*                        </IconButton>*/}
            {/*                    </Box>*/}
            {/*                </>*/}
            {/*            ),*/}
            {/*        }*/}
            {/*    ]}*/}
            {/*    hideFooter={true}*/}
            {/*    rowSelection={false}*/}
            {/*    onRowClick={(params) => {*/}
            {/*        console.log('props.enableRightDrawer');*/}
            {/*    }}*/}
            {/*    initialState={{*/}
            {/*        pagination: {*/}
            {/*            paginationModel: { page: 0, pageSize: 20 },*/}
            {/*        },*/}
            {/*    }}*/}
            {/*    pageSizeOptions={[5, 20]}*/}
            {/*    autosizeOptions={{*/}
            {/*        includeHeaders: true,*/}
            {/*        includeOutliers: true,*/}
            {/*        outliersFactor: 1,*/}
            {/*        expand: true*/}
            {/*    }}*/}
            {/*/>*/}

            {/*<AddFieldsTemplateModal open={isOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsOpen)}></AddFieldsTemplateModal>*/}
            {/*{selectedFieldTemplate && isEditOpen && (*/}
            {/*    <EditFieldsTemplateModal open={isEditOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsEditOpen)} fieldsTemplate={selectedFieldTemplate}></EditFieldsTemplateModal>*/}
            {/*)}*/}
            {/*{selectedFieldTemplate && isCloneOpen && (*/}
            {/*    <CloneFieldsTemplateModal open={isCloneOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsCloneOpen)} fieldsTemplate={selectedFieldTemplate}></CloneFieldsTemplateModal>*/}
            {/*)}*/}
            {/*{selectedFieldTemplate && isDeleteOpen && (*/}
            {/*    <DeleteFieldsTemplateModal open={isDeleteOpen} setOpen={(isOpen) => handleOpen(isOpen, setIsDeleteOpen)} fieldsTemplate={selectedFieldTemplate}></DeleteFieldsTemplateModal>*/}
            {/*)}*/}
        </>
    );
}
