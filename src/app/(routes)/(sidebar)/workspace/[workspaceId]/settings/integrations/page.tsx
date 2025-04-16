'use client'
import * as React from "react";
import {Box, Card, CardActions, CardContent, CardMedia, Grid2 as Grid, IconButton} from "@mui/material";
import Typography from "@mui/material/Typography";
import {IUser, IWorkspace} from "@/app/models";
import Button from "@mui/material/Button";
import CircleIcon from '@mui/icons-material/Circle';
import DisconnectIntegrationModal from "@/app/ui/Integration/jira/DisconnectIntegrationModal";
import Tooltip from "@mui/material/Tooltip";
import {getFullUser} from "@/app/actions/getUser";
import {getJiraResources} from "@/app/actions/workspaceActions";
import ConfigJiraIntegrationModal from "@/app/ui/Integration/jira/ConfigJiraIntegrationModal";
import DisconnectSlackIntegrationModal from "@/app/ui/Integration/slack/DisconnectSlackIntegrationModal";
import {useUserStateStore} from "@/providers/user-store-provider";



export default function IntegrationsSettings({params}: { params: Promise<{ workspaceId: string }> }) {
    const {workspaceId} = React.use(params);
    const [user, setUser] = React.useState<IUser | null>(null);
    const [isDisconnectOpen, setIsDisconnectOpen] = React.useState<boolean>(false);
    const [isSlackDisconnectOpen, setIsSlackDisconnectOpen] = React.useState<boolean>(false);
    const [isConfigOpen, setIsConfigOpen] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [setupUrl, setSetupUrl] = React.useState<string>('');
    const [connectedResources, setConnectedResources] = React.useState<string[]>([]);
    const [jiraIntegration, setJiraIntegration] = React.useState<{
        status?: boolean;
        token?: string;
    }>({
        status: false,
        token: ''
    });
    const [slackIntegration, setSlackIntegration] = React.useState<IWorkspace['slack']>({
        status: false,
        access_token: ''
    });
    const setSessionFullUser = useUserStateStore((state) => state.setSessionFullUser);
    const sessionUser = useUserStateStore((state) => state.sessionFullUser);

    React.useEffect(() => {
        setIsLoading(true);
        setUser(sessionUser);
        const currentWorkspace = sessionUser?.workspaces?.find(workspace => workspace.id === workspaceId);
        if (currentWorkspace){
            setSlackIntegration(currentWorkspace.slack || {status: false, access_token: ''});
            setJiraIntegration(currentWorkspace.jira || {status: false, token: ''});
            setSetupUrl(`https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=O7gNWsjkktg2YsCjQAFysD3ZZF5yH3aq&scope=offline_access%20read%3Ajira-work%20write%3Ajira-work%20read%3Ajira-user&redirect_uri=https%3A%2F%2Fbeta.monit.dev%2Fapi%2Fv1%2Fjira&state=${workspaceId}&response_type=code&prompt=consent`)
            getJiraResources(workspaceId).then((jiraResources: any[]) => {
                setConnectedResources(jiraResources.map(resource => resource.name));
            }).then(() => {
                setIsLoading(false);
            })
        }
    }, [sessionUser, workspaceId]);

    return (
        <>
            <Box sx={{
                mb: 3,
                display: 'flex'
            }}>
                <Typography variant={'h2'} >Integrations</Typography>
            </Box>
            <Box>
                <Grid container={true} spacing={2} sx={{mt: 2}}>
                    <Grid size={6}>
                        <Card sx={{ display: 'flex', flexDirection: 'column', height: "100%" }}>
                            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                <Box sx={{width: "80%"}}>
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Typography component="div" variant="h5">
                                            <Tooltip title={jiraIntegration.status ? 'Connected' : 'Not Connected'}>
                                                <CircleIcon sx={{fontSize: "12px", color: jiraIntegration.status ? "green" : "gray"}}/>
                                            </Tooltip> Jira
                                        </Typography>
                                        <Typography
                                            variant="subtitle1"
                                            component="div"
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            Create and manage Jira issues directly from your workspace
                                        </Typography>
                                        {connectedResources.length > 0 && (
                                            <Box sx={{ display: 'flex', mt:2 , flexDirection: "column" }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    component="div"
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    Connected Resources:
                                                </Typography>
                                                <Typography
                                                    variant="subtitle2"
                                                    component="div"
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    {connectedResources.join(', ')}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Box>
                                <CardMedia
                                    component="img"
                                    sx={{ width: "150px", objectFit: "contain", p:3 }}
                                    image="/integrations/jira.png"
                                    alt="Jira"
                                />
                            </Box>
                            <CardActions sx={{p: 3}}>
                                {jiraIntegration.status ? (
                                    <>
                                        <Button variant={'contained'} color={'secondary'} onClick={() => setIsConfigOpen(true)}>
                                            Configure
                                        </Button>
                                        <Button variant={'contained'}  color={'error'} onClick={() => setIsDisconnectOpen(true)}>
                                            Disconnect
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant={'contained'}>
                                        <Box component={"a"} href={setupUrl} target={"_blank"} sx={{color: "#ffffff", textDecoration: "none"}}>
                                            Connect Jira Integration
                                        </Box>
                                    </Button>
                                )}
                                {isConfigOpen && (
                                    <ConfigJiraIntegrationModal open={isConfigOpen} setOpen={(isOpen) => {
                                        setIsConfigOpen(isOpen);
                                        if (sessionUser) {
                                            getFullUser(sessionUser.id).then((user) => {
                                                setSessionFullUser(user);
                                            }).catch((error) => {
                                                console.log(error);
                                            });
                                        }
                                    }}></ConfigJiraIntegrationModal>
                                )}
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
                                    }} workspaceId={workspaceId}></DisconnectIntegrationModal>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid size={6}>
                        <Card sx={{ display: 'flex', flexDirection: 'column', height: "100%"}}>
                            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                <Box sx={{width: "80%"}}>
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Typography component="div" variant="h5">
                                            <Tooltip title={slackIntegration?.status ? 'Connected' : 'Not Connected'}>
                                                <CircleIcon sx={{fontSize: "12px", color: slackIntegration?.status ? "green" : "gray"}}/>
                                            </Tooltip> Slack
                                        </Typography>
                                        <Typography
                                            variant="subtitle1"
                                            component="div"
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            Send notifications to Slack channels
                                        </Typography>
                                        {slackIntegration?.team?.name && (
                                            <Box sx={{ display: 'flex', mt:2 , flexDirection: "column" }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    component="div"
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    Connected Team:
                                                </Typography>
                                                <Typography
                                                    variant="subtitle2"
                                                    component="div"
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    {slackIntegration?.team?.name}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Box>
                                <CardMedia
                                    component="img"
                                    sx={{ width: "150px", objectFit: "contain", p:3 }}
                                    image="/integrations/slack.png"
                                    alt="Jira"
                                />
                            </Box>
                            <CardActions sx={{p: 3}}>
                                {slackIntegration?.status ? (
                                    <>
                                        <Button variant={'contained'}  color={'error'} onClick={() => setIsSlackDisconnectOpen(true)}>
                                            Disconnect
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant={'contained'}>
                                        <Box component={"a"} href={`/api/v1/slack/${workspaceId}`} target={"_blank"} sx={{color: "#ffffff", textDecoration: "none"}}>
                                            Connect Slack Integration
                                        </Box>
                                    </Button>
                                )}
                                {isConfigOpen && (
                                    <ConfigJiraIntegrationModal open={isConfigOpen} setOpen={(isOpen) => {
                                        setIsConfigOpen(isOpen);
                                        if (sessionUser) {
                                            getFullUser(sessionUser.id).then((user) => {
                                                setSessionFullUser(user);
                                            }).catch((error) => {
                                                console.log(error);
                                            });
                                        }
                                    }}></ConfigJiraIntegrationModal>
                                )}
                                {isSlackDisconnectOpen && (
                                    <DisconnectSlackIntegrationModal open={isSlackDisconnectOpen} setOpen={(isOpen) => {
                                        setIsSlackDisconnectOpen(isOpen);
                                        if (sessionUser) {
                                            getFullUser(sessionUser.id).then((user) => {
                                                setSessionFullUser(user);
                                            }).catch((error) => {
                                                console.log(error);
                                            });
                                        }
                                    }} workspaceId={workspaceId}></DisconnectSlackIntegrationModal>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
