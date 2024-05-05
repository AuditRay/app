'use client'

import {useState} from "react";
import Markdown from "react-markdown";
import * as React from "react";
import Typography from "@mui/material/Typography";
import InfoIcon from '@mui/icons-material/Info';
import {Box} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
export default function CollapseMD(props: { md: string,  title: string, open?: boolean }) {
    const [isOpen, setIsOpen] = useState(props.open ?? false);
    return (
        <Box sx={{mb: 2}}>
            <Typography variant={'h6'} onClick={() => setIsOpen(!isOpen)} sx={{
                ":hover": {
                    cursor: 'pointer'
                }
            }}>
                {props.title}
                <InfoIcon sx={{ml: 1, verticalAlign: 'middle'}}/>
            </Typography>


            <div>
                <Dialog
                    open={isOpen}
                    onClose={() => {
                        setIsOpen(false)
                    }}
                >
                    <DialogTitle>
                        {props.title}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <Markdown>{props.md}</Markdown>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsOpen(!isOpen)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Box>
    );
}