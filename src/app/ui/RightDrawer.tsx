'use client'


import React from "react";
import {Box, Drawer} from "@mui/material";
import useRightDrawerStore from "@/app/lib/uiStore";
import Typography from "@mui/material/Typography";
import ArrowBack  from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";

type props = {
    children?: React.ReactNode
    isOpen?: boolean
}
export default function RightDrawer (props: props) {
    const isRightDrawerOpen = useRightDrawerStore((state) => state.rightDrawerIsOpen);
    const rightDrawerTitle = useRightDrawerStore((state) => state.rightDrawerTitle);
    const rightDrawerContent = useRightDrawerStore((state) => state.rightDrawerContent);
    const clearRightDrawer = useRightDrawerStore((state) => state.clearRightDrawer);
    return (
        <Drawer
            anchor={'right'}
            open={props.isOpen || isRightDrawerOpen}
            onClose={clearRightDrawer}
        >
            <Box sx={{display: 'flex', alignItems: 'end', mb:2, marginTop: 10}}>
                <Button onClick={clearRightDrawer}><ArrowBack></ArrowBack></Button>
            </Box>
            <Box sx={{width: "50vw", padding: 5}}>

                <Typography variant="h1" sx={{mb:2}}>{rightDrawerTitle}</Typography>
                {rightDrawerContent || props.children}
            </Box>
        </Drawer>
    )
}
