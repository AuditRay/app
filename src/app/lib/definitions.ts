import { z } from 'zod'
import {IWebsite} from "@/app/models/Website";
import {IFiltersView} from "@/app/models/FiltersView";

export const CreateWebsiteSchema = z.object({
    url: z.string().url({ message: 'Please enter a valid url.'}).trim(),
    tags: z.preprocess((input) => {
        const {data} = z.string().safeParse(input);
        if (data) {
            try {
                const processed: string[] = JSON.parse(data);
                return processed ? processed : input;
            }catch (e) {
                return input;
            }
        }
        return input;
    }, z.array(z.string().min(0, {message: 'Invalid tag'})).or(z.string().length(0))),
    fieldsTemplate: z.string().optional()
})

export type CreateWebsiteState = | {
    errors?: {
        url?: string[]
        tags?: string[]
    } | undefined
    message?: string
    data?: IWebsite
} | undefined

export type CreateFilterViewState = | {
    errors?: {
        title?: string[]
        filters?: string[]
    } | undefined
    message?: string
    data?: IFiltersView
} | undefined

export const LoginFormSchema = z.object({
    email: z.string().trim().min(1, { message: 'Email is required.' }),
    password: z.string().trim().min(1, { message: 'Password is required' }),
})

export const SignupFormSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: 'Firstname must be at least 2 characters long.' })
        .trim(),
    lastName: z
        .string()
        .min(2, { message: 'Lastname must be at least 2 characters long.' })
        .trim(),
    email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
    password: z
        .string()
        .min(8, { message: 'Be at least 8 characters long' })
        .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
        .regex(/[0-9]/, { message: 'Contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Contain at least one special character.',
        })
        .trim(),
})

export const JoinFormSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: 'Firstname must be at least 2 characters long.' })
        .trim(),
    lastName: z
        .string()
        .min(2, { message: 'Lastname must be at least 2 characters long.' })
        .trim(),
    email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
    inviteToken: z.string({ message: 'Invalid token' }).trim(),
    password: z
        .string()
        .min(8, { message: 'Be at least 8 characters long' })
        .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
        .regex(/[0-9]/, { message: 'Contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Contain at least one special character.',
        })
        .trim(),
})

export type JoinFormState =
    | {
    errors?: {
        firstName?: string[]
        lastName?: string[]
        email?: string[]
        inviteToken?: string[]
        password?: string[]
    }
    message?: string
} | undefined

export type LoginFormState = | {
    errors?: {
        email?: string[]
        password?: string[]
    } | undefined
    message?: string
} | undefined

export type FormState =
    | {
    errors?: {
        firstName?: string[]
        lastName?: string[]
        email?: string[]
        password?: string[]
    }
    message?: string
} | undefined