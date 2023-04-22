import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { makeRedirectUri, startAsync } from 'expo-auth-session';
import { supabaseClient, supabaseClientUrl } from './supabaseClient';
import * as WebBrowser from 'expo-web-browser';
import url from 'url';
import { parseUrlParams } from './utils';

export const signIn = async (provider: 'google' | 'apple') => {
    const returnUrl = makeRedirectUri({
        useProxy: false,
        path: '/auth/callback',
    });

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: returnUrl
        }
    })

    if (!data || error) {
        console.log('error auth', error, data);
        return;
    }

    // console.log('data', data)
    const authSessionResult = await WebBrowser.openAuthSessionAsync(data.url);

    if (authSessionResult.type !== 'success') {
        console.log('debug authSessionResult.type is NOT a success', authSessionResult)
        return null;
    }

    console.log('> authSessionResult', authSessionResult)
    const params = parseUrlParams(authSessionResult.url);
    if (!params || !params.access_token || !params.refresh_token) {
        console.log('debug cannot parse', params, authSessionResult.url)
        return;
    }

    const { data: sessionData, error: sessionError } = await supabaseClient.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
    })

    if (sessionError) {
        console.log('setSession error', sessionError);
        return null;
    }

    console.log('sessionData', sessionData)
    return sessionData.user;
};

export const signOut = async () => {
    console.log('Sign out of supabase!')
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.log('Error during sign out', error);
        return false;
    }
    return true
}
