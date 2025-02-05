'use client';
import {ChangeEvent, useEffect, useState} from 'react';
import { FileUploadWithPreview } from 'file-upload-with-preview';
import 'file-upload-with-preview/dist/style.css';
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
import {UploadAvatar} from "@/app/ui/Uploads/UploadAvatar";
import {ReactCropperElement} from "react-cropper";
import {signS3UploadFolderImageData} from "@/app/actions/uploadActions";

const uploadFileToS3 = (presignedPostData: any, file: File) => {
    // create a form obj
    const formData = new FormData();

    // append the fields in presignedPostData in formData
    Object.keys(presignedPostData.fields).forEach(key => {
        formData.append(key, presignedPostData.fields[key]);
    });

    // append the file
    formData.append("file", file, file.name);

    // post the data on the s3 url
    fetch(presignedPostData.url, {
        method: "POST",
        body: formData,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }).then(response => response.json()) // Adjust if needed
        .then(data => console.log(data))
        .catch(error => console.error(error));
};

export default function AddNewFolderModal({workspaceId}: {workspaceId: string}) {
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<string>('');
    const [fieldsError, setFieldsError] = useState<string>('');
    const [fields, setFields] = useState<Field[]>([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newAvatarUrl, setNewAvatarUrl] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const resetData = () => {
        setName('');
        setNameError('');
        setFields([]);
        setFieldsError('');
    }
    const handleOpen = () => {
        setOpen(true);
        resetData()
    }
    const handleClose = () => {
        setOpen(false);
        resetData();
    }

    const getNewAvatarUrl = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setEditMode(true);
            setUploadFile(e.target.files[0]);
            setNewAvatarUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const cropperRef = React.useRef<ReactCropperElement>(null);

    return (
        <>
            <Button onClick={handleOpen} variant={'contained'}>Add New Folder</Button>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'lg'}
                scroll={'paper'}
            >
                <DialogTitle>Add new folder</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To Add a new folder, please enter the new folder name.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        disabled={isSaving}
                        error={!!nameError}
                        helperText={nameError}
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        margin="dense"
                        id="folderName"
                        name="folderName"
                        label="Folder Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                    />
                    <Typography sx={{mt:3}} >Photo</Typography>
                    <Box>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={getNewAvatarUrl}
                            className="mt-2 border border-solid border-black py-2 px-4 rounded cursor-pointer"
                        />
                        {newAvatarUrl && (
                            <UploadAvatar
                                avatarUrl={newAvatarUrl}
                                cropperRef={cropperRef}
                            />
                        )}
                    </Box>
                    {fieldsError && (
                        <Typography color={'error'}>{fieldsError}</Typography>
                    )}
                    <Divider sx={{mb:2}}/>
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
                                async function save() {
                                    const cropper = cropperRef.current?.cropper;
                                    let file: File | null = null;
                                    if (cropper) {
                                        file = await fetch(cropper.getCroppedCanvas().toDataURL())
                                            .then((res) => res.blob())
                                            .then((blob) => {
                                                return new File([blob], "newAvatar.png", { type: "image/png" });
                                            });
                                    } else {
                                        file = uploadFile
                                    }
                                    if(file) {
                                        const preSignedUpload = await signS3UploadFolderImageData(workspaceId, file.type);
                                        uploadFileToS3(preSignedUpload, file);
                                        console.log('preSignedUpload', preSignedUpload);
                                    }
                                }
                                save().then(() => {
                                    setIsSaving(false);
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
        </>
    );
}