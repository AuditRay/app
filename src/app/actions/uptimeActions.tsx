'use server'

import {
    SignupFormSchema,
    FormState,
    LoginFormSchema,
    LoginFormState,
    JoinFormState,
    JoinFormSchema
} from '@/app/lib/definitions'
import { connectMongo } from '@/app/lib/database'
import {IUser, User, Website} from '../models'
import bcrypt from 'bcrypt';
import { createSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import axios from "axios";

interface MonitorLog {
    type: string;
    datetime: string;
    duration: string;
}

interface Monitor {
    id: number;
    friendly_name: string;
    url: string;
    type: string;
    sub_type: string;
    keyword_type: string;
    keyword_case_type: string;
    keyword_value: string;
    http_username: string;
    http_password: string;
    port: string;
    interval: string;
    status: number;
    create_datetime: string;
    monitor_group: string;
    is_group_main: string;
    logs: MonitorLog[];
}

interface Pagination {
    offset: string;
    limit: string;
    total: string;
}

interface MonitorsResponse {
    stat: string;
    pagination: Pagination;
    monitors: Monitor[];
}


export async function getMonitor(url?: string): Promise<MonitorsResponse | null> {
    if (!process.env.UPTIMEROBOT_API_KEY) {
        return null;
    }
    const formData: Record<string, string> = {
        api_key: process.env.UPTIMEROBOT_API_KEY,
        format: 'json',
        logs: '1'
    }
    if (url) {
        formData.search = url;
    }
    const options = {
        method: 'POST',
        url: 'https://api.uptimerobot.com/v2/getMonitors',
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams(formData),
    };

    try {
        const response = await axios<any, {data: MonitorsResponse}>(options);
        console.log(response.data);
        return response.data;
    } catch (e: any) {
        console.error('Error:', e.message);
    }
    return null;
}
export async function getWebsiteMonitor(websiteId: string): Promise<MonitorsResponse | null> {
    if (!process.env.UPTIMEROBOT_API_KEY) {
        return null;
    }
    const website = await Website.findOne({ _id: websiteId });
    if (!website) {
        return null;
    }
    const formData: Record<string, string> = {
        api_key: process.env.UPTIMEROBOT_API_KEY,
        format: 'json',
        logs: '1',
        search: website.url
    }
    const options = {
        method: 'POST',
        url: 'https://api.uptimerobot.com/v2/getMonitors',
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams(formData),
    };

    try {
        const response = await axios<any, {data: MonitorsResponse}>(options);
        if (response.data.monitors.length === 0) {
            return null;
        }
        return response.data;
    } catch (e: any) {
        console.error('Error:', e.message);
    }
    return null;
}

type CreateMonitorResponse =  {
    stat: string;
    monitor: {id: number, status: number};
}
export async function newMonitor(websiteId: string): Promise<CreateMonitorResponse | null> {
    if (!process.env.UPTIMEROBOT_API_KEY) {
        return null;
    }
    const website = await Website.findOne({ _id: websiteId });
    if (!website) {
        return null;
    }
    const formData: Record<string, string> = {
        api_key: process.env.UPTIMEROBOT_API_KEY,
        format: 'json',
        type: '1',
        url: website.url,
        friendly_name: website.url,
        alert_contacts: "6794734_0_0"
    }
    const options = {
        method: 'POST',
        url: 'https://api.uptimerobot.com/v2/newMonitor',
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams(formData),
    };

    try {
        const response = await axios<any, {data: CreateMonitorResponse}>(options);
        console.log(response.data);
        return response.data;
    } catch (e: any) {
        console.error('Error:', e.message);
    }
    return null;
}

export async function removeMonitor(websiteId: string): Promise<Boolean> {
    if (!process.env.UPTIMEROBOT_API_KEY) {
        return false;
    }
    const website = await Website.findOne({ _id: websiteId });
    if (!website) {
        return false;
    }
    if(! website.uptimeMonitorInfo ){
        return true;
    }
    if (!website.uptimeMonitorInfo.monitorId) {
        return true;
    }
    const formData: Record<string, string> = {
        api_key: process.env.UPTIMEROBOT_API_KEY,
        format: 'json',
        id: website.uptimeMonitorInfo.monitorId.toString(),
    }
    const options = {
        method: 'POST',
        url: 'https://api.uptimerobot.com/v2/deleteMonitor',
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams(formData),
    };

    try {
        const response = await axios<any, {data: {"stat": string, "monitor": {"id": string}}}>(options);
        console.log(response.data);
        return response.data.stat === 'ok';
    } catch (e: any) {
        console.error('Error:', e.message);
    }
    return false;
}