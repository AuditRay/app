'use server'
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {getAlertInfo} from "@/app/actions/alertsActions";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default async function Alerts() {
    const alertInfos = await getAlertInfo();
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
                {alertInfos.length > 0 && alertInfos.map((alertInfo) => (
                    <Accordion key={alertInfo.id}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            {alertInfo.subject.replaceAll('Alert: ', '').toUpperCase()}
                        </AccordionSummary>
                        <AccordionDetails>
                            {alertInfo.text}
                        </AccordionDetails>
                    </Accordion>
                ))}
                {alertInfos.length == 0 && (
                    <Box sx={{textAlign: 'center'}}>
                        You don&apos;t have any new alerts
                    </Box>
                )}
            </Paper>
        </Grid>
    );
}
