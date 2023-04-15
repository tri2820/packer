import { Dimensions, PixelRatio, Platform, View } from "react-native";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage'

export const constants = {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    pixelratio: PixelRatio.get(),
    navigationBarHeight: Dimensions.get('screen').height - Dimensions.get('window').height - Constants.statusBarHeight,
    statusBarHeight: Constants.statusBarHeight
}

export function scaledown(size: number) {
    const newSize = size / PixelRatio.getFontScale();
    return newSize
}

export function scaleup(size: number) {
    const newSize = size * PixelRatio.getFontScale();
    return newSize
}


interface Normal {
    readonly tag: 'Normal';
}
interface Comment {
    readonly tag: 'Comment';
}
// interface App {
//     readonly tag: 'App';
//     readonly value: string;
//     // readonly insetsColor: string;
// }

export const calcStatusBarColor = (backgroundColor: any) => {
    let [r, g, b, a] = backgroundColor.slice(backgroundColor.startsWith('rgba') ? 5 : 4, -1).split(',').map((s: any) => parseInt(s))

    if (r == 0 && g == 0 && b == 0) {
        return 'light'
    }
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    if (luma < 40) {
        return 'light'
    }

    return 'dark'
}

export const randomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    return `#${randomColor}`;
};

export const normalizedHostname = (hostname: string) => hostname.startsWith('www.') ? hostname.slice(4) : hostname;

export type Mode = Normal | Comment;


export const loadingView = () => <View style={{
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
}} />

export const sharedAsyncState: any = {};
// export const toUIComments = (comments: any[], index = 0) => {
//     if (index == comments.length) return 
//     return [comments[index], toUIComments(comments, index + 1), { type: 'button' }]
// }

const storeData = async (key: string, value: any) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
        console.log('error storeData1', e)
    }
}

const getData = async (key: string) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.log('error getData', e)
    }
}
