import { Dimensions, PixelRatio, View } from "react-native";

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
