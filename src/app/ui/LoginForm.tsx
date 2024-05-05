'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { login } from '@/app/actions/auth'
import {useEffect, useState} from "react";
import {Alert, Box, TextField} from '@mui/material';
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import {Link} from "@/app/ui/Link";

export function SignupButton() {
    const { pending } = useFormStatus()

    return (
        <button aria-disabled={pending} type="submit">
            {pending ? 'Submitting...' : 'Sign up'}
        </button>
    )
}

export function LoginForm() {
    const [state, action] = useFormState(login, undefined)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        setIsReady(true)
    }, []);

    return isReady &&  (
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
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
                                Don't have an account yet? Sign up
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Box>
    )
}