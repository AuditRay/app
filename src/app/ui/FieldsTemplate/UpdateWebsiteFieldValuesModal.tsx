'use client'

import {useEffect, useState} from 'react';
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
import {Field, IFieldsTemplate, IWebsite} from "@/app/models";
import * as React from "react";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import {v4 as uuidV4} from "uuid";
import {createFieldsTemplate, getFieldsTemplate, getFieldsTemplates} from "@/app/actions/fieldTemplateActions";
import {getWebsite, updateWebsite} from "@/app/actions/websiteActions";

export default function UpdateWebsiteFieldValuesModal({websiteId, fieldsTemplateId}: {websiteId: string, fieldsTemplateId: string}) {
    const [isSaving, setIsSaving] = useState(false);
    const [open, setOpen] = useState(false);
    const [generalError, setGeneralError] = useState<string>('');
    const [fieldsTemplate, setFieldsTemplate] = useState<IFieldsTemplate | null>(null);
    const [website, setWebsite] = useState<Partial<IWebsite>>();

    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }

    const getFieldValue = (website: Partial<IWebsite> | undefined, field: Field) => {
        if (!website) return field.defaultValue || '';
        if (!website.fieldValues || !website.fieldValues.length) return field.defaultValue || '';
        const fieldValue = website.fieldValues.find((f) => f.id === field.id);
        return fieldValue?.value || field.defaultValue || '';
    }

    useEffect(() => {
        async function getData(){
            const website = await getWebsite(websiteId);
            const fieldsTemplate = await getFieldsTemplate(fieldsTemplateId);
            if(!website) return '';
            if(!fieldsTemplate) return '';
            setFieldsTemplate(fieldsTemplate);
            setWebsite(website);
        }
        websiteId && getData();
        setIsSaving(false);
    }, [websiteId, fieldsTemplateId]);

    return (
        <Box>
            <Button onClick={handleOpen} variant={'outlined'}  sx={{mt: 2}}>Edit Fields</Button>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'md'}
                scroll={'paper'}
            >
                <DialogTitle>Website Field Values</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {generalError && (
                            <Typography color={'error'}>
                                {generalError}
                            </Typography>
                        )}
                    </DialogContentText>
                    <Divider sx={{mb:2}}/>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Box
                                sx={{
                                    pr: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowX: 'hidden',
                                    overflowY: 'auto',
                                }}
                            >
                                {fieldsTemplate?.fields.sort((a, b) => a.position - b.position).map((field) => (
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
                                                    value={getFieldValue(website, field)}
                                                    onChange={(e) => {
                                                        //replace the field with the new value based on field.id
                                                        let newWebsite = {...website};
                                                        if (!newWebsite.fieldValues) newWebsite.fieldValues = [];
                                                        let fieldValue = newWebsite.fieldValues.find((f) => f.id === field.id);
                                                        if(fieldValue) {
                                                            fieldValue.value = e.target.value;
                                                        }
                                                        else {
                                                            newWebsite.fieldValues.push({
                                                                id: field.id,
                                                                value: e.target.value
                                                            });
                                                        }
                                                        setWebsite(newWebsite);
                                                    }}
                                                    multiline={field.type === 'multiline'}
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
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
                                async function save() {
                                    await updateWebsite(websiteId, {
                                        fieldValues: website?.fieldValues
                                    });
                                }
                                save().then(() => {
                                    setIsSaving(false);
                                    handleClose();
                                }).catch((e) => {
                                    setIsSaving(false);
                                    setGeneralError('Error saving values. Please try again.');
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
                </DialogActions>
            </Dialog>
        </Box>
    );
}