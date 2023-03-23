import { Dimensions, PixelRatio, View } from "react-native";
// @ts-ignore
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
// @ts-ignore
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
// @ts-ignore
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';
import { supabaseClient } from "./supabaseClient";

export const constants = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    pixelratio: PixelRatio.get()
}

interface Normal {
    readonly tag: 'Normal';
}
interface Comment {
    readonly tag: 'Comment';
}
interface App {
    readonly tag: 'App';
    readonly value: string;
    readonly insetsColor: string;
}

export const randomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    return `#${randomColor}`;
};

export const normalizedHostname = (hostname: string) => hostname.startsWith('www.') ? hostname.slice(4) : hostname;

export type Mode = Normal | Comment | App;


export const loadingView = () => <View style={{
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
}} />

// export const submitComment = async (
//     text: string,
//     parent_id: string,
//     post_id: string,
//     // pushToCommentQueue()
//     // onPlaceholderCommentReady: (placeholderComment: any) => void,
//     // onCommentResponded: (comment: any) => void,
//     // onCreateChildComment: (comment: any) => void,
//     // onCommentUpdate: (delta: string) => void,
//     // onDone: () => void,
// ) => {
//     const body = {
//         content: text,
//         post_id: post_id,
//         parent_id: parent_id,
//         need_bot_comment: true
//     }

//     polyfillEncoding()
//     polyfillReadableStream()
//     polyfillFetch()

//     const { data } = await supabaseClient.auth.getSession();
//     const accessToken = data.session?.access_token;
//     if (!accessToken) {
//         console.log('Access Token is', accessToken)
//         return
//     }

//     const placeholderComment = {
//         // Could get from header
//         id: 'placeholder_comment_id',
//         created_at: new Date(),
//         content: text,
//         // author_name: user.user_metadata.full_name,
//         author_name: 'Default User',
//         parent_id: parent_id,
//         post_id: post_id,
//         // child: {
//         //     content: '',
//         //     finished: false
//         // }
//     }

//     onPlaceholderCommentReady(placeholderComment)
//     // setRecentComment(responseData);

//     const response = await fetch('https://djhuyrpeqcbvqbhfnibz.functions.supabase.co/comment', {
//         // @ts-ignore
//         reactNative: { textStreaming: true },
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             // 'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(body)
//     })

//     const comment = { ...placeholderComment, id: response.headers.get("comment_id") }
//     onCommentResponded(comment)

//     if (!response.body || !response.ok) {
//         console.log('ERROR: response', response)
//         return
//     }

//     const utf8Decoder = new TextDecoder('utf-8')

//     const decodeResponse = (response?: Uint8Array) => {
//         if (!response) {
//             return ''
//         }

//         const pattern = /"delta":\s*({.*?"content":\s*".*?"})/g
//         const decodedText = utf8Decoder.decode(response)
//         const matches: string[] = []

//         let match
//         while ((match = pattern.exec(decodedText)) !== null) {
//             matches.push(JSON.parse(match[1]).content)
//         }
//         return matches.join('')
//     }

//     async function read(reader: ReadableStreamDefaultReader<Uint8Array>, partialUpdate: (update: string) => Promise<void>) {
//         const { value, done } = await reader.read()
//         if (done) return
//         const delta = decodeResponse(value)
//         partialUpdate(delta);
//         await read(reader, partialUpdate)
//     }

//     const reader = response.body.getReader()
//     await read(reader, async (update) => {});

//     // setRecentComment((recentComment: any) => {
//     //   const r = { ...recentComment }
//     //   r.child.finished = true;
//     //   console.log('debug DONE r', r)
//     //   return r
//     // })
// }