import { Dimensions, PixelRatio } from "react-native";

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

export const normalizedHostname = (hostname: string) => hostname.startsWith('www.') ? hostname.slice(4) : hostname;

// export const hostnameEq = (hostname: string, x: string) => {
//     if (hostname.startsWith('www.')) hostname = hostname.slice(4);
//     if (x.startsWith('www.')) x = x.slice(4);
//     console.log('debug hostname x', hostname, x)
//     return (hostname == x;
// }

export type Mode = Normal | Comment | App;