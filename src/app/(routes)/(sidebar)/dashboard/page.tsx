import { redirect } from 'next/navigation'
// ----------------------------------------------------------------------

export default function Page() {
  redirect(`/workspace/personal/projects`);
  return null;
}
