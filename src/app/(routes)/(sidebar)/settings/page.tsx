'use client'
import * as React from "react";
import Typography from "@mui/material/Typography";
import { useRouter } from 'next/navigation';
import {IUser} from "@/app/models";
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
            <Typography variant={'h1'}>General</Typography>
        </>
    );
}
