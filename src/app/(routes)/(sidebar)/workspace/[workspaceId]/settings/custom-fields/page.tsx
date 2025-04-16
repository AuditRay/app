'use client'
import * as React from "react";
import {
    Box,
    Divider,
    FormControl, IconButton,
    InputLabel, List, ListItem,
    Select, Grid2 as Grid
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


export default function Settings({params}: {params: Promise<{workspaceId: string}>}) {
    const { workspaceId } = React.use(params);
    const [fieldsTemplate, setFieldsTemplate] = React.useState<IFieldsTemplate>();
    const [fieldsError, setFieldsError] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [fields, setFields] = useState<Field[]>([]);
    const [selectedField, setSelectedField] = useState<Field | null>(null);

    React.useEffect(() => {
        getWorkspaceFieldTemplate(workspaceId).then((fieldTemplate) => {
            setFieldsTemplate(fieldTemplate);
            setFields([...fieldTemplate.fields]);
        })
    }, []);
    return (
        <>
            <Box sx={{
                mb: 2,
                alignItems: 'center',
                display: 'flex'
            }}>
                <Typography variant={'h2'} >Custom Fields</Typography>
                <Box sx={{ml: 'auto'}}>
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
                        {fields.length ? (
                            <Grid size={{
                                xs: 12,
                                md: selectedField ? 8 : 12
                            }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: fields.length > 0 ? 300 : "auto",
                                        overflowX: 'hidden',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {fields.length > 1 && (
                                        <List>
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
                            <Grid size={{
                                xs: 12
                            }}>
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
                            <Grid size={{
                                xs: 12,
                                md: 4
                            }}>
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

                                    <Typography variant={'h3'}>Field Options</Typography>
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
                    <Box sx={{ ml:'auto', mt: 2, position: 'relative', textAlign: "end"}}>
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
                                    setSelectedField(null);
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
        </>
    );
}
