'use server'
import Link from "@/app/ui/Link";
import {Grid, Paper, Box, Typography, Divider} from "@mui/material";
import * as React from "react";
import {fetchUpdates, getWebsite, getWebsiteViews} from "@/app/actions/websiteActions";
import Markdown from 'react-markdown'
import LaunchIcon from "@mui/icons-material/Launch";
import WebsiteConnectionTokenModal from "@/app/ui/WebsiteConnectionModal";
import dayjs from "dayjs";
import CollapseMD from "@/app/ui/CollapseMD.jsx";
import {DataSources} from "@/app/models/WebsiteInfo";
import ViewGrid from "@/app/ui/ViewGrid";
import WebsitesTabs from "@/app/ui/WebsiteTabs";
import {redirect} from "next/navigation";
import RightDrawer from "@/app/ui/RightDrawer";
import {Suspense} from "react";
import UpdateWebsiteFieldValuesModal from "@/app/ui/UpdateWebsiteFieldValuesModal";
import {FieldsTemplate} from "@/app/models";

export default async function WebsitePage({ params }: { params: { websiteId: string, viewId: string } }) {
    const { websiteId, viewId } = params;
    const website = await getWebsite(websiteId);
    const websiteViews = await getWebsiteViews(websiteId);
    const websiteView = websiteViews.find((view) => view.id === viewId);
    const websiteInfo = await fetchUpdates(websiteId);
    const formattedData: DataSources['data'] = [];
    if (websiteView) {
        for (const dataSource of websiteView.dataSources) {
            const websiteViewData = websiteInfo?.dataSourcesInfo.find((ds) => ds.id === dataSource.id);
            if (websiteViewData?.data) {
                for (const data of websiteViewData.data) {
                    if(dataSource.fields.includes(data.id)) {
                        formattedData.push(data);
                    }
                }
            }
        }
    } else {
        // redirect to update page
        redirect(`/websites/${websiteId}`)
    }

    const websiteFields = [];
    if(website && website.fieldsTemplate) {
        const websiteFieldsTemplate = await FieldsTemplate.findOne({_id: website.fieldsTemplate});
        const websiteFieldsTemplateData = websiteFieldsTemplate?.toJSON();
        if(websiteFieldsTemplateData?.fields) {
            for (const field of websiteFieldsTemplateData.fields) {
                const fieldValue = website.fieldValues?.find((fieldValue) => fieldValue.id === field.id);
                websiteFields.push({
                    ...field,
                    value: fieldValue?.value
                });
            }
        }
    }
    return (
        <>
            <Suspense fallback={<p>Loading Data...</p>}>
                <Grid item xs={8}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {website && (
                            <div>
                                <Typography variant={'h1'}>
                                    <Box component={'img'}  src={`${website.favicon}`} alt={website.title} sx={{width: '30px', verticalAlign: 'middle', mr: '10px'}} />
                                    {website.title}
                                    <Link href={website.url} target={'_blank'}>
                                        <LaunchIcon fontSize={'small'} sx={{verticalAlign: 'middle', ml: '5px'}}></LaunchIcon>
                                    </Link>
                                </Typography>
                            </div>
                        )}
                        {website && website.fieldsTemplate && websiteFields && websiteFields.length && (
                            <>
                                <Box sx={{mt: 2}}>
                                    {websiteFields.map((field) => (
                                        // print as field label: value
                                        <Typography key={field.id} variant={'body1'}>
                                            {field.title}: {field.value}
                                        </Typography>
                                    ))}
                                </Box>
                                <Box sx={{textAlign: 'right'}}>
                                    <UpdateWebsiteFieldValuesModal websiteId={website.id} fieldsTemplateId={website.fieldsTemplate as string}></UpdateWebsiteFieldValuesModal>
                                </Box>
                            </>
                        )}
                    </Paper>
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
                                    <WebsitesTabs website={website} views={websiteViews} selectedViewId={viewId} websiteInfo={websiteInfo} />
                                </Box>
                                <Box sx={{display: 'flex', width: '100%'}}>
                                    <Box sx={{textAlign: 'right', ml: 'auto'}}>
                                        <Typography variant={'overline'} sx={{mb: '20px'}}>
                                            Last Update: {dayjs(websiteInfo.updatedAt).format('DD MMM YYYY HH:mm:ss')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <ViewGrid ViewItems={formattedData} website={website}/>
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
                <Grid item xs={4}>
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
                                <WebsiteConnectionTokenModal websiteId={website.id}/>
                            </div>
                        )}
                    </Paper>

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
                                        <Typography variant={'h2'}>
                                            Description
                                        </Typography>
                                        <Typography variant={'body2'}> {website.metadata?.description}</Typography>
                                    </Box>
                                )}

                                <Box component={'div'} sx={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
                                    <Typography variant={'h2'}>
                                        Tech Stack
                                    </Typography>
                                    <Box key={`${website.type.slug}-wrapper`} component={'div'} sx={{width: '20px'}}>
                                        <Box component={'img'}  src={`/tech/${website.type.icon}`} alt={website.type.name} sx={{width: '100%' }} />
                                    </Box>
                                    {website.type.subTypes?.length > 0 && website.type.subTypes.map((subType) => (
                                        <Box key={`${subType.slug}-wrapper`} component={'div'} sx={{width: '20px'}}>
                                            <Box component={'img'} key={subType.slug} src={`/tech/${subType.icon}`} alt={subType.name} sx={{width: '100%' }}/>
                                        </Box>
                                    ))}
                                </Box>
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

                                        {website.aiSEOSummary && (
                                            <CollapseMD title={'Website General Summary'} md={website.aiSEOSummary}/>
                                        )}
                                        <Typography variant={'h2'} sx={{mb: '20px'}}>
                                            Main Technology
                                        </Typography>
                                        <div>
                                            <Box key={`${website.type.slug}-wrapper`} component={'div'}>
                                                <Typography variant={'subtitle1'}>
                                                    <Box component={'img'} src={`/tech/${website.type.icon}`}
                                                         alt={website.type.name}
                                                         sx={{width: '20px', verticalAlign: 'text-bottom', mr:'10px'}}/> {website.type.name}</Typography>
                                            </Box>
                                            <Box key={`${website.type.slug}-wrapper`} component={'div'}>
                                                <Typography variant={'body2'}>{website.type.description}</Typography>
                                            </Box>
                                        </div>
                                    </Box>
                                )}
                                {website.technologies && (
                                    <>
                                        <Typography variant={'h2'}>
                                            Other Technologies
                                        </Typography>
                                        {website.technologies.map((tech) => {
                                            if(tech.slug === website.type.slug) return null;
                                            return (
                                                <Box key={tech.slug}>
                                                    <Box  sx={{mb: '20px', mt: '20px'}}>
                                                        <Box key={`${tech.slug}-wrapper`} component={'div'}>
                                                            <Typography variant={'subtitle1'}>
                                                                <Box component={'img'} src={`/tech/${tech.icon}`}
                                                                     alt={tech.name}
                                                                     sx={{width: '20px', verticalAlign: 'text-bottom', mr:'10px'}}/> {tech.name}</Typography>
                                                        </Box>
                                                        <Box key={`${tech.slug}-wrapper`} component={'div'}>
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
                <RightDrawer></RightDrawer>
            </Suspense>
        </>
    );
}
