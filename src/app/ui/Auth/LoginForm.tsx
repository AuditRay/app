'use client'
import { useFormStatus, useFormState } from 'react-dom'
import { login } from '@/app/actions/auth'
import {useEffect, useState, useActionState} from "react";
import {Alert, Box, Card, IconButton, TextField} from '@mui/material';
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Link from "@/app/ui/Link";
import Container from "@mui/material/Container";
import Footer from "@/app/ui/Layout/Footer";
import Header from "@/app/ui/Layout/Header";
import {FormHead} from "@/app/ui/Auth/components/form-head";
import {useBoolean} from "minimal-shared/hooks";
import InputAdornment from "@mui/material/InputAdornment";
import {Iconify} from "@/components/iconify";
import LoadingButton from '@mui/lab/LoadingButton';

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
    const [isLoading, setIsLoading] = useState(false)
    const showPassword = useBoolean();
    useEffect(() => {
        setIsReady(true)
    }, []);

    const renderForm = () => (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <TextField
                error={!!state?.errors?.email}
                helperText={state?.errors?.email}
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
            />
            <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
                <Link
                    href="#"
                    variant="body2"
                    color="inherit"
                    sx={{ alignSelf: 'flex-end' }}
                >
                    Forgot password?
                </Link>
                <TextField
                    error={!!state?.errors?.password}
                    helperText={state?.errors?.password}
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword.value ? 'text' : 'password'}
                    slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={showPassword.onToggle} edge="end">
                                        <Iconify
                                            icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                        />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    id="password"
                    autoComplete="new-password"
                />
            </Box>
            <LoadingButton
                fullWidth
                color="inherit"
                size="large"
                type="submit"
                variant="contained"
                loading={isLoading}
                loadingIndicator="Sign in..."
            >
                Sign in
            </LoadingButton>
        </Box>
    );

    return isReady &&  (
        <>
            <FormHead
                title="Sign in to your account"
                description={
                    <>
                        {`Don’t have an account? `}
                        <Link href={'/signup'} variant="subtitle2">
                            Get started
                        </Link>
                    </>
                }
                sx={{ textAlign: { xs: 'center', md: 'left' } }}
            />
            {!!state?.message && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {state?.message}
                </Alert>
            )}
            <form action={action}>
                {renderForm()}
            </form>
        </>
    )
}