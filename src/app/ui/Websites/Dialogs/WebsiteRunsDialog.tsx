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
import {green, red} from '@mui/material/colors';
import {IFieldsTemplate, IUpdateRun, IWebsite} from "@/app/models";
import * as React from "react";
import Typography from "@mui/material/Typography";
import {deleteFieldsTemplate} from "@/app/actions/fieldTemplateActions";
import {deleteWebsite, getGetWebsiteUpdateRuns} from "@/app/actions/websiteActions";
import { useRouter } from 'next/navigation'
import dayjs from "dayjs";
import {Card, CardContent} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import {getAlert} from "@/app/actions/alertsActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import AlertWebsitePreviewGrid from "@/app/ui/Alerts/AlertWebsitePreviewGrid";

export default function WebsiteRunsDialog({
    websiteId,
    open,
    setOpenAction
}: {
    websiteId: string,
    open: boolean,
    setOpenAction: (open: boolean) => void
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [runs, setRuns] = useState<IUpdateRun[]>([]);

    const handleClose = () => {
        setOpenAction(false);
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
                            <Accordion key={run.id}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                    sx={{textTransform: 'capitalize'}}
                                >

                                    <Typography variant={'body1'} sx={{mb: 1}}>{dayjs(run.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Typography>
                                    <Typography variant={'body1'} sx={{mx: 1}}>|</Typography>
                                    {run.status === 'Success' && <Typography variant={'body1'} sx={{color: green[500]}}>{run.status} - {run.responseStatus || 200}</Typography>}
                                    {run.status === 'Failed' && <Typography variant={'body1'} sx={{color: red[500]}}>{run.status} {run.responseStatus ? ` - ${run.responseStatus}` : ''}</Typography>}
                                </AccordionSummary>
                                <AccordionDetails>
                                    {run.responseDesc && <Typography variant={'body2'}>{run.responseDesc}</Typography>}
                                    {!run.responseDesc && run.status === 'Success' && <Typography variant={'body2'}>Successfully fetched updates</Typography>}
                                    {!run.responseDesc && run.status === 'Failed' && <Typography variant={'body2'}>Failed to updated data, please try again later.</Typography>}
                                </AccordionDetails>
                            </Accordion>
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