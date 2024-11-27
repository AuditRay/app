'use client'

import {Box, Card} from '@mui/material';
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Header from "@/app/ui/Layout/Header";
import Footer from "@/app/ui/Layout/Footer";
import Link from "@/app/ui/Link";


export function InvalidInviteToken() {
    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            bgcolor: 'gray',
            flexDirection: 'column',
            justifyContent: 'center',
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                color: 'white'
            }}>
                <Header></Header>
            </Box>
            <Card
                variant="outlined"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 'fit-content',
                    minWidth: '30%',
                    margin: 'auto',
                    p: 4
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Invalid invitation
                </Typography>
                <Box sx={{
                    alignItems: 'center',
                    mt: 2
                }}>
                    <Link href={"/login"} variant="body2">
                        Already have an account? Log in
                    </Link>
                </Box>
            </Card>
            <Box sx={{
                mt: 3,
                display: 'flex',
                justifyContent: 'center',
                color: 'white'
            }}>
                <Footer></Footer>
            </Box>
        </Box>
    )
}