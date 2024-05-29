'use client';
import Typography from "@mui/material/Typography";
import {Box} from "@mui/material";
import * as React from "react";
import {DataSources} from "@/app/models/WebsiteInfo";
import {useEffect, useState} from "react";

export default function ViewItem(props: { data: DataSources['data'][0], key: string, websiteUrl: string }) {
    const { data, key, websiteUrl } = props;
    const [isReady, setIsReady] = useState(false)

    const myUrl = new URL(websiteUrl)

    //get base url from websiteUrl
    let baseUrl = myUrl.protocol + '//' + myUrl.hostname
    if (myUrl.port) {
        baseUrl += ':' + myUrl.port
    }
    baseUrl += '/'
    useEffect(() => {
        setIsReady(true)
    }, []);

    function openLink(e: any) {
        //check if the link is external and open in new tab else append site url
        if(e.target?.getAttribute('href') && e.target?.getAttribute('href').startsWith('http')) {
            window.open(e.target?.getAttribute('href'), '_blank')
        } else {
            window.open(`${baseUrl}${e.target?.getAttribute('href')}`, '_blank')
        }
    }
    return isReady && (
        <Box key={key} sx={{mb: '20px'}}>
            <Typography variant={'h2'}>
                {data.title}
            </Typography>
            {data.helpText.map((help, idx) => {
                return <p
                    key={idx}
                    dangerouslySetInnerHTML={{__html: help}}
                    onClick={(e: any) => {
                        e.preventDefault();
                        if(e.target?.tagName === 'A') {
                            //check if the link is external and open in new tab else append site url
                            openLink(e)
                        }
                    }}
                ></p>
            })}
            {data.details.map((d, idx) => {
                if(!d.items?.length) {
                    return (
                        d.value && <p
                            key={`details-${idx}`}
                            dangerouslySetInnerHTML={{__html: d.value}}
                            onClick={(e: any) => {
                                e.preventDefault();
                                if(e.target?.tagName === 'A') {
                                    //check if the link is external and open in new tab else append site url
                                    openLink(e)
                                }
                            }}
                        ></p>
                    )
                }
                if(d.items?.length) {
                    return (
                        <Box key={`items-${idx}`}>
                            <p>{d.value}</p>
                            <ul>
                                {d.items.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </Box>
                    )
                }
            })}
        </Box>
    )
}