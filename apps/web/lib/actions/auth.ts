'use server'

import { redirect } from 'next/navigation'
import { BACKEND_URL } from '../constants'
import { FormState, LoginFormSchema, SignupFormSchema } from '../types'
import { createSession } from './session'

export async function signUp(
    state: FormState,
    formData: FormData,
): Promise<FormState> {
    const validationFields = SignupFormSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validationFields.success) {
        return {
            error: validationFields.error.flatten().fieldErrors,
        }
    }

    const response = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationFields.data),
    })

    if (response.ok) {
        return redirect('/auth/signin')
    } else {
        return {
            message:
                response.status === 409
                    ? 'User already exists'
                    : response.statusText,
        }
    }
}

export async function signIn(
    state: FormState,
    formData: FormData,
): Promise<FormState> {
    const validationFields = LoginFormSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validationFields.success) {
        return {
            error: validationFields.error.flatten().fieldErrors,
        }
    }

    const response = await fetch(`${BACKEND_URL}/auth/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationFields.data),
    })

    if (response.ok) {
        const result = await response.json()

        // TODO: Create the session of authenticated user
        await createSession({
            user: {
                id: result.id,
                name: result.name,
            },
        })
        redirect('/')
    } else {
        return {
            message:
                response.status === 401
                    ? 'Invalid Credentials'
                    : response.statusText,
        }
    }
}
