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
import {Autocomplete, FormControl, FormHelperText, Grid2, InputLabel, Select} from "@mui/material";
import {
    createJiraTicket, getJiraProjects, getJiraIssues, getJiraUsers, getJiraResources, jiraIssueType, getJiraIssueFields
} from "@/app/actions/workspaceActions";
import * as React from "react";
import { useParams } from 'next/navigation'
import MenuItem from "@mui/material/MenuItem";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Typography from "@mui/material/Typography";
import JiraDatePicker from "@/app/ui/Integration/jira/fields/JiraDatePicker";
import JiraSelect from "@/app/ui/Integration/jira/fields/JiraSelect";
import JiraText from "@/app/ui/Integration/jira/fields/JiraText";
import JiraDescription from "@/app/ui/Integration/jira/fields/JiraDescription";
import JiraNumber from "@/app/ui/Integration/jira/fields/JiraNumber";
import {useUserStateStore} from "@/providers/user-store-provider";


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
export default function JiraTicketConfig({open, setOpen, config, setConfig}: {open: boolean, setOpen: (open: boolean) => void, config: Record<string, any>, setConfig: (config: Record<string, any>) => void}) {
    const params = useParams<{ workspaceId: string; }>()

    const [isSaving, setIsSaving] = useState(false);
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('');

    const [jiraResource, setJiraResource] = useState<string>(config['jiraResource'] || '');
    const [jiraResourceUrl, setJiraResourceUrl] = useState<string>('');
    const [jiraResources, setJiraResources] = useState<jiraResource[]>([]);
    const [isResourceLoading, setIsResourceLoading] = useState<boolean>(false);

    const [jiraProject, setJiraProject] = useState<string>(config['project'] || '');
    const [jiraProjects, setJiraProjects] = useState<jiraProject[]>([]);
    const [isProjectLoading, setIsProjectLoading] = useState<boolean>(false);

    const [jiraIssueType, setJiraIssueType] = useState<string>(config['issuetype'] || '');
    const [jiraIssueTypes, setJiraIssueTypes] = useState<jiraIssueType[]>([]);
    const [isIssueTypesLoading, setIsIssueTypesLoading] = useState<boolean>(false);

    const [jiraIssueTypeFields, setJiraIssueTypesFields] = useState<any[]>([]);
    const [isIssueTypeFieldsLoading, setIsIssueTypeFieldsLoading] = useState<boolean>(false);

    const [jiraUser, setJiraUser] = useState<string>('');
    const [jiraUsers, setJiraUsers] = useState<jiraUser[]>([]);
    const [isJiraUsersLoading, setIsJiraUsersLoading] = useState<boolean>(false);

    const [isAiLoading, setIsAiLoading ] = useState<boolean>(false);
    const [dueDate, setDueDate] = useState<Dayjs | null>(null);
    const [jiraIntegration, setJiraIntegration] = React.useState<{
        status?: boolean;
        token?: string;
        refreshToken?: string;
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

    const [ticketDataValues, setTicketDataValues] = useState<any>(config);
    const [ticketDataErrors, setTicketDataErrors] = useState<any>({});

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
    const reset = () => {
        setNewTicketErrorData({});
        setTicketDataValues({});
        setIsResourceLoading(true);
        setIsProjectLoading(true);
        setIsIssueTypesLoading(true);
        setIsJiraUsersLoading(true);
        setIsIssueTypeFieldsLoading(false);
        setIsAiLoading(false);
        setJiraProjects([]);
        setJiraIssueTypes([]);
        setJiraUser('');
        setJiraProject('');
        setJiraIssueType('');
        setJiraProjects([]);
        setJiraIssueTypes([]);
        setJiraUsers([]);
    }
    const handleClose = () => {
        reset();
        setOpen(false);
    }

    const sessionUser = useUserStateStore((state) => state.sessionFullUser);
    const prepareJiraIntegration = async (jiraResourceId?: string) => {
        setIsIssueTypeFieldsLoading(true);
        const resources: (jiraResource & { scope: string[] })[] = await getJiraResources(params.workspaceId);
        const resourcesPrepared: jiraResource[] = resources.map((resource) => ({
            id: resource.id,
            url: resource.url,
            name: resource.name,
            avatarUrl: resource.avatarUrl
        }));
        setTicketDataValues(config);
        console.log('config2', config);
        setJiraResources(resourcesPrepared);
        if (resourcesPrepared.length > 0) {
            const selectedResource = resourcesPrepared.find((resource) => resource.id === jiraResourceId);
            let resourceId = jiraResourceId || config['jiraResource'];
            if (!resourceId) {
                setJiraResource(resources[0].id);
                resourceId = resources[0].id;
            } else {
                setJiraResource(resourceId);
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
            } else {
                setJiraProjects(projectsPrepared);
                setJiraProject(config['project'] || projects[0].id);

                const issueTypes: jiraIssueType[] = await getJiraIssues(params.workspaceId, resourceId, config['project'] || projects[0].id);
                const issueTypesPrepared: jiraIssueType[] = issueTypes.map((issueType) => ({
                    id: issueType.id,
                    iconUrl: issueType.iconUrl,
                    name: issueType.name,
                    subtask: false
                }));
                setJiraIssueTypes(issueTypesPrepared);
                if (!issueTypesPrepared.length) {
                    setIsProjectLoading(false);
                    setIsResourceLoading(false);
                    setIsIssueTypesLoading(false);
                    setIsJiraUsersLoading(false);
                    setIsAiLoading(false);
                    setNewTicketErrorData({
                        ...newTicketErrorData,
                        issueType: 'No issue types found'
                    })
                } else {
                    setJiraIssueType(jiraIssueType || config['issuetype'] || issueTypes[0].id);
                    setIsIssueTypeFieldsLoading(true);
                    getJiraIssueFields(params.workspaceId, resourceId, config['project'] || projects[0].id, jiraIssueType || config['issuetype'] || issueTypes[0].id).then((jiraIssueFields) => {
                        prepareJiraFields(jiraIssueFields).then();
                    });

                    const users: jiraUser[] = await getJiraUsers(params.workspaceId, resourceId, config['project'] || projects[0].id);
                    const usersPrepared: jiraUser[] = users.map((user) => ({
                        accountId: user.accountId,
                        accountType: user.accountType,
                        html: user.html,
                        displayName: user.displayName
                    }));
                    setJiraUsers(usersPrepared);
                    if (!usersPrepared.length) {

                        setIsIssueTypeFieldsLoading(false);
                        setIsProjectLoading(false);
                        setIsResourceLoading(false);
                        setIsIssueTypesLoading(false);
                        setIsJiraUsersLoading(false);
                        setIsAiLoading(false);
                        setNewTicketErrorData({
                            ...newTicketErrorData,
                            assignee: 'No users found'
                        })
                    } else {
                        setJiraUser(jiraUser || users[0].accountId);
                    }
                }
            }
        }
        setIsIssueTypeFieldsLoading(false);
        setIsProjectLoading(false);
        setIsResourceLoading(false);
        setIsIssueTypesLoading(false);
        setIsJiraUsersLoading(false);
    }

    const prepareJiraFields = async (fields: any[]) => {
        setJiraIssueTypesFields(fields);
    }

    const updateJiraProject = async (jiraResourceId: string, jiraProjectId: string) => {
        setIsIssueTypeFieldsLoading(true);
        setIsProjectLoading(true);
        setIsIssueTypesLoading(true);
        setIsJiraUsersLoading(true);

        const issueTypes: jiraIssueType[] = await getJiraIssues(params.workspaceId, jiraResourceId, jiraProjectId);
        const issueTypesPrepared: jiraIssueType[] = issueTypes.map((issueType) => ({
            id: issueType.id,
            iconUrl: issueType.iconUrl,
            name: issueType.name,
            subtask: false
        }));
        setJiraIssueTypes(issueTypesPrepared);
        if (!issueTypesPrepared.length) {
            setIsProjectLoading(false);
            setIsResourceLoading(false);
            setIsIssueTypesLoading(false);
            setIsJiraUsersLoading(false);
            setIsAiLoading(false);
            setNewTicketErrorData({
                ...newTicketErrorData,
                issueType: 'No issue types found'
            })
        } else {
            setJiraIssueType(config['issuetype'] || issueTypes[0].id);

            setIsIssueTypeFieldsLoading(true);
            getJiraIssueFields(params.workspaceId, jiraResourceId, jiraProjectId, config['issuetype'] || issueTypes[0].id).then((jiraIssueFields) => {
                prepareJiraFields(jiraIssueFields).then();
            })
            const users: jiraUser[] = await getJiraUsers(params.workspaceId, jiraResourceId, jiraProjectId);
            const usersPrepared: jiraUser[] = users.map((user) => ({
                accountId: user.accountId,
                accountType: user.accountType,
                html: user.html,
                displayName: user.displayName
            }));
            setJiraUsers(usersPrepared);
            if (!usersPrepared.length) {

                setIsIssueTypeFieldsLoading(false);
                setIsProjectLoading(false);
                setIsResourceLoading(false);
                setIsIssueTypesLoading(false);
                setIsJiraUsersLoading(false);
                setIsAiLoading(false);
                setNewTicketErrorData({
                    ...newTicketErrorData,
                    assignee: 'No users found'
                })
            } else {
                setJiraUser(users[0].accountId);
            }
        }


        setIsIssueTypeFieldsLoading(false);
        setIsProjectLoading(false);
        setIsIssueTypesLoading(false);
        setIsJiraUsersLoading(false);
    }

    const updateJiraIssueType = async (jiraResourceId: string, jiraProjectId: string, jiraIssueTypeId: string) => {
        setIsIssueTypeFieldsLoading(true);
        getJiraIssueFields(params.workspaceId, jiraResourceId, jiraProjectId, jiraIssueTypeId).then((jiraIssueFields) => {
            prepareJiraFields(jiraIssueFields).then();
            setIsIssueTypeFieldsLoading(false);
        });
    }

    const getProjectAutocompleteValue = (jiraProjects: any[], jiraProject: any) => {
        const selectedProject = jiraProjects.find((project) => project.id === jiraProject)
        return {label: selectedProject?.name || '', id: selectedProject?.id || ''}
    }

    const getUserAutocompleteValue = (jiraUsers: any[], jiraUser: any) => {
        const selectedUser = jiraUsers.find((user) => user.accountId === jiraUser)
        return {label: selectedUser?.displayName, id: selectedUser?.accountId}
    }

    React.useEffect(() => {
        if(!open) return;

        const currentWorkspace = sessionUser?.workspaces?.find(workspace => workspace.id === params.workspaceId);
        if (currentWorkspace){
            setCurrentWorkspaceId(currentWorkspace.id);
            setJiraIntegration(currentWorkspace.jira || {status: false, token: '', refreshToken: ''});
            reset();
            setNewTicketData({});
            prepareJiraIntegration().then().catch((e) => {
                console.log('error', e);
                setIsProjectLoading(false);
                setIsIssueTypesLoading(false);
                setIsJiraUsersLoading(false);
            });
        }
    }, [open, sessionUser]);

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
                {!successMessage ? (
                    <>
                        <Grid2 container spacing={2}>
                            <Grid2 size={12}>
                                <FormControl margin={'dense'} fullWidth>
                                    <InputLabel id="jira-resources-label">Account</InputLabel>
                                    <Select
                                        error={!!newTicketErrorData.resource}
                                        disabled={isResourceLoading}
                                        labelId="jira-resources-label"
                                        id="jira-resources-select"
                                        value={jiraResources.find((resource) => resource.id === jiraResource)?.id || config['jiraResource'] || ''}
                                        label={isProjectLoading ? 'Loading...' : 'Account'}
                                        onChange={(e) => {
                                            reset();
                                            if(!e.target.value) return;
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
                            <Grid2 size={12}>
                                <FormControl margin={'dense'} fullWidth>
                                    <Autocomplete
                                        disabled={isProjectLoading}
                                        disablePortal
                                        options={jiraProjects.map((project) => (
                                            {label: project.name, id: project.id}
                                        ))}
                                        value={getProjectAutocompleteValue(jiraProjects, jiraProject || config['project'] || '')}
                                        onChange={(e: any, newValue: {id: string, label: string} | null) => {
                                            if(!newValue) return;
                                            setJiraProject(newValue.id);
                                            updateJiraProject(jiraResource, newValue.id).then();
                                        }}
                                        renderInput={(params) => <TextField {...params} label={isProjectLoading ? 'Loading...' : 'Project'} />}
                                    />
                                    {newTicketErrorData.project && (
                                        <FormHelperText error>{newTicketErrorData.project}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid2>
                            <Grid2 size={12}>
                                <FormControl margin={'dense'} fullWidth>
                                    <InputLabel id="jira-issues-label">Issue Type</InputLabel>
                                    <Select
                                        disabled={isIssueTypesLoading || !jiraResource}
                                        labelId="jira-projects-label"
                                        id="jira-projects-select"
                                        value={jiraIssueTypes.find((project) => project.id === jiraIssueType)?.id || config['issuetype'] || ''}
                                        label={(isIssueTypesLoading || !jiraResource) ? 'Loading...' : 'Issue Type'}
                                        onChange={(e) => {
                                            console.log('e.target.value', e.target.value);
                                            updateJiraIssueType(jiraResource, jiraProject, e.target.value as string).then();
                                            setJiraIssueType(e.target.value as string);
                                        }}
                                    >
                                        {jiraIssueTypes.map((issue) => (
                                            <MenuItem key={issue.id} value={issue.id}>{issue.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            {isIssueTypeFieldsLoading && (
                                <Box sx={{textAlign: 'center', width: "100%"}}>
                                    <CircularProgress />
                                </Box>
                            )}
                            {!isIssueTypeFieldsLoading && jiraIssueTypeFields.map((field) => {
                                    if(field.fieldType === 'date') {
                                        return (
                                            <Grid2
                                                key={field.fieldId} size={12}>
                                                <JiraDatePicker
                                                    label={field.name}
                                                    error={ticketDataErrors[field.fieldId]}
                                                    value={dayjs(ticketDataValues[field.fieldId]) || dayjs(new Date(config[field.fieldId])) || ''}
                                                    setValue={(value) => {
                                                        setTicketDataValues({
                                                            ...ticketDataValues,
                                                            [field.fieldId]: value
                                                        });
                                                    }}
                                                ></JiraDatePicker>
                                            </Grid2>)
                                    } else if (field.fieldType === 'text') {
                                        return (
                                            <Grid2
                                                key={field.fieldId} size={12}>
                                            <JiraText
                                            fieldId={field.fieldId}
                                            label={field.name}
                                            error={ticketDataErrors[field.fieldId]}
                                            value={ticketDataValues[field.fieldId] || config[field.fieldId] || ''}
                                            setValue={(value) => {
                                                setTicketDataValues({
                                                    ...ticketDataValues,
                                                    [field.fieldId]: value
                                                });
                                            }}
                                            ></JiraText></Grid2>)
                                    } else if (field.fieldType === 'number') {
                                        return (
                                            <Grid2
                                                key={field.fieldId} size={12}>
                                                <JiraNumber
                                                    fieldId={field.fieldId}
                                                    label={field.name}
                                                    error={ticketDataErrors[field.fieldId]}
                                                    value={ticketDataValues[field.fieldId] || config[field.fieldId] || ''}
                                                    setValue={(value) => {
                                                        setTicketDataValues({
                                                            ...ticketDataValues,
                                                            [field.fieldId]: value
                                                        });
                                                    }}
                                                ></JiraNumber></Grid2>)
                                    } else if (field.fieldType === 'summary') {
                                        return null
                                    } else if (field.fieldType === 'select') {
                                        return (<Grid2
                                            key={field.fieldId} size={12}>
                                            <JiraSelect
                                            fieldId={field.fieldId}
                                            isMultiple={field.multiple}
                                            label={field.name}
                                            options={field.allowedValues.map((value: any) => ({
                                                id: value.id || value.accountId,
                                                label: value.value || value.name || value.displayName
                                            }))}
                                            getValue={(options, value) => {
                                                if(Array.isArray(value)) {
                                                    return options.filter((option) => value.find((v) => v.id === option.id));
                                                }
                                                return options.find((option) => option.id === value);
                                            }}
                                            error={ticketDataErrors[field.fieldId]}
                                            value={ticketDataValues[field.fieldId] || config[field.fieldId] || ''}
                                            setValue={(value) => {
                                                console.log('value', value);
                                                setTicketDataValues({
                                                    ...ticketDataValues,
                                                    [field.fieldId]: value
                                                });
                                            }}
                                        ></JiraSelect></Grid2>)
                                    } else if (field.fieldType === 'description') {
                                        return null;
                                    }
                                    return (
                                        <Box key={field.fieldId}>{field.fieldId} {field.fieldType}</Box>
                                    )
                                })}
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
                            setTicketDataErrors({});
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

                            const fieldErrors: Record<string, string> = {};
                            for (const field of jiraIssueTypeFields) {
                                if(field.required && !ticketDataValues[field.fieldId]) {
                                    if (field.fieldType === 'description') {
                                        continue;
                                    } else if(field.fieldType === 'summary') {
                                        continue;
                                    } else {
                                        setTicketDataErrors({
                                            ...ticketDataErrors,
                                            [field.fieldId]: 'This field is required'
                                        });
                                        fieldErrors[field.fieldId] = 'This field is required';
                                    }
                                }
                            }
                            if(Object.keys(fieldErrors).length) {
                                setIsSaving(false);
                                return;
                            }
                            const values: Record<string, any> = {};
                            for (const field of jiraIssueTypeFields) {
                                values[field.fieldId] = ticketDataValues[field.fieldId];
                                if(field.fieldType === 'number') {
                                    values[field.fieldId] = parseInt(values[field.fieldId]);
                                }
                                if(field.fieldType === 'date') {
                                    values[field.fieldId] = dayjs(values[field.fieldId]).utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                                }
                            }
                            console.log('values', values);
                            async function save() {
                                setConfig({
                                    currentWorkspaceId,
                                    jiraResource,
                                    project: jiraProject,
                                    issuetype: jiraIssueType,
                                    ...values
                                })
                            }
                            save().then(() => {
                                setIsSaving(false);
                                handleClose();
                            }).catch((e) => {
                                setIsSaving(false);
                                setGeneralError('Error saving ticket config, please try again');
                            })
                        }}
                    >{isSaving ? 'Saving...' : 'Save'} </Button>
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