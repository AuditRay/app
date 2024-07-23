'use client'
import * as React from "react";
import {Grid, List, Paper} from "@mui/material";
import Typography from "@mui/material/Typography";
import {MainListItems} from "@/app/ui/ListItems";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListItemText from "@mui/material/ListItemText";
import LanguageIcon from "@mui/icons-material/Language";
import { useRouter } from 'next/navigation';
import InputIcon from '@mui/icons-material/Input';
import GroupIcon from '@mui/icons-material/Group';
import {IUser} from "@/app/models";
import {getFiltersViews} from "@/app/actions/filterViewsActions";
import {getUser} from "@/app/actions/getUser";

export default function Settings() {
    const [user, setUser] = React.useState<IUser | null>(null);
    React.useEffect(() => {
        getUser().then((user) => {
            setUser(user);
        });
    }, []);
    const router = useRouter();
    return (
        <>
            <Typography variant={'h1'}>Users</Typography>
        </>
    );
}
