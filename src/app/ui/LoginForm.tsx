'use client'
import { useFormStatus, useFormState } from 'react-dom'
import { login } from '@/app/actions/auth'
import {useEffect, useState, useActionState} from "react";
import {Alert, Box, Card, TextField} from '@mui/material';
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Link from "@/app/ui/Link";
import Container from "@mui/material/Container";
import Footer from "@/app/ui/Layout/Footer";
import Header from "@/app/ui/Layout/Header";

export function SignupButton() {
    const { pending } = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit">
            {pending ? 'Submitting...' : 'Sign up'}
        </button>
    )
}

export function LoginForm() {
    const [state, action] = useActionState(login, undefined)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        setIsReady(true)
    }, []);

    return isReady &&  (
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
                    margin: 'auto',
                    p: 4
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Log in
                </Typography>
                <Box sx={{mt: 3}}>
                    <form action={action}>
                        {state?.message && (
                            <Box sx={{mb: 3}}>
                                <Alert severity={'error'}>
                                    {state?.message}
                                </Alert>
                            </Box>
                        )}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    error={!!state?.errors?.email}
                                    helperText={state?.errors?.email}
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    error={!!state?.errors?.password}
                                    helperText={state?.errors?.password}
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Log In
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href={'/signup'} variant="body2">
                                    Don&apos;t have an account yet? Sign up
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
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