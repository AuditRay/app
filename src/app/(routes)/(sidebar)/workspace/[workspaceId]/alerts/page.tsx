'use server'
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {getAlertInfo} from "@/app/actions/alertsActions";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AlertAccordion from "@/app/ui/Alerts/AlertAccordion";

export default async function Alerts({params}: { params: { workspaceId: string } }) {
    const alertInfos = await getAlertInfo(params.workspaceId);
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
                {alertInfos.length > 0 && <AlertAccordion alertInfos={alertInfos}/>}
                {alertInfos.length == 0 && (
                    <Box sx={{textAlign: 'center'}}>
                        You don&apos;t have any new alerts
                    </Box>
                )}
            </Paper>
        </Grid>
    );
}
