import {useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {Divider, FormControl, Grid, InputLabel, Paper, Select} from "@mui/material";
import {Field} from "@/app/models";
import * as React from "react";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import {v4 as uuidV4} from "uuid";
import {createFieldsTemplate} from "@/app/actions/fieldTemplateActions";

export default function AddFieldsTemplateModal({open, setOpen, workspaceId}: {workspaceId: string, open: boolean, setOpen: (open: boolean) => void}) {
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<string>('');
    const [fieldsError, setFieldsError] = useState<string>('');
    const [fields, setFields] = useState<Field[]>([]);
    const [selectedField, setSelectedField] = useState<Field | null>(null);

    const handleClose = () => {
        setOpen(false);
        setName('');
        setNameError('');
        setFields([]);
        setFieldsError('');
    }

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'lg'}
            scroll={'paper'}
        >
            <DialogTitle>Add new fields template</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To Add a new template, please enter the template name.
                </DialogContentText>
                <TextField
                    autoFocus
                    disabled={isSaving}
                    error={!!nameError}
                    helperText={nameError}
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    margin="dense"
                    id="templateeName"
                    name="templateeName"
                    label="Template Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                />
                <Typography sx={{mt:3}} >Template Fields</Typography>
                {fieldsError && (
                    <Typography color={'error'}>{fieldsError}</Typography>
                )}
                <Divider sx={{mb:2}}/>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Box sx={{mb: 2}}>
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
                        <Box
                            sx={{
                                pr: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: fields.length > 0 ? 300 : "auto",
                                overflowX: 'hidden',
                                overflowY: 'auto',
                            }}
                        >
                            {fields.sort((a, b) => a.position - b.position).map((field) => (
                                <Box key={field.id}>
                                    {["text", "email", "number", "date", "multiline"].includes(field.type) && (
                                        <Box>
                                            <TextField
                                                autoFocus
                                                margin="dense"
                                                id={field.id}
                                                name={field.id}
                                                label={field.title}
                                                type={field.type !== 'multiline' ? field.type : 'text'}
                                                value={field.defaultValue || ''}
                                                multiline={field.type === 'multiline'}
                                                fullWidth
                                                variant="outlined"
                                                onClick={() => {
                                                    console.log('idx', field.id);
                                                    setSelectedField(field)
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                    {selectedField && (
                        <Grid item xs={12} md={4}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 300
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
                                                    <MenuItem value={'date'}>Date</MenuItem>
                                                    <MenuItem value={'multiline'}>Multiline</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
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
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={handleClose}>Cancel</Button>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving}
                        variant={'contained'}
                        onClick={() => {
                            setIsSaving(true);
                            if(!name) {
                                setNameError('Name is required');
                                setIsSaving(false);
                                return;
                            }
                            if(!fields.length) {
                                setFieldsError('Fields are required');
                                setIsSaving(false);
                                return;
                            }
                            async function save() {
                                await createFieldsTemplate({
                                    title: name,
                                    fields: fields
                                }, workspaceId);
                            }
                            save().then(() => {
                                setIsSaving(false);
                                handleClose();
                                setName('');
                                setNameError('');
                                setFields([]);
                                setFieldsError('');
                            }).catch((e) => {
                                setIsSaving(false);
                                setNameError('Error saving the template. Please try again.');
                            });
                        }}
                    >{isSaving ? 'Saving...' : 'Create'} </Button>
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
    );
}