import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { makeRedirectUri, startAsync } from 'expo-auth-session';
import { supabaseClient, supabaseClientUrl } from './supabaseClient';

export const signIn = async (provider: 'google' | 'apple') => {
    const returnUrl = makeRedirectUri({
        useProxy: false,
        path: '/auth/callback',
    });
    const authUrl = `${supabaseClientUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${returnUrl}`;

    const authSessionResult = await startAsync({
        returnUrl,
        authUrl,
        projectNameForProxy: '@tri2820/packer'
    });

    if (authSessionResult.type !== 'success') {
        console.log('debug authSessionResult.type is NOT a success', authSessionResult)
        return null;
    }

    const { data, error } = await supabaseClient.auth.setSession({
        access_token: authSessionResult.params.access_token,
        refresh_token: authSessionResult.params.refresh_token,
    })

    if (error) {
        console.log('setSession error', error);
        return null;
    }

    return data.user;
};

export const signOut = async (userId: string, pushToken: string) => {
    console.log('Sign out of supabase!')
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.log('Error during sign out', error);
}