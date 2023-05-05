import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Dimensions, PixelRatio, View } from "react-native";
import { MemoNoComment } from "./components/NoComment";
import { supabaseClient } from "./supabaseClient";
import * as Haptics from 'expo-haptics';

import url from 'url';
export const constants = {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    pixelratio: PixelRatio.get(),
    navigationBarHeight: Dimensions.get('screen').height - Dimensions.get('window').height - Constants.statusBarHeight,
    statusBarHeight: Constants.statusBarHeight,
}

export function scaledown(size: number) {
    const newSize = Math.round(size / PixelRatio.getFontScale());
    return newSize
}

export function scaleup(size: number) {
    const newSize = Math.round(size * PixelRatio.getFontScale());
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
    backgroundColor: '#212121',
    height: '100%',
    width: '100%',
}} />

export const sharedAsyncState: any = {
    bookmarks: {}
};
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
    const num_request = offset == 0 ? 5 : (parent_id ? 2 : 3);
    const num_children_request = parent_id ? 0 : 2;
    if (offset >= count) {
        // console.log(`had enough of ${post_id}.${parent_id}`, offset, count);
        return 'had enough';
    }

    sharedAsyncState[`offset/${key}`] = offset + num_request;

    const { data, error } = await supabaseClient.rpc('get_comments_batch', { o: offset, n: num_request, postid: post_id, parentid: parent_id, nchildren: num_children_request })
    if (error) {
        console.log('debug error query comments from post', error)
        return 'error';
    }

    const newIds = data.map((c: any) => c.id);
    data.forEach((c: any) => {
        if (newIds.includes(c.parent_id)) sharedAsyncState[`offset/${c.parent_id}`] = num_children_request
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

export const toUIList = (comments: any[], hiddenCommentIds: any[]): any => {
    const button_stack: any[] = [];
    let hiding_for_level = -1;
    let to_add_flag = true;
    let result: any[] = [];
    for (let i = 0; i < comments.length; i++) {
        while (comments[i].level <= button_stack.at(-1)?.level) {
            const button = button_stack.pop();
            // console.log('@', button, hiding_for_level)
            if (button && button.level != hiding_for_level) result.push(button);
        }

        if (comments[i].level <= hiding_for_level) {
            hiding_for_level = -1;
            to_add_flag = true;
        }

        if (to_add_flag) {
            result.push(comments[i]);
            const num_children = sharedAsyncState[`count/${comments[i].id}`] - sharedAsyncState[`num/${comments[i].id}`];
            if (num_children > 0) {
                button_stack.push({
                    type: 'load-comment-button',
                    num: num_children,
                    level: comments[i].level,
                    ofId: comments[i].id,
                    id: `button/${comments[i].id}`
                })
            }
        }

        if (hiddenCommentIds[comments[i].id]) {
            hiding_for_level = comments[i].level;
            to_add_flag = false;
        }
    }

    return result;
}



const adjectives = [
    "Amazing",
    "Astounding",
    "Awesome",
    "Blissful",
    "Brilliant",
    "Captivating",
    "Cheerful",
    "Confident",
    "Creative",
    "Dazzling",
    "Delightful",
    "Elegant",
    "Enchanting",
    "Energetic",
    "Engaging",
    "Enthusiastic",
    "Exciting",
    "Exquisite",
    "Fabulous",
    "Fantastic",
    "Fascinating",
    "Friendly",
    "Fun",
    "Glamorous",
    "Gleaming",
    "Glistening",
    "Glorious",
    "Gorgeous",
    "Graceful",
    "Happy",
    "Harmonious",
    "Heartwarming",
    "Heavenly",
    "Ideal",
    "Incredible",
    "Inspiring",
    "Intelligent",
    "Jubilant",
    "Joyful",
    "Kind",
    "Lively",
    "Lovely",
    "Luminous",
    "Magnificent",
    "Marvelous",
    "Mesmerizing",
    "Miraculous",
    "Outstanding",
    "Passionate",
    "Peaceful",
    "Perfect",
    "Pleasant",
    "Positive",
    "Powerful",
    "Radiant",
    "Remarkable",
    "Resplendent",
    "Sensational",
    "Serene",
    "Shimmering",
    "Shining",
    "Smiling",
    "Spectacular",
    "Splendid",
    "Stunning",
    "Sublime",
    "Superb",
    "Supreme",
    "Terrific",
    "Thrilling",
    "Tranquil",
    "Transformative",
    "Unforgettable",
    "Unique",
    "Uplifting",
    "Vibrant",
    "Wonderful",
    "Wondrous",
    "Zestful",
    "Affectionate",
    "Agreeable",
    "Amiable",
    "Amused",
    "Appreciated",
    "Appreciative",
    "Attractive",
    "Beautiful",
    "Beloved",
    "Benevolent",
    "Blithe",
    "Bountiful",
    "Bright",
    "Calm",
    "Caring",
    "Charming",
    "Cheery",
    "Compassionate",
    "Considerate",
    "Content",
    "Courageous",
    "Courteous",
    "Creative",
    "Daring",
    "Dedicated",
    "Delicious",
    "Desirable",
    "Devoted",
    "Diligent",
    "Dynamic",
    "Easygoing",
    "Effervescent",
    "Efficient",
    "Elegant",
    "Empathetic",
    "Endearing",
    "Energetic",
    "Engaging",
    "Enlightened",
    "Enthusiastic",
    "Exhilarated",
    "Expressive",
    "Exuberant",
    "Faithful",
    "Favorable",
    "Festive",
    "Flourishing",
    "Fortunate",
    "Friendly",
    "Fulfilled",
    "Generous",
    "Gentle",
    "Genuine",
    "Glowing",
    "Good",
    "Gracious",
    "Grateful",
    "Hale",
    "Happy",
    "Harmonious",
    "Heartfelt",
    "Helpful",
    "Inspired",
    "Intellectual",
    "Intense",
    "Intuitive",
    "Inventive",
    "Invigorated",
    "Inviting",
    "Jovial",
    "Joyous",
    "Jubilant",
    "Keen",
    "Kind-hearted",
    "Laudable",
    "Lavish",
    "Lighthearted",
    "Lively",
    "Loving",
    "Loyal",
    "Lucid",
    "Luminous",
    "Magical",
    "Majestic",
    "Marvelous",
    "Masterful",
    "Merry",
    "Mesmerizing",
    "Meticulous",
    "Mild",
    "Mind-blowing",
    "Miraculous",
    "Motivated",
    "Noble",
    "Nurturing",
    "Open-minded",
    "Optimistic",
    "Original",
    "Passionate",
    "Patient",
    "Peaceful",
    "Perfect",
    "Persevering",
    "Persistent",
    "Pioneering",
    "Playful",
    "Plentiful",
    "Positive",
    "Powerful",
    "Practical",
    "Precious",
    "Productive",
    "Prosperous",
    "Proud",
    "Pure",
    "Purposeful",
    "Radiant",
    "Rapturous",
    "Reassuring",
    "Refreshing",
    "Rejuvenated",
    "Relaxed",
    "Reliable",
    "Remarkable",
    "Resilient",
    "Respectful",
    "Responsive",
    "Rewarding",
    "Robust",
    "Romantic",
    "Satisfying",
    "Savvy",
    "Sensational",
    "Sensuous",
    "Serene",
    "Sincere",
    "Skilled",
    "Sociable",
    "Soulful",
    "Sparkling",
    "Spirited",
    "Splendid",
    "Spontaneous",
    "Stable",
    "Stellar",
    "Stimulating",
    "Strategic",
    "Strength-giving",
    "Strengthened",
    "Stress-free",
    "Strong",
    "Stupendous",
    "Successful",
    "Sufficient",
    "Sunny",
    "Superior",
    "Supportive",
    "Supreme",
    "Surprising",
    "Sustaining",
    "Sweet",
    "Sympathetic",
    "Teachable",
    "Tender",
    "Terrific",
    "Thankful",
    "Thrilled",
    "Tidy",
    "Timeless",
    "Titillating",
    "Tolerant",
    "Tremendous",
    "Trusting",
    "Ultimate",
    "Unbelievable",
    "Unconditional",
    "Unflappable",
    "Unique",
    "Unlimited",
    "Upbeat",
    "Valuable",
    "Vibrant",
    "Victorious",
    "Vigorous",
    "Virtuous",
    "Visionary",
    "Vital",
    "Warm-hearted",
    "Wealthy",
    "Wholesome",
    "Wise",
    "Wonderful",
    "Worshipful",
    "Zany",
    "Zealous"
]

const nouns = [
    "Achiever",
    "Advocate",
    "Alchemist",
    "Ambassador",
    "Angel",
    "Apostle",
    "Architect",
    "Artist",
    "Athlete",
    "Author",
    "Aviator",
    "Bard",
    "Beacon",
    "Benevolent",
    "Builder",
    "Captain",
    "Champion",
    "Charismatic",
    "Cherub",
    "Citizen",
    "Commander",
    "Companion",
    "Conqueror",
    "Consciousness",
    "Contribution",
    "Courageous",
    "Creator",
    "Curator",
    "Custodian",
    "Dancer",
    "Defender",
    "Delight",
    "Designer",
    "Detective",
    "Devotee",
    "Discoverer",
    "Dreamer",
    "Dynamo",
    "Eagle",
    "Emancipator",
    "Empath",
    "Enchanter",
    "Endeavourer",
    "Entrepreneur",
    "Essence",
    "Explorer",
    "Facilitator",
    "Fellowship",
    "Flame",
    "Follower",
    "Friend",
    "Gamechanger",
    "Genius",
    "Giver",
    "Gracious",
    "Guardian",
    "Guide",
    "Harmonious",
    "Healer",
    "Hero",
    "Hope",
    "Icon",
    "Ideator",
    "Illuminator",
    "Influencer",
    "Initiator",
    "Innovator",
    "Inspiration",
    "Instigator",
    "Intrepid",
    "Inventor",
    "Jester",
    "Joy",
    "Judge",
    "Keeper",
    "Key",
    "Kindness",
    "King",
    "Knight",
    "Liberator",
    "Lifeguard",
    "Light",
    "Lion",
    "Luminary",
    "Magician",
    "Majesty",
    "Manager",
    "Mastermind",
    "Maverick",
    "Mentor",
    "Messenger",
    "Miracle",
    "Missionary",
    "Navigator",
    "Noble",
    "Nurturer",
    "Observer",
    "Opportunist",
    "Oracle",
    "Originator",
    "Outsider",
    "Overcomer",
    "Paragon",
    "Pathfinder",
    "Patriot",
    "Pioneer",
    "Playmaker",
    "Poet",
    "Positive",
    "Practical",
    "Precious",
    "Prestigious",
    "Proactive",
    "Prodigy",
    "Provider",
    "Purveyor",
    "Queen",
    "Quester",
    "Quick",
    "Radiant",
    "Ranger",
    "Ravishing",
    "Rebel",
    "Rejoice",
    "Reliable",
    "Remarkable",
    "Resilient",
    "Resourceful",
    "Respectful",
    "Restorer",
    "Revolutionary",
    "Ringleader",
    "Riser",
    "Ruler",
    "Sage",
    "Saviour",
    "Scholar",
    "Seeker",
    "Sentinel",
    "Serenity",
    "Shaper",
    "Siren",
    "Sleuth",
    "Soulmate",
    "Sovereign",
    "Spark",
    "Spectacle",
    "Spice",
    "Spirit",
    "Sprinter",
    "Stalwart",
    "Star",
    "Storyteller",
    "Strategist",
    "Stylist",
    "Success",
    "Superhero",
    "Supernova",
    "Supporter",
    "Surgeon",
    "Swan",
    "Sweeper",
    "Symphony",
    "Tactician",
    "Teacher",
    "Therapist",
    "Thinker",
    "Thunderbolt",
    "Titan",
    "Trailblazer",
    "Transformer",
    "Traveler",
    "Treasure",
    "Trendsetter",
    "Trickster",
    "Triumphant",
    "Truth-seeker",
    "Unifier",
    "Uplifter",
    "Valiant",
    "Venturer",
    "Victor",
    "Virtuoso",
    "Visionary",
    "Vitality",
    "Voice",
    "Volunteer",
    "Voyager",
    "Warrior",
    "Wealth",
    "Whirlwind",
    "Wildcat",
    "Winner",
    "Wisdom",
    "Witness",
    "Wonder",
    "Worthy",
    "X-factor",
    "Xenophile",
    "Yin",
    "Yogi",
    "Youth",
    "Zealot",
    "Zephyr",
    "Zenith",
    "Zest",
    "Zigzag",
    "Zion",
    "Zippy",
    "Zodiac",
    "Zonal",
    "Zoom",
    "Zorro"
]

export const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const randomNickName = () => {
    const randomAdj = getRandomElement(adjectives)
    const randomNoun = getRandomElement(nouns)
    return `${randomAdj} ${randomNoun}`
}


export function parseUrlParams(inputUrl: string) {
    const parsedUrl = url.parse(inputUrl, true);
    if (!parsedUrl.hash) return null;
    const params = parsedUrl.hash.substring(1); // Remove the '#' character
    const paramObj: any = {};
    params.split('&').forEach(param => {
        const [key, value] = param.split('=');
        paramObj[key] = value;
    });
    return paramObj;
}

export const fixText = (text: string, author_name: string) => {
    // console.log('debug text', text, author_name)
    if (author_name != 'Packer') return text;
    if (!text.startsWith('Packer:')) return text;
    return text.startsWith('Packer: ') ? text.slice(8) : text.slice(7)
}

export const theEmptyFunction = () => { };
export const getSourceName = (source_url: string, lower?: boolean) => {
    const url = new URL(source_url);
    const normed = normalizedHostname(url.hostname)
    return lower ? normed.toLowerCase() : normed.toUpperCase();
}

export const toggleBookmark = async (post: any, user: any) => {
    const db_insert = async () => {
        // const { data, error } = await supabaseClient.auth.getUser();
        // if (error) {
        //     console.warn('Cannot toggle bookmark getUser', error);
        //     return;
        // }

        const insertResult = await supabaseClient.from('bookmarks').insert({
            user_id: user.id,
            post_id: post.id
        });

        console.log('debug toggle bookmark insertResult', insertResult)
    }

    const db_delete = async () => {
        // const { data, error } = await supabaseClient.auth.getUser();
        // if (error) {
        //     console.warn('Cannot bookmark getUser', error);
        //     return;
        // }

        const deleteResult = await supabaseClient.from('bookmarks').delete().match({
            user_id: user.id,
            post_id: post.id
        });

        console.log('debug toggle bookmark deleteResult', deleteResult)
    }


    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const new_value = sharedAsyncState.bookmarks[post.id] ? undefined
        : {
            ...post,
            bookmark_datetime: (new Date()).toISOString()
        };
    sharedAsyncState.bookmarks[post.id] = new_value;

    // if (!db_to_local) {
    if (new_value) {
        db_insert();
    } else {
        db_delete();
    }
    // }

    executeListeners(`BookmarkChangelisteners/${post.id}`);
    console.log('sharedAsyncState.bookmarks||', Object.values(sharedAsyncState.bookmarks)
        .map((b: any) => b?.bookmark_datetime)
    )
    return new_value
}

export const hookListener = (key: string, f: () => void) => {
    if (!sharedAsyncState[key]) sharedAsyncState[key] = {};
    const randomSubkey = `${Math.random()}`
    sharedAsyncState[key][randomSubkey] = f;
    // sharedAsyncState[key].push(f)
    return randomSubkey
}

export const executeListeners = (key: string) => {
    if (!sharedAsyncState[key]) return;
    Object.values(sharedAsyncState[key]).forEach((f: any) => f());
}


export const unhookListener = (key: string, subkey: string) => {
    if (!sharedAsyncState[key]) return;
    delete sharedAsyncState[key][subkey];
    // Object.values(sharedAsyncState[key]).forEach((f: any) => f());
}