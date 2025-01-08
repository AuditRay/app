import {NextRequest} from "next/server";
import {Website} from "@/app/models";

export async function POST(request: NextRequest) {
    const data = await request.json()
    if(data.monitorID) {
        console.log('monitorID', data);
        const website = await Website.findOne({
            $or: [{"uptimeMonitorInfo.monitorId": data.monitorID * 1}, {"uptimeMonitorInfo.monitorId": data.monitorID}]
        });
        if(website) {
            if (!website.uptimeMonitorInfo) {
                website.uptimeMonitorInfo = {
                    monitorId: data.monitorID,
                    status: data.alertType * 1,
                    lastChecked: new Date(),
                    alerts: [data],
                };
            }
            website.uptimeMonitorInfo.status = data.alertType * 1;
            website.uptimeMonitorInfo.lastChecked = new Date();
            if (!website.uptimeMonitorInfo.alerts || !website.uptimeMonitorInfo.alerts.length) {
                website.uptimeMonitorInfo.alerts = [data];
            } else {
                website.uptimeMonitorInfo.alerts.push(data);
            }
            website.markModified('uptimeMonitorInfo');
            await website.save();
        }
    }
    return Response.json(data)
}