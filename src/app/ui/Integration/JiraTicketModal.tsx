import {useState} from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateField } from '@mui/x-date-pickers/DateField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import {FormControl, FormHelperText, Grid2, InputLabel, Select} from "@mui/material";
import {
    createJiraTicket, getJiraProjects, getJiraIssues, getJiraUsers, getJiraResources, jiraIssueType
} from "@/app/actions/workspaceActions";
import * as React from "react";
import {userSessionState} from "@/app/lib/uiStore";
import { useParams } from 'next/navigation'
import MenuItem from "@mui/material/MenuItem";
import {getTicketDetails} from "@/app/actions/aiActions";
import StarterKit from "@tiptap/starter-kit";
import {
    MenuButtonBold,
    MenuButtonItalic,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditor,
    type RichTextEditorRef,
} from "mui-tiptap";
import { useRef } from "react";
import { convertSchemaToHtml } from "@/app/lib/utils";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Typography from "@mui/material/Typography";


dayjs.extend(utc);
dayjs.extend(timezone);

type jiraProject = {
    id: string;
    name: string;
};
type jiraResource = {
    id: string;
    url: string;
    name: string;
    avatarUrl: string;
};


type jiraUser = {
    accountId: string;
    accountType: string;
    html: string;
    displayName: string;
}
export default function JiraTicketModal({open, setOpen, context}: {open: boolean, setOpen: (open: boolean) => void, context: any}) {
    const rteRef = useRef<RichTextEditorRef>(null);
    const params = useParams<{ workspaceId: string; }>()

    const [ticketHtml, setTicketHtml] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('');

    const [jiraResource, setJiraResource] = useState<string>('');
    const [jiraResourceUrl, setJiraResourceUrl] = useState<string>('');
    const [jiraResources, setJiraResources] = useState<jiraResource[]>([]);
    const [isResourceLoading, setIsResourceLoading] = useState<boolean>(false);

    const [jiraProject, setJiraProject] = useState<string>('');
    const [jiraProjects, setJiraProjects] = useState<jiraProject[]>([]);
    const [isProjectLoading, setIsProjectLoading] = useState<boolean>(false);

    const [jiraIssueType, setJiraIssueType] = useState<string>('');
    const [jiraIssueTypes, setJiraIssueTypes] = useState<jiraIssueType[]>([]);
    const [isIssueTypesLoading, setIsIssueTypesLoading] = useState<boolean>(false);

    const [jiraUser, setJiraUser] = useState<string>('');
    const [jiraUsers, setJiraUsers] = useState<jiraUser[]>([]);
    const [isJiraUsersLoading, setIsJiraUsersLoading] = useState<boolean>(false);

    const [isAiLoading, setIsAiLoading ] = useState<boolean>(false);
    const [dueDate, setDueDate] = useState<Dayjs | null>(null);
    const [jiraIntegration, setJiraIntegration] = React.useState<{
        status: boolean;
        token: string;
        refreshToken: string;
    }>({
        status: false,
        token: '',
        refreshToken: ''
    });

    const [newTicketData, setNewTicketData] = useState<{
        title?: string;
        text?: string;
        resource?: string;
        project?: string;
    }>({
        title: '',
        text: '',
        resource: '',
        project: ''
    });

    const [newTicketErrorData, setNewTicketErrorData] = useState<{
        title?: string;
        text?: string;
        issueType?: string;
        assignee?: string;
        resource?: string;
        project?: string;
        dueDate?: string;
    }>({
        title: '',
        text: '',
        issueType: '',
        assignee: '',
        resource: '',
        project: '',
        dueDate: ''
    });

    const [generalError, setGeneralError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [successUrl, setSuccessUrl] = useState<string>('');

    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setNewTicketErrorData({});
        setNewTicketData({
            title: '',
            text: '',
            resource: '',
            project: ''
        });
        setGeneralError('');
        setSuccessMessage('');
        setSuccessUrl('');
        setNewTicketErrorData({});
        setJiraResource('');
        setJiraProject('');
        setJiraIssueType('');
        setJiraUser('');
        setOpen(false);
    }

    const updateHtml = (html: string) => {
        if(rteRef.current) {
            console.log('setting html', html);
            rteRef.current.editor?.commands.setContent(html);
        }
    }

    const sessionUser = userSessionState((state) => state.fullUser);
    const prepareJiraIntegration = async (jiraResourceId?: string) => {
        if(isResourceLoading || isProjectLoading || isIssueTypesLoading || isJiraUsersLoading || isAiLoading) return;
        setNewTicketErrorData({});
        setIsResourceLoading(true);
        setIsProjectLoading(true);
        setIsIssueTypesLoading(true);
        setIsJiraUsersLoading(true);
        setIsAiLoading(true);
        setNewTicketData({});
        setJiraUser('');
        setJiraProject('');
        setJiraIssueType('');
        setTicketHtml('');
        setJiraProjects([]);
        setJiraIssueTypes([]);
        setJiraUsers([]);
        const resources: (jiraResource & { scope: string[] })[] = await getJiraResources(params.workspaceId);
        const resourcesPrepared: jiraResource[] = resources.map((resource) => ({
            id: resource.id,
            url: resource.url,
            name: resource.name,
            avatarUrl: resource.avatarUrl
        }));
        setJiraResources(resourcesPrepared);
        if (resourcesPrepared.length > 0) {
            const selectedResource = resourcesPrepared.find((resource) => resource.id === jiraResourceId);
            let resourceId = jiraResourceId;
            if (!resourceId) {
                setJiraResource(resources[0].id);
                resourceId = resources[0].id;
            }
            setJiraResourceUrl(selectedResource?.url ? selectedResource?.url : resources[0].url);
            const projects: jiraProject[] = await getJiraProjects(params.workspaceId, resourceId);
            const projectsPrepared: jiraProject[] = projects.map((project) => ({
                id: project.id,
                name: project.name
            }));
            if(!projectsPrepared.length) {
                setIsProjectLoading(false);
                setIsResourceLoading(false);
                setIsIssueTypesLoading(false);
                setIsJiraUsersLoading(false);
                setIsAiLoading(false);
                setNewTicketErrorData({
                    ...newTicketErrorData,
                    project: 'No projects found',
                })
                return;
            }
            setJiraProjects(projectsPrepared);
            setJiraProject(projects[0].id);

            const issueTypes: jiraIssueType[] = await getJiraIssues(params.workspaceId, resourceId, projects[0].id);
            const issueTypesPrepared: jiraIssueType[] = issueTypes.map((issueType) => ({
                id: issueType.id,
                iconUrl: issueType.iconUrl,
                name: issueType.name,
                subtask: false
            }));
            setJiraIssueTypes(issueTypesPrepared);
            if(!issueTypesPrepared.length) {
                setIsProjectLoading(false);
                setIsResourceLoading(false);
                setIsIssueTypesLoading(false);
                setIsJiraUsersLoading(false);
                setIsAiLoading(false);
                setNewTicketErrorData({
                    ...newTicketErrorData,
                    issueType: 'No issue types found'
                })
                return;
            }
            setJiraIssueType(jiraIssueType || issueTypes[0].id);
            const users: jiraUser[] = await getJiraUsers(params.workspaceId, resourceId);
            const usersPrepared: jiraUser[] = users.map((user) => ({
                accountId: user.accountId,
                accountType: user.accountType,
                html: user.html,
                displayName: user.displayName
            }));
            setJiraUsers(usersPrepared);
            if(!usersPrepared.length) {
                setIsProjectLoading(false);
                setIsResourceLoading(false);
                setIsIssueTypesLoading(false);
                setIsJiraUsersLoading(false);
                setIsAiLoading(false);
                setNewTicketErrorData({
                    ...newTicketErrorData,
                    assignee: 'No users found'
                })
                return;
            }
            setJiraUser(jiraUser || users[0].accountId);
        }

        console.log('context', context, newTicketData);
        if (context && (!newTicketData.title && !newTicketData.text)) {
            const ticketInfo = await getTicketDetails("Update", context).catch(() => {
                setIsAiLoading(false);
                return {title: '', content: ''};
            })
            console.log('ticketInfo', ticketInfo);
            setNewTicketData({
                title: ticketInfo.title
            });
            try {
                const content = ticketInfo.content;
                setTicketHtml(content);
                updateHtml(content);
            } catch (e) {
                console.log('error', e);
                setTicketHtml('');
                updateHtml('');
                setIsAiLoading(false);
            }
        }
        setIsProjectLoading(false);
        setIsResourceLoading(false);
        setIsIssueTypesLoading(false);
        setIsJiraUsersLoading(false);
        setIsAiLoading(false);
        setDueDate(dayjs().add(7, 'day'));
    }

    React.useEffect(() => {
        if(!open) return;

        const currentWorkspace = sessionUser?.workspaces?.find(workspace => workspace.id === sessionUser?.currentSelectedWorkspace);
        console.log('currentWorkspace', currentWorkspace, sessionUser);
        if (currentWorkspace){
            setCurrentWorkspaceId(currentWorkspace.id);
            setJiraIntegration(currentWorkspace.jira || {status: false, token: '', refreshToken: ''});
            prepareJiraIntegration().then().catch((e) => {
                console.log('error', e);
                setIsProjectLoading(false);
                setIsIssueTypesLoading(false);
                setIsJiraUsersLoading(false);
            });
        }
    }, [open, sessionUser]);

    React.useEffect(() => {
        if(rteRef.current && ticketHtml) {
            console.log('setting html', ticketHtml);
            rteRef.current.editor?.commands.setContent(ticketHtml);
        }
    }, [rteRef.current, ticketHtml]);

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={'md'}
            onClose={() => {
                !isSaving && handleClose();
            }}
        >
            <DialogTitle></DialogTitle>
            <DialogContent>
                <Box sx={{textAlign: 'center', width: "100%", mb:2}}>
                    <img src={'/integrations/jira.png'} alt={'Jira'} width={'50px'} />
                </Box>
                {jiraResource && !isResourceLoading && !isAiLoading && !successMessage ? (
                    <>
                        <Grid2 container spacing={2}>
                            <Grid2 size={6}>
                                <FormControl margin={'dense'} fullWidth>
                                    <InputLabel id="jira-resources-label">Account</InputLabel>
                                    <Select
                                        margin={'dense'}
                                        error={!!newTicketErrorData.resource}
                                        disabled={isResourceLoading}
                                        labelId="jira-resources-label"
                                        id="jira-resources-select"
                                        value={jiraResources.find((resource) => resource.id === jiraResource)?.id}
                                        label={isProjectLoading ? 'Loading...' : 'Account'}
                                        onChange={(e) => {
                                            setJiraResource(e.target.value as string);
                                            const selectedResource = jiraResources.find((resource) => resource.id === e.target.value);
                                            setJiraResourceUrl(selectedResource?.url || '');
                                            prepareJiraIntegration(e.target.value).then();
                                        }}
                                    >
                                        {jiraResources.map((resource) => (
                                            <MenuItem key={resource.id} value={resource.id}>{resource.name}</MenuItem>
                                        ))}
                                    </Select>

                                    {newTicketErrorData.resource && (
                                        <FormHelperText error>{newTicketErrorData.resource}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>

                                <FormControl margin={'dense'} fullWidth>
                                    <InputLabel id="jira-projects-label">Project</InputLabel>
                                    <Select
                                        margin={'dense'}
                                        error={!!newTicketErrorData.project}
                                        disabled={isProjectLoading}
                                        labelId="jira-projects-label"
                                        id="jira-projects-select"
                                        value={jiraProjects.find((project) => project.id === jiraProject)?.id}
                                        label={isProjectLoading ? 'Loading...' : 'Project'}
                                        onChange={(e) => {
                                            setJiraProject(e.target.value as string);
                                        }}
                                    >
                                        {jiraProjects.map((project) => (
                                            <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                                        ))}
                                    </Select>
                                    {newTicketErrorData.project && (
                                        <FormHelperText error>{newTicketErrorData.project}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <FormControl margin={'dense'} fullWidth>
                                    <InputLabel id="jira-issues-label">Issue Type</InputLabel>
                                    <Select
                                        margin={'dense'}
                                        disabled={isIssueTypesLoading || !jiraResource}
                                        labelId="jira-projects-label"
                                        id="jira-projects-select"
                                        value={jiraIssueTypes.find((project) => project.id === jiraIssueType)?.id}
                                        label={(isIssueTypesLoading || !jiraResource) ? 'Loading...' : 'Issue Type'}
                                        onChange={(e) => {
                                            setJiraIssueType(e.target.value as string);
                                        }}
                                    >
                                        {jiraIssueTypes.map((issue) => (
                                            <MenuItem key={issue.id} value={issue.id}>{issue.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>
                                <TextField
                                    autoFocus
                                    disabled={isSaving}
                                    error={!!newTicketErrorData.title}
                                    helperText={newTicketErrorData.title}
                                    onChange={
                                        (e) => setNewTicketData({
                                            ...newTicketData,
                                            title: e.target.value
                                        })
                                    }
                                    value={newTicketData.title}
                                    margin="dense"
                                    id="title"
                                    name="title"
                                    label="Ticket title"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                            <Grid2 size={6}>

                                <FormControl margin={'dense'} fullWidth>
                                    <InputLabel id="jira-users-label">Assignee</InputLabel>
                                    <Select
                                        margin={'dense'}
                                        disabled={isJiraUsersLoading || !jiraResource}
                                        labelId="jira-users-label"
                                        id="jira-users-select"
                                        value={jiraUsers.find((user) => user.accountId === jiraUser)?.accountId}
                                        label={(isJiraUsersLoading || !jiraResource) ? 'Loading...' : 'Assignee'}
                                        onChange={(e) => {
                                            setJiraUser(e.target.value as string);
                                        }}
                                    >
                                        {jiraUsers.map((user) => (
                                            <MenuItem key={user.accountId} value={user.accountId}>{user.displayName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={6}>

                                <FormControl margin={'dense'} fullWidth error={!!newTicketErrorData.dueDate}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Due Date"
                                            format="YYYY-MM-DD"
                                            value={dueDate}
                                            sx={{width: '100%'}}
                                            onChange={setDueDate}
                                            defaultValue={dueDate}
                                        />
                                        {newTicketErrorData.dueDate && (
                                            <FormHelperText error>{newTicketErrorData.dueDate}</FormHelperText>
                                        )}
                                    </LocalizationProvider>
                                </FormControl>
                            </Grid2>
                            <Grid2 size={12}>

                                <FormControl margin={'dense'} fullWidth >
                                    <InputLabel id="jira-content-label">Description</InputLabel>
                                    <Box sx={{mt: 2}}>
                                        <RichTextEditor

                                            ref={rteRef}
                                            extensions={[StarterKit]} // Or any Tiptap extensions you wish!
                                            content={ticketHtml} // Initial content for the editor
                                            // Optionally include `renderControls` for a menu-bar atop the editor:
                                            renderControls={() => (
                                                <MenuControlsContainer>
                                                    <MenuSelectHeading />
                                                    <MenuDivider />
                                                    <MenuButtonBold />
                                                    <MenuButtonItalic />
                                                    {/* Add more controls of your choosing here */}
                                                </MenuControlsContainer>
                                            )}
                                        />
                                    </Box>
                                </FormControl>
                            </Grid2>
                        </Grid2>
                    </>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '200px'
                        }}
                    >
                        {successMessage ? (
                            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <Box sx={{display: 'block'}}>
                                    <Typography variant={'h1'} color={'success'}>{successMessage}</Typography>
                                </Box>
                                {successUrl && (
                                    <Box sx={{display: 'block'}}>
                                        <a href={successUrl} target={'_blank'}>View ticket in jira</a>
                                    </Box>
                                )}
                            </Box>
                        ): (
                            <CircularProgress />
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>


                {generalError && (
                    <Typography variant={'body1'} color={'error'}>{generalError}</Typography>
                )}
                {successMessage ? (
                    <Button disabled={isSaving} onClick={handleClose} variant={'contained'}>Close</Button>
                ) : (
                    <Button disabled={isSaving} onClick={handleClose}>Close</Button>
                )}
                {!successMessage && (
                    <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        disabled={isSaving || !!successMessage}
                        variant={'contained'}
                        onClick={() => {
                            setIsSaving(true);
                            setGeneralError('');
                            setSuccessMessage('');
                            setSuccessUrl('');
                            setNewTicketErrorData({});
                            if(!newTicketData.title) {
                                setNewTicketErrorData({
                                    ...newTicketErrorData,
                                    title: 'Title is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!jiraResource) {
                                setNewTicketErrorData({
                                    ...newTicketErrorData,
                                    resource: 'Account is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!jiraProject) {
                                setNewTicketErrorData({
                                    ...newTicketErrorData,
                                    project: 'Project is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!jiraIssueType) {
                                setNewTicketErrorData({
                                    ...newTicketErrorData,
                                    issueType: 'Issue Type is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!jiraUser) {
                                setNewTicketErrorData({
                                    ...newTicketErrorData,
                                    assignee: 'Assignee is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            if(!dueDate) {
                                setNewTicketErrorData({
                                    ...newTicketErrorData,
                                    dueDate: 'Due date is required'
                                });
                                setIsSaving(false);
                                return;
                            }
                            async function save() {
                                const html = rteRef.current?.editor?.getHTML();
                                const response : {
                                    errorMessages: string[];
                                    errors: any;
                                    id: string;
                                    key: string;
                                    self: string;
                                } = await createJiraTicket(currentWorkspaceId, jiraResource, {
                                    title: newTicketData.title,
                                    text: html,
                                    resource: jiraResource,
                                    project: jiraProject,
                                    issueType: jiraIssueType,
                                    assignee: jiraUser,
                                    dueDate: dueDate?.format('YYYY-MM-DD') || ''
                                });
                                if (response.errorMessages?.length || !response.id) {
                                    setGeneralError('Error creating new ticket, please try again');
                                } else {
                                    setSuccessMessage('Issue created successfully');
                                    if(jiraResourceUrl) {
                                        setSuccessUrl(`${jiraResourceUrl}/browse/${response.key}`);
                                    }
                                }
                            }
                            save().then(() => {
                                setIsSaving(false);
                                //handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setGeneralError('Error creating new ticket, please try again');
                            })
                        }}
                    >{isSaving ? 'Creating...' : 'Create'} </Button>
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
                )}
            </DialogActions>
        </Dialog>
    );
}