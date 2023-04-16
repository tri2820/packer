import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Dimensions, PixelRatio, View } from "react-native";
import { MemoNoComment } from "./components/NoComment";
import { supabaseClient } from "./supabaseClient";

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

export type Mode = 'normal' | 'comment';


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


export const requestComments = async (sharedAsyncState: any, post_id: string, parent_id: string | null) => {
    const key = `loadStatus/${parent_id ?? post_id}`;
    if (sharedAsyncState[key] == 'running') return;
    console.log('request comments', post_id, parent_id)
    sharedAsyncState[key] = 'running';
    const result = await _requestComments(sharedAsyncState, post_id, parent_id);
    if (parent_id == null) {
        sharedAsyncState[`loadedTimes/${post_id}`] = sharedAsyncState[`loadedTimes/${post_id}`] ? sharedAsyncState[`loadedTimes/${post_id}`] + 1 : 1;
    }

    setTimeout(() => {
        sharedAsyncState[key] = 'done';
    }, 1000)

    if (result == 'has no comment' || result == 'error') {
        sharedAsyncState[`commentsChangeListener/${post_id}`]?.(false)
    }
}


const _requestComments = async (sharedAsyncState: any, post_id: string, parent_id: string | null) => {
    const key = parent_id ?? post_id;
    const count = sharedAsyncState[`count/${key}`];
    if (count == 0) {
        return 'has no comment';
    }

    const offset = sharedAsyncState[`offset/${key}`] ?? 0;
    if (offset >= count) {
        // console.log(`had enough of ${post_id}.${parent_id}`, offset, count);
        return 'had enough';
    }

    sharedAsyncState[`offset/${key}`] = offset + 3;

    const { data, error } = await supabaseClient.rpc('get_comments_batch', { o: offset, n: 3, postid: post_id, parentid: parent_id, nchildren: 3 })
    if (error) {
        console.log('debug error query comments from post', error)
        return 'error';
    }

    const newIds = data.map((c: any) => c.id);
    data.forEach((c: any) => {
        if (newIds.includes(c.parent_id)) sharedAsyncState[`offset/${c.parent_id}`] = 3
        sharedAsyncState[`count/${c.id}`] = c.comment_count;
        sharedAsyncState[`num/${c.id}`] = 0;
        if (c.parent_id) sharedAsyncState[`num/${c.parent_id}`] += 1;
        // insertData(c);
    })

    addCommentsToPost(post_id, data)

    return 'success';
}

export const updateCommentsOfPost = (post_id: string, id: string, key: any, value: any) => {
    if (!sharedAsyncState[`comments/${post_id}`]) return;
    const comments = sharedAsyncState[`comments/${post_id}`]
    const index = comments.findIndex((c: any) => c.id == id);
    comments[index][key] = typeof value === 'function' ? value(comments[index][key]) : value;
    comments[index] = { ...comments[index] }
    sharedAsyncState[`commentsChangeListener/${post_id}`]?.(true)
}

export const addCommentsToPost = (post_id: string, data: any[], atHead = false) => {
    if (sharedAsyncState[`comments/${post_id}`]) {
        insert(data, sharedAsyncState[`comments/${post_id}`], atHead)
    } else {
        sharedAsyncState[`comments/${post_id}`] = insert(data, [], atHead);
    }
    sharedAsyncState[`commentsChangeListener/${post_id}`]?.(true)
}

const insert = (cs: any[], where: any[], atHead: boolean) => {
    const _insert = (c: any, comments: any[]) => {
        if (c.parent_id == null) {
            c.level = 0;
            if (atHead) {
                comments.unshift(c);
                return;
            }

            comments.push(c);
            return;
        }

        let i = comments.length - 1;
        while (i >= 0) {
            if (!atHead) {
                if (comments[i].parent_id == c.parent_id) {
                    c.level = comments[i].level;
                    comments.splice(i + 1, 0, c)
                    return;
                }
            }
            if (comments[i].id == c.parent_id) {
                c.level = comments[i].level + 1;
                comments.splice(i + 1, 0, c)
                return;
            }
            i -= 1;
        }
    }

    cs.forEach(c => _insert(c, where))
    return where
}

export const noComment = <MemoNoComment />

export function splitToListsWithHeadIs(arr: any[], predicate: (x: any) => boolean) {
    const result: any[] = [];
    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
            result.push([arr[i]]);
            continue;
        }
        result.at(-1)?.push(arr[i]);
    }
    return result;
}

export const toUIList = (comments: any[], hiddenCommentIds: any[]): any => {
    // console.log('debug comments', comments);
    if (comments.length == 0) return [];
    const parent = comments[0];
    const num = sharedAsyncState[`count/${parent.id}`] - sharedAsyncState[`num/${parent.id}`];

    const hidden = hiddenCommentIds[parent.id] == true;
    const tail = comments.slice(1);
    if (hidden) return [parent]

    const childrenUILists =
        splitToListsWithHeadIs(tail, (c) => c.level == parent.level + 1)
            .map(chunks => toUIList(chunks, hiddenCommentIds))

    const button = {
        type: 'load-comment-button',
        num: num,
        level: parent.level,
        ofId: parent.id,
        id: `button/${parent.id}`
    }
    return [parent, childrenUILists, num > 0 ? button : []]
}
