'use server'

import {
    SignupFormSchema,
    FormState,
    LoginFormSchema,
    LoginFormState,
    JoinFormState,
    JoinFormSchema
} from '@/app/lib/definitions'
import { connectMongo } from '@/app/lib/database'
import {IUser, User} from '../models'
import bcrypt from 'bcrypt';
import { createSession } from "@/app/lib/session";
import { redirect } from "next/navigation";

export async function getUserByInviteToken(inviteToken: string): Promise<IUser | null> {
    await connectMongo();
    console.log('getUserByInviteToken');
    const user = await User.findOne({ inviteToken });
    return user?.toJSON() || null;
}

export async function login(state: LoginFormState, formData: FormData) {
    await connectMongo();
    console.log('login');
    const validatedFields = LoginFormSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { email, password } = validatedFields.data

    const user = await User.findOne({ email });
    if (!user) {
        return {
            message: 'Wrong email or password',
        }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
        return {
            message: 'Wrong email or password',
        }
    }

    await createSession(user.id)
    redirect('/');
}

export async function signup(state: FormState, formData: FormData) {
    await connectMongo();
    console.log('signup');
    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
    })

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    await connectMongo();
    const { firstName, lastName, email, password } = validatedFields.data
    // e.g. Hash the user's password before storing it
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    let savedUser;
    try {
        savedUser = await user.save();
    } catch (error) {
        if ((error as any).code === 11000) {
            return {
                errors: {
                    email: ['Email already exists'],
                },
            }
        }
        return {
            message: 'An error occurred',
        }
    }
    await createSession(savedUser.id)
    console.log('User created:', savedUser);
    redirect('/');
    // Call the provider or db to create a user...
}

export async function join(state: JoinFormState, formData: FormData) {
    await connectMongo();
    console.log('join');
    // Validate form fields
    const validatedFields = JoinFormSchema.safeParse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        inviteToken: formData.get('inviteToken'),
    })

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    await connectMongo();
    const { firstName, lastName, email, password, inviteToken } = validatedFields.data
    const currentUser =  await User.findOne({ inviteToken });
    if (!currentUser) {
        return {
            message: 'Invalid Invite token',
        }
    }
    // e.g. Hash the user's password before storing it
    const hashedPassword = await bcrypt.hash(password, 10)
    currentUser.set({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        inviteToken: undefined
    })
    let savedUser;
    try {
        savedUser = await currentUser.save();
    } catch (error) {
        if ((error as any).code === 11000) {
            return {
                errors: {
                    email: ['Email already exists'],
                },
            }
        }
        return {
            message: 'An error occurred',
        }
    }
    await createSession(savedUser.id)
    console.log('User updated:', savedUser);
    redirect('/');
    // Call the provider or db to create a user...
}