'use client'
import {useState} from 'react';
import * as React from "react";
import DeleteListModal from "@/app/ui/Lists/DeleteListModal";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Tooltip from "@mui/material/Tooltip";
import {IconButton} from "@mui/material";

export default function DeleteListComponent({listId, workspaceId}: {listId: string, workspaceId: string}) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <>
            <IconButton color={"error"} onClick={() => setIsOpen(true)}>
                <Tooltip title={'Remove list'}><DeleteForeverIcon></DeleteForeverIcon></Tooltip>
            </IconButton>
            {isOpen && <DeleteListModal open={isOpen} setOpen={setIsOpen} listId={listId} workspaceId={workspaceId} />}
        </>
    );
}