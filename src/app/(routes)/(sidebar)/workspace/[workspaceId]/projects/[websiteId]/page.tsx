'use client'
import Link from "@/app/ui/Link";
import {Grid2 as Grid, Paper, Box, Typography, Divider, IconButton, Menu, MenuItem} from "@mui/material";
import * as React from "react";
import {fetchUpdates, getLatestWebsiteInfo, getWebsite, getWebsiteViews} from "@/app/actions/websiteActions";
import Markdown from 'react-markdown'
import LaunchIcon from "@mui/icons-material/Launch";
import WebsitesInfoGrid from "@/app/ui/WebsitesInfoGrid";
import dayjs from "dayjs";
import WebsitesTabs from "@/app/ui/WebsiteTabs";
import RightDrawer from "@/app/ui/RightDrawer";
import {DefaultView, FieldsTemplate, FieldValue, IFieldsTemplate, IWebsite, IWebsiteInfo} from "@/app/models";
import {getWorkspaceFieldTemplate} from "@/app/actions/fieldTemplateActions";
import {useParams} from "next/navigation";
import {LoadingScreen} from "@/components/loading-screen";
import UpdateWebsiteDialog from "@/app/ui/Websites/Dialogs/UpdateWebsiteDialog";
import WebsiteTokenDialog from "@/app/ui/Websites/Dialogs/WebsiteTokenDialog";
import WebsiteRunsDialog from "@/app/ui/Websites/Dialogs/WebsiteRunsDialog";
import UpdateWebsiteInfoDialog from "@/app/ui/Websites/Dialogs/UpdateWebsiteInfoDialog";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UpdateWebsiteFieldValuesDialog from "@/app/ui/Websites/Dialogs/UpdateWebsiteFieldValuesDialog";

const ITEM_HEIGHT = 48;

export default function WebsitePage() {
    const { websiteId, workspaceId } = useParams<{
        workspaceId: string,
        websiteId: string
    }>()

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    const [editOpen, setEditOpen] = React.useState<boolean>(false);
    const [tokenOpen, setTokenOpen] = React.useState<boolean>(false);
    const [runsOpen, setRunsOpen] = React.useState<boolean>(false);
    const [updateInfoOpen, setUpdateInfoOpen] = React.useState<boolean>(false);
    const [updateFieldValuesOpen, setUpdateFieldValuesOpen] = React.useState<boolean>(false);


    const [website, setWebsite] = React.useState<IWebsite | null>();
    const [websiteViews, setWebsiteViews] = React.useState<DefaultView[]>([]);
    const [websiteInfo, setWebsiteInfo] = React.useState<IWebsiteInfo | null>();
    const [workspaceFieldTemplateData, setWorkspaceFieldTemplateData] = React.useState<IFieldsTemplate | null>();
    const [websiteFields, setWebsiteFields] = React.useState<any[]>([]);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

    const load = async () => {
        const website = await getWebsite(websiteId);
        const websiteViews = await getWebsiteViews(websiteId);
        const websiteInfo = await getLatestWebsiteInfo(websiteId);
        setWebsite(website);
        setWebsiteViews(websiteViews);
        setWebsiteInfo(websiteInfo);
        let websiteFields = [];
        const workspaceFieldTemplateData = await getWorkspaceFieldTemplate(workspaceId);
        if(website && workspaceFieldTemplateData?.fields) {
            setWorkspaceFieldTemplateData(workspaceFieldTemplateData);
            for (const field of workspaceFieldTemplateData.fields) {
                const fieldValue = website.fieldValues?.find((fieldValue) => fieldValue.id === field.id);
                if(fieldValue?.value) {
                    websiteFields.push({
                        ...field,
                        value: fieldValue?.value
                    });
                }
            }
            setWebsiteFields(websiteFields);
        }
    }
    React.useEffect(() => {
        load().then(() => setIsLoaded(true));
    }, [])

    return !isLoaded ? (
            <Box sx={{height: '100%', pt: "20%"}}>
                <LoadingScreen />
            </Box>
        ) : (
            <>
                <Grid container={true} spacing={2} sx={{mt: 2}}>
                    <Grid size={12}>
                        <Paper
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {editOpen && <UpdateWebsiteDialog open={editOpen} setOpenAction={(open, isCancel) => {
                                if(isCancel) return setEditOpen(open);
                                load().then(() => setEditOpen(open));
                            }} websiteId={websiteId} workspaceId={workspaceId} />}
                            {tokenOpen && <WebsiteTokenDialog open={tokenOpen} setOpenAction={setTokenOpen} websiteId={websiteId} />}
                            {runsOpen && <WebsiteRunsDialog open={runsOpen} setOpenAction={setRunsOpen} websiteId={websiteId} />}
                            {updateInfoOpen && <UpdateWebsiteInfoDialog open={updateInfoOpen} setOpenAction={setUpdateInfoOpen} websiteId={websiteId} />}
                            {updateFieldValuesOpen && website && workspaceFieldTemplateData && workspaceFieldTemplateData.fields.length > 0 && (
                                <UpdateWebsiteFieldValuesDialog open={updateFieldValuesOpen} setOpenAction={setUpdateFieldValuesOpen} websiteId={websiteId} fieldsTemplateId={workspaceFieldTemplateData.id} website={website} fieldsTemplate={workspaceFieldTemplateData}/>
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: "center" }}>
                                <Box>
                                    {website && (
                                        <Box>
                                            <Typography variant={'h3'}>
                                                <Box component={'img'}  src={`${website.favicon}`} alt={website.siteName || website.title} sx={{width: '30px', verticalAlign: 'middle', mr: '10px'}} />
                                                {website.siteName || website.title}
                                                <Link href={website.url} target={'_blank'}>
                                                    <LaunchIcon fontSize={'small'} sx={{verticalAlign: 'middle', ml: '5px'}}></LaunchIcon>
                                                </Link>
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ml: "auto"}}>
                                    <IconButton
                                        aria-label="more"
                                        id="long-button"
                                        aria-controls={open ? 'long-menu' : undefined}
                                        aria-expanded={open ? 'true' : undefined}
                                        aria-haspopup="true"
                                        onClick={handleClick}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        id="long-menu"
                                        MenuListProps={{
                                            'aria-labelledby': 'long-button',
                                        }}
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={handleClose}
                                        slotProps={{
                                            paper: {
                                                style: {
                                                    maxHeight: ITEM_HEIGHT * 4.5,
                                                    width: '20ch',
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem onClick={() => {
                                            setEditOpen(true);
                                            handleClose()
                                        }}>
                                            Edit Website
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            setUpdateFieldValuesOpen(true);
                                            handleClose()
                                        }}>
                                            Edit Fields
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            setTokenOpen(true);
                                            handleClose()
                                        }}>
                                            Connection Token
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            setRunsOpen(true);
                                            handleClose()
                                        }}>
                                            Update Runs
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            setUpdateInfoOpen(true);
                                            handleClose()
                                        }}>
                                            Update Website Info
                                        </MenuItem>
                                    </Menu>
                                </Box>
                            </Box>
                            {website && workspaceFieldTemplateData && workspaceFieldTemplateData.fields.length > 0 && websiteFields && websiteFields.length > 0 ? (
                                <>
                                    <Box sx={{mt: 2}}>
                                        {websiteFields.map((field) => (
                                            // print as field label: value
                                            <Typography key={field.id} variant={'body1'}>
                                                {field.title}: {field.value}
                                            </Typography>
                                        ))}
                                    </Box>
                                </>
                            ) : ('')}
                        </Paper>
                    </Grid>
                </Grid>
                <Grid container={true} spacing={2} sx={{mt: 2}}>
                    <Grid size={8}>
                        <Paper
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                mt: '20px'
                            }}
                        >
                            {website && websiteInfo ? (
                                <div>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: '20px' }}>
                                        <WebsitesTabs website={website} views={websiteViews} selectedViewId='' websiteInfo={websiteInfo}/>
                                    </Box>
                                    <Box sx={{display: 'flex', width: '100%'}}>
                                        <Box>
                                            {/*{website.aiSummary && (*/}
                                            {/*     <CollapseMD title={'Updates Summary'} md={website.aiSummary}/>*/}
                                            {/*)}*/}
                                        </Box>
                                        <Box sx={{textAlign: 'right', ml: 'auto'}}>
                                            <Typography variant={'overline'} sx={{mb: '20px'}}>
                                                Last Update: {dayjs(websiteInfo.updatedAt).format('DD MMM YYYY HH:mm:ss')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {websiteInfo.frameworkInfo && (
                                        <Box sx={{mb: '50px'}}>
                                            <Typography variant={'h4'} sx={{mb: '20px'}}>
                                                Main Framework
                                            </Typography>
                                            <div>
                                                <Box component={'div'}>
                                                    <Typography variant={'subtitle1'}>
                                                        {website.type && (<Box component={'img'} src={`/tech/${website.type.icon}`}
                                                             alt={website.type.name}
                                                             sx={{width: '20px', verticalAlign: 'text-bottom', mr:'10px'}}/>)} {website.type.name}</Typography>
                                                </Box>
                                                <WebsitesInfoGrid websiteInfo={[websiteInfo.frameworkInfo]} enableRightDrawer={true} website={website} frameworkInfo={websiteInfo.frameworkInfo}/>
                                            </div>
                                        </Box>
                                    )}
                                    {websiteInfo.websiteComponentsInfo && (
                                        <>
                                            <Typography variant={'h4'} sx={{mb: '20px'}}>
                                                Website Components
                                            </Typography>
                                            <WebsitesInfoGrid websiteInfo={websiteInfo.websiteComponentsInfo} enableRightDrawer={true} website={website} frameworkInfo={websiteInfo.frameworkInfo}/>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {website && website.aiSEOSummary && (
                                        <Box sx={{mb: 2}}>
                                            <Markdown>{website.aiSEOSummary}</Markdown>
                                        </Box>
                                    )}
                                </div>
                            )}
                        </Paper>
                    </Grid>
                    <Grid size={4}>
                        <Paper
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                mb: 2
                            }}
                        >
                            {website && (
                                <div>
                                    {website.metadata?.description && (
                                        <Box sx={{mb: '30px'}}>
                                            <Typography variant={'h4'}>
                                                Description
                                            </Typography>
                                            <Typography variant={'body2'}> {website.metadata?.description}</Typography>
                                        </Box>
                                    )}
                                </div>
                            )}
                        </Paper>

                        <Paper
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {website && (
                                <div>
                                    {website.type && (
                                        <Box sx={{mb: '50px'}}>

                                            {/*{website.aiSEOSummary && (*/}
                                            {/*    <CollapseMD title={'Website General Summary'} md={website.aiSEOSummary}/>*/}
                                            {/*)}*/}
                                            <Typography variant={'h4'} sx={{mb: '20px'}}>
                                                Main Technology
                                            </Typography>
                                            <div>
                                                <Box component={'div'}>
                                                    <Typography variant={'subtitle1'}>
                                                        <Box component={'img'} src={`/tech/${website.type.icon}`}
                                                             alt={website.type.name}
                                                             sx={{width: '20px', verticalAlign: 'text-bottom', mr:'10px'}}/> {website.type.name}</Typography>
                                                </Box>
                                                <Box component={'div'}>
                                                    <Typography variant={'body2'}>{website.type.description}</Typography>
                                                </Box>
                                            </div>
                                        </Box>
                                    )}
                                    {website.technologies && (
                                        <>
                                            <Typography variant={'h4'}>
                                                Other Technologies
                                            </Typography>
                                            {website.technologies.map((tech) => {
                                                if(tech.slug === website.type.slug) return null;
                                                return (
                                                    <Box key={tech.slug}>
                                                        <Box  sx={{mb: '20px', mt: '20px'}}>
                                                            <Box component={'div'}>
                                                                <Typography variant={'subtitle1'}>
                                                                    <Box component={'img'} src={`/tech/${tech.icon}`}
                                                                         alt={tech.name}
                                                                         sx={{width: '20px', verticalAlign: 'text-bottom', mr:'10px'}}/> {tech.name}</Typography>
                                                            </Box>
                                                            <Box component={'div'}>
                                                                <Typography variant={'body2'}>{tech.description}</Typography>
                                                            </Box>
                                                        </Box>
                                                        <Divider></Divider>
                                                    </Box>
                                                )
                                            })}
                                        </>
                                    )}
                                </div>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
                <RightDrawer></RightDrawer>
            </>
    );
}
