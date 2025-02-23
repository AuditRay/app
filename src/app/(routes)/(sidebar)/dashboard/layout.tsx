import { CONFIG } from '@/global-config';
import { DashboardLayout } from '@/layouts/dashboard';
import {redirect} from "next/navigation";


// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  redirect(`/workspace/personal/websites`);
  return null;
}
