'use client'

import MaterialLink from "@mui/material/Link";
import NextLink from "next/link";
import React from "react";
import {Box, Drawer} from "@mui/material";
import useRightDrawerStore from "@/app/lib/uiStore";
import Typography from "@mui/material/Typography";

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
            <Box sx={{width: "50vw", marginTop: 10, padding: 5}}>
                <Typography variant="h1" sx={{mb: 2}}>
                    {rightDrawerTitle}
                </Typography>
                {rightDrawerContent || props.children}
            </Box>
        </Drawer>
    )
}
