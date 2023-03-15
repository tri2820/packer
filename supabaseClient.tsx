import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, User } from '@supabase/supabase-js'

const MOMO_GET_PAYMENT_LINK = 'momo-get-payment-link-0000'
const REQUEST_ACCOUNT_DELETION = 'request-account-deletion'
const QUERY_BOOKINGS_BY_CLIENT = 'query-bookings-by-client'
const SEND_NOTI = 'send-noti'

export const INIT_DATE = new Date().toISOString();
export const supabaseClientUrl = 'https://djhuyrpeqcbvqbhfnibz.supabase.co'
const supabaseClientAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaHV5cnBlcWNidnFiaGZuaWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc4NDQ3NDMsImV4cCI6MTk5MzQyMDc0M30.QwCBvmNlWHeg4vhdTOqYImvZcl4EMuIv7zhQWLge154'


export const supabaseClient = createClient(supabaseClientUrl, supabaseClientAnonKey, {
    auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

export type C = () => Promise<State>
export const unitC: C = async () => ({ c: unitC });
export type State = {
    c: C,
    data?: any
};
export const q = async (parent_id: string, count: number, page: number): Promise<State> => {
    const { data, error } = await supabaseClient
        .from('comments')
        .select()
        .lt('created_at', INIT_DATE)
        .eq('parent_id', parent_id)
        .range(page, page + 3);
    const c = () => q(parent_id, count, page + 4);
    return error ? { c: unitC } : { c, data };
}
export const requestCommentsCount = async (parent_id: string): Promise<State> => {
    const { count, error } = await supabaseClient
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', parent_id)
        .lt('created_at', INIT_DATE)
    const c = () => q(parent_id, count ?? 0, 0);
    return error ? { c: unitC } : { c, data: count };
}

export const upsertProfile = async (user: User) => {
    console.log('debug upsertProfile called', user)
    const updates = {
        id: user?.id,
        email: user?.email,
        avatar_url: user?.user_metadata?.avatar_url,
        full_name: user?.user_metadata?.full_name || user?.email,
        updated_at: new Date(),
    };
    console.log('sending updates', updates)
    let { error } = await supabaseClient.from('profiles').upsert(updates);
    if (error) {
        console.log('upsertProfile error', error)
        return false;
    }
    console.log('upsertProfile success')
    return true
}


// Upsert because there may be the case where the user did not call log out
// But still be logged out (client cache refreshed?), and can call log in again
export const upsertPushToken = async (details: { [id: string]: any }) => {
    console.log('debug upsertPushToken called', details)
    let result = await supabaseClient.from('user_notification').upsert(details)
    const { error } = result
    if (error) {
        console.log('upsertPushToken error, result', result)
        return false;
    }
    console.log('upsertPushToken success', result)
    return true
}

export const updateDetails = async (details: { [id: string]: any }) => {
    console.log('debug updateDetails called', details)
    let { error } = await supabaseClient.from('profiles').update(details);
    if (error) {
        console.log('updateDetails error', error)
        return false;
    }
    console.log('updateDetails success')
    return true;
}

export const insertBooking = async (bookingDetails: { [id: string]: any }) => {
    console.log('debug insertBooking called', bookingDetails)
    let { data } = await supabaseClient.from('bookings').insert(bookingDetails).select().single();
    console.log('insertBooking data', data)
    return data;
}

export const queryBookingList = async () => {
    console.log('debug queryBookingList called')
    const { data, error } = await supabaseClient.functions.invoke(QUERY_BOOKINGS_BY_CLIENT)
    if (error) {
        console.log('there is an error while querying bookings', error)
        return null;
    }
    console.log(`bookings: ${data.length} items, example:`, data[0]);
    return data;
}

export const getPaymentLink = async (id: string) => {
    console.log('get MoMo payUrl', id)
    const body = {
        id: id
    }
    const { data, error } = await supabaseClient.functions.invoke(MOMO_GET_PAYMENT_LINK, { body: body })
    if (error) {
        console.log('there is an error while getting payment link', error)
        return null
    }

    console.log('debug getPaymentLink result', data);
    return data;
}

export const requestAccountDeletion = async () => {
    console.log('requestAccountDeletion')
    const { data, error } = await supabaseClient.functions.invoke(REQUEST_ACCOUNT_DELETION)
    if (error) {
        console.log('there is an error while requestAccountDeletion', error)
        return false
    }

    console.log('debug requestAccountDeletion result', data);
    return true;
}

export const checkAccountDeletion = async () => {
    console.log('requestAccountDeletion')
    const { data, error } = await supabaseClient.from('deleted_clients').select().maybeSingle()
    if (error) {
        console.log('there is an error while requestAccountDeletion', error)
        return undefined
    }

    console.log('debug requestAccountDeletion result', data);
    return data;
}



export const getDictionary = async () => {
    const response = await fetch("https://mltjentmrnnlwglqylsc.supabase.co/storage/v1/object/public/public/dictionary.json", {
        headers: {
            "content-type": "application/json",
        }
    })
    if (!response.ok) {
        console.log('debug there is an error getting dictionary')
        return undefined
    }
    const json = await response.json()
    console.log('dictionary', Object.keys(json))
    return json
}



export const getProducts = async () => {
    console.log('getProducts')
    const { data, error } = await supabaseClient.from('products').select()
    if (error) {
        console.log('there is an error while getProducts', error)
        return undefined
    }

    console.log('debug getProducts result', data);
    return data;
}


export const sendNoti = async (id: any) => {
    console.log('sendNoti')
    const { data, error } = await supabaseClient.functions.invoke(SEND_NOTI, {
        body: {
            id: id
        }
    })
    if (error) {
        console.log('there is an error while sendNoti', error)
        return false
    }

    console.log('debug sendNoti result', data);
    return true;
}
