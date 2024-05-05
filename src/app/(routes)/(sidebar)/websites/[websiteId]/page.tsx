'use server'
import {getUser} from "@/app/actions/getUser";
import {Link} from "@/app/ui/Link";
import {Grid, Paper, Box} from "@mui/material";
import * as React from "react";
import {fetchUpdates, getWebsite} from "@/app/actions/websiteActions";
import Markdown from 'react-markdown'
import Typography from "@mui/material/Typography";
import LaunchIcon from "@mui/icons-material/Launch";
import Divider from '@mui/material/Divider';
import WebsiteConnectionTokenModal from "@/app/ui/WebsiteConnectionModal";
import WebsitesInfoGrid from "@/app/ui/WebsitesInfoGrid";
import dayjs from "dayjs";
import CollapseMD from "@/app/ui/CollapseMD.jsx";

export default async function WebsitePage({ params }: { params: { websiteId: string }}) {
    const { websiteId } = params;
    const website = await getWebsite(websiteId);
    let websiteInfo = await fetchUpdates(websiteId);

    return (
        <>
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
                            <Box sx={{display: 'flex', width: '100%'}}>
                                <Box>
                                    {website.aiSummary && (
                                        <CollapseMD title={'Updates Summary'} md={website.aiSummary}/>
                                    )}
                                </Box>
                                <Box sx={{textAlign: 'right', ml: 'auto'}}>
                                    <Typography variant={'overline'} sx={{mb: '20px'}}>
                                        Last Update: {dayjs(websiteInfo.updatedAt).format('DD MMM YYYY HH:mm:ss')}
                                    </Typography>
                                </Box>
                            </Box>
                            {websiteInfo.frameworkInfo && (
                                <Box sx={{mb: '50px'}}>
                                    <Typography variant={'h2'} sx={{mb: '20px'}}>
                                        Main Framework
                                    </Typography>
                                    <div>
                                        <Box key={`${websiteInfo.frameworkInfo.name}-wrapper`} component={'div'}>
                                            <Typography variant={'subtitle1'}>
                                                <Box component={'img'} src={`/tech/${website.type.icon}`}
                                                     alt={website.type.name}
                                                     sx={{width: '20px', verticalAlign: 'text-bottom', mr:'10px'}}/> {website.type.name}</Typography>
                                        </Box>
                                        <WebsitesInfoGrid websiteInfo={[websiteInfo.frameworkInfo]}/>
                                    </div>
                                </Box>
                            )}
                            {websiteInfo.websiteComponentsInfo && (
                                <>
                                    <Typography variant={'h2'} sx={{mb: '20px'}}>
                                        Website Components
                                    </Typography>
                                    <WebsitesInfoGrid websiteInfo={websiteInfo.websiteComponentsInfo}/>
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
        </>
    );
}
