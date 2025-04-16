import { redirect } from 'next/navigation'
// ----------------------------------------------------------------------

export default async function Page({searchParams, params}: {
  searchParams: Promise<Record<string, string>>,
  params: Promise<{ workspaceId: string }>
}) {
    const {workspaceId} = await params;
    if(!workspaceId || workspaceId === 'personal') {
      redirect(`/workspace/personal/projects`);
      return null;
    } else {
        redirect(`/workspace/${workspaceId}/projects`);
        return null;
    }
}
