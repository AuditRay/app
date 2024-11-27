'use client'
import * as React from "react";
import {Box, Card, CardContent, CardMedia, Grid2, IconButton} from "@mui/material";
import Typography from "@mui/material/Typography";
import {IUser} from "@/app/models";
import Button from "@mui/material/Button";
import {userSessionState} from "@/app/lib/uiStore";
import CircleIcon from '@mui/icons-material/Circle';
import DisconnectIntegrationModal from "@/app/ui/Integration/DisconnectIntegrationModal";
import Tooltip from "@mui/material/Tooltip";
import {getFullUser} from "@/app/actions/getUser";



export default function IntegrationsSettings({params}: { params: { workspaceId: string } }) {
    const [user, setUser] = React.useState<IUser | null>(null);
    const [isDisconnectOpen, setIsDisconnectOpen] = React.useState<boolean>(false);
    const [setupUrl, setSetupUrl] = React.useState<string>('');
    const [jiraIntegration, setJiraIntegration] = React.useState<{
        status: boolean;
        token: string;
    }>({
        status: false,
        token: ''
    });
    const setSessionFullUser = userSessionState((state) => state.setFullUser);
    const sessionUser = userSessionState((state) => state.fullUser);

    React.useEffect(() => {
        setUser(sessionUser);
        const currentWorkspace = sessionUser?.workspaces?.find(workspace => workspace.id === params.workspaceId);
        console.log('currentWorkspace', currentWorkspace, sessionUser);
        if (currentWorkspace){
            setJiraIntegration(currentWorkspace.jira || {status: false, token: ''});
            setSetupUrl(`https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=O7gNWsjkktg2YsCjQAFysD3ZZF5yH3aq&scope=offline_access%20read%3Ajira-work%20write%3Ajira-work%20read%3Ajira-user&redirect_uri=https%3A%2F%2Fbeta.monit.dev%2Fapi%2Fv1%2Fjira&state=${sessionUser?.currentSelectedWorkspace}&response_type=code&prompt=consent`)
        }
    }, [sessionUser]);

    return (
        <>
            <Box sx={{
                mb: 3,
                display: 'flex'
            }}>
                <Typography variant={'h1'} >Integrations</Typography>
            </Box>
            <Box>
                <Grid2 container={true} spacing={2} sx={{mt: 2}}>
                    <Grid2 size={6}>
                        <Card sx={{ display: 'flex' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flex: '1 0 auto' }}>
                                    <Typography component="div" variant="h5">
                                        <Tooltip title={jiraIntegration.status ? 'Connected' : 'Not Connected'}>
                                            <CircleIcon sx={{fontSize: "12px", color: jiraIntegration.status ? "green" : "gray"}}/>
                                        </Tooltip> JIRA
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        component="div"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        Create and manage JIRA issues directly from your workspace
                                    </Typography>

                                    <Box sx={{ display: 'flex', mt:2 , gap: 1, flexDirection: "column" }}>
                                        {jiraIntegration.status ? (
                                            <>
                                                <Button variant={'contained'}>
                                                    <Box component={"a"} href={setupUrl} target={"_blank"} sx={{color: "#ffffff", textDecoration: "none"}}>
                                                        Add Another Jira Integration
                                                    </Box>
                                                </Button>

                                                <Button variant={'contained'}  color={'error'} onClick={() => setIsDisconnectOpen(true)}>
                                                    Disconnect Integration
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant={'contained'}>
                                                <Box component={"a"} href={setupUrl} target={"_blank"} sx={{color: "#ffffff", textDecoration: "none"}}>
                                                    Connect Jira Integration
                                                </Box>
                                            </Button>
                                        )}
                                    </Box>
                                    {isDisconnectOpen && (
                                        <DisconnectIntegrationModal open={isDisconnectOpen} setOpen={(isOpen) => {
                                            setIsDisconnectOpen(isOpen);
                                            if (sessionUser) {
                                                getFullUser(sessionUser.id).then((user) => {
                                                    setSessionFullUser(user);
                                                }).catch((error) => {
                                                    console.log(error);
                                                });
                                            }
                                        }} workspaceId={params.workspaceId}></DisconnectIntegrationModal>
                                    )}
                                </CardContent>
                            </Box>
                            <CardMedia
                                component="img"
                                sx={{ width: "150px", objectFit: "contain", p:3 }}
                                image="/integrations/jira.png"
                                alt="Jira"
                            />
                        </Card>
                    </Grid2>
                </Grid2>
            </Box>
        </>
    );
}
