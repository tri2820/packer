import { Dimensions, PixelRatio } from "react-native";
// @ts-ignore
// import { polyfill } from 'react-native-polyfill-globals';



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

// export const hostnameEq = (hostname: string, x: string) => {
//     if (hostname.startsWith('www.')) hostname = hostname.slice(4);
//     if (x.startsWith('www.')) x = x.slice(4);
//     console.log('debug hostname x', hostname, x)
//     return (hostname == x;
// }

export type Mode = Normal | Comment | App;

// polyfill();
// const utf8Decoder = new TextDecoder('utf-8')

// const decodeResponse = (response?: Uint8Array) => {
//     if (!response) {
//         return ''
//     }

//     const pattern = /"delta":\s*({.*?"content":\s*".*?"})/g
//     const decodedText = utf8Decoder.decode(response)
//     const matches: string[] = []

//     let match
//     while ((match = pattern.exec(decodedText)) !== null) {
//         matches.push(JSON.parse(match[1]).content)
//     }
//     return matches.join('')
// }

// export async function read(reader: ReadableStreamDefaultReader<Uint8Array>, partialUpdate: (update: string) => Promise<void>) {
//     const { value, done } = await reader.read()
//     if (done) return
//     const delta = decodeResponse(value)
//     partialUpdate(delta);
//     await read(reader, partialUpdate)
// }

// export const readStreamToDatabase = async (stream: ReadableStream<Uint8Array>) => {
//   const reader = stream.getReader()
//   const answer = await read(reader);
//   return answer
// }