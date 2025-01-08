import {NextRequest} from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const data = await request.json()
    console.log('data', data);
    return Response.json(data)
}