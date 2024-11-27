import {Box} from "@mui/material";
import dayjs from "dayjs";
import Link from "@/app/ui/Link";
import * as React from "react";

export default function Header () {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            flexBasis: '100%',
            alignItems: 'center',
            height: '50px',
            p: 2,
            borderTop: '1px solid #ccc',
            color: '#333',
            backgroundColor: '#f9f9f9'
        }}>
            <Box component={'img'}  src={`/logo.png`} alt={"monit"} sx={{width: '150px', verticalAlign: 'middle', mr: '10px'}} />
        </Box>
    )
}
