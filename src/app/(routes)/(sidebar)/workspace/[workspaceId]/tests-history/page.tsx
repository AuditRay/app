'use client'
import {Grid2 as Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {getAlertInfo} from "@/app/actions/alertsActions";
import AlertAccordion from "@/app/ui/Alerts/AlertAccordion";
import Typography from "@mui/material/Typography";
import {useParams} from "next/navigation";
import {IWebsite} from "@/app/models";
import {IAlertInfo} from "@/app/models/AlertInfo";
import {getLatestWebsiteInfo, getWebsite, getWebsiteViews} from "@/app/actions/websiteActions";
import {getWorkspaceFieldTemplate} from "@/app/actions/fieldTemplateActions";
import {LoadingScreen} from "@/components/loading-screen";

export default function Alerts() {
    const { workspaceId } = useParams<{
        workspaceId: string
    }>()
    const [alertInfos, setAlertInfos] = React.useState<IAlertInfo[]>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const load = async () => {
        const alertInfos = await getAlertInfo(workspaceId);
        setAlertInfos(alertInfos);
    }
    React.useEffect(() => {
        setIsLoaded(false)
        load().then(() => setIsLoaded(true));
    }, [])
    return !isLoaded ? (
        <Box sx={{height: '100%', pt: "20%"}}>
            <LoadingScreen />
        </Box>
    ) : (
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
                <Typography variant={'h2'} >Tests History</Typography>
            </Box>
            {alertInfos.length > 0 && <AlertAccordion alertInfos={alertInfos} workspaceId={workspaceId}/>}
            {alertInfos.length == 0 && (
                <Box sx={{textAlign: 'center'}}>
                    You don&apos;t have any new tests
                </Box>
            )}
        </Paper>
    );
}
