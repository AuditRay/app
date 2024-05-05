'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { signup } from '@/app/actions/auth'
import {useEffect, useState} from "react";
import {Alert, Box, TextField} from '@mui/material';
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
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

export function SignupForm() {
    const [state, action] = useFormState(signup, undefined)
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
                Sign up
            </Typography>
            <Box sx={{mt: 3}}>
                <form action={action}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                error={!!state?.errors?.firstName}
                                helperText={state?.errors?.firstName}
                                autoComplete="given-name"
                                name="firstName"
                                fullWidth
                                id="firstName"
                                label="First Name"
                                autoFocus
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                error={!!state?.errors?.lastName}
                                helperText={state?.errors?.lastName}
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                autoComplete="family-name"
                            />
                        </Grid>
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
                                helperText={state?.errors?.password?.map((error, idx) => (
                                    <Box key={`pass-err-${idx}`}>- {error}</Box>
                                ))}
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
                        Sign Up
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href={"/login"} variant="body2">
                                Already have an account? Log in
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Box>
    )
}