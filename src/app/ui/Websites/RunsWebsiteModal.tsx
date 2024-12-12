'use client'
import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {IFieldsTemplate, IUpdateRun, IWebsite} from "@/app/models";
import * as React from "react";
import Typography from "@mui/material/Typography";
import {deleteFieldsTemplate} from "@/app/actions/fieldTemplateActions";
import {deleteWebsite, getGetWebsiteUpdateRuns} from "@/app/actions/websiteActions";
import { useRouter } from 'next/navigation'
import dayjs from "dayjs";
import {Card, CardContent} from "@mui/material";

export default function RunsWebsiteModal({websiteId}: {websiteId: string}) {
    const [isLoading, setIsLoading] = useState(false);
    const [runs, setRuns] = useState<IUpdateRun[]>([]);
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }

    React.useEffect(() => {
        if(!open || !websiteId) return;
        const getRuns = async () => {
            setIsLoading(true);
            const runs = await getGetWebsiteUpdateRuns(websiteId);
            console.log(runs);
            setRuns(runs);
        }
        getRuns().finally(() => {
            setIsLoading(false);
        });
    }, [open, websiteId])
    return (
        <>
            <Button onClick={handleOpen} variant={'contained'} fullWidth sx={{mt: 2}} color={'info'}>
                Update Runs status
            </Button>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth={'sm'}
                scroll={'paper'}
            >
                <DialogTitle>Website Update Runs</DialogTitle>
                <DialogContent>
                    <Box>
                        {isLoading && <CircularProgress />}
                        {!isLoading && runs.length > 0 && runs.map((run) => (
                            <Card key={run.id} variant="outlined" sx={{mb: 3}}>
                                <CardContent>
                                    <Typography variant={'body1'} sx={{mb: 1}}>{dayjs(run.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Typography>
                                    <Typography variant={'body2'}>{run.status}</Typography>
                                    {run.response && <Typography variant={'body2'}>{run.response}</Typography>}
                                </CardContent>
                            </Card>
                        ))}
                        {!isLoading && runs.length === 0 && (
                            <Card variant="outlined" sx={{mb: 3}}>
                                <CardContent>
                                    <Typography variant={'body1'}>No runs found</Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant={'contained'} onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>

        </>
    );
}