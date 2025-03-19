'use server'
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {getAlertInfo} from "@/app/actions/alertsActions";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AlertAccordion from "@/app/ui/Alerts/AlertAccordion";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default async function Alerts({params}: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = await params;
    const alertInfos = await getAlertInfo(workspaceId);
    return (
        <Grid item xs={12}>
            <Paper
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: 'xl'
                }}
            >
                <Box sx={{
                    mb: 3,
                }}>
                    <Typography variant={'h2'} >Tests</Typography>
                </Box>
                {alertInfos.length > 0 && <AlertAccordion alertInfos={alertInfos}/>}
                {alertInfos.length == 0 && (
                    <Box sx={{textAlign: 'center'}}>
                        You don&apos;t have any new tests
                    </Box>
                )}
            </Paper>
        </Grid>
    );
}
