import * as React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutLeft, FadeOutUp, Layout, SequencedTransition, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { State, INIT_DATE, supabaseClient, requestCommentsCount, unitC, C } from '../supabaseClient';
import { MarkdownRule, MarkdownRules, MarkdownStyles, MarkdownView } from 'react-native-markdown-view'
import moment from 'moment';
import { MemoCommentChildren } from './CommentChildren';
import BlinkingCursor from './BlinkingCursor';

const quote: MarkdownRule = {
    order: 0,
    match: (source: string, state: any, lookbehind: any) => {
        // console.log('debug source', source, 'state', state, 'lookbehind', lookbehind)
        // const result = /^\\>(.+)/.exec(source)
        return /^\\>(.+)/.exec(source)
    },
    parse: (capture: any, parse: any, state: any) => {
        // console.log('debug parse', capture, parse, state)
        var stateNested = Object.assign({}, state, { inline: true })  //important to clone!
        return { children: parse(capture[1].trim(), stateNested), key: capture[0] }
    },
    render: (node: any, output: any, state: any, styles: any) => {
        // console.log('debug render', node, output, styles)
        const tag = <View
            key={state.key}
            style={{
                borderLeftColor: '#6F6F6F',
                borderLeftWidth: 6,
                marginBottom: -32
            }}>
            <Text
                style={styles.blockQuote}
            >
                {
                    output(node.children, state)
                }
            </ Text>
        </View>
        return tag
    }
}


const link = {
    order: 0,
    render: (node: any, output: any, state: any, styles: any) => {
        // console.log('debug node', node.target, state)
        return <Text
            key={state.key}
            onPress={
                state.onLinkPress ?
                    () => { state.onLinkPress(node.target) }
                    : undefined
            }
            style={mdstyles.link}>
            {output(node.content)}
        </Text>
    }
}

function Comment(props: any) {
    const [mode, setMode] = useState<'Normal' | 'Inline'>('Normal');
    const [comments, setComments] = useState<any[]>([]);
    const [c, setC] = useState<C>(unitC);
    const [count, setCount] = useState(0);
    const [inited, setInited] = useState(false);
    const [requestingComments, setRequestingComments] = useState(false);

    const requestComments = async (k?: C) => {
        if (requestingComments) return;
        setRequestingComments(true);
        const { c: q, data } = await (k ?? c)();
        if (!data) return;
        setC(() => q);
        setComments(comments.concat(data));
        setRequestingComments(false);
    }

    const onLinkPress = (target: string) => {
        props.setMode({
            tag: 'App',
            value: target,
            insetsColor: 'rgba(0, 0, 0, 0)'
        })
    }

    useEffect(() => {
        if (props.isRecentComment) return;

        if (!props.startLoading) return;
        if (props.level > 1) return;

        if (inited) return;
        setInited(true);

        console.log('debug comment request', props.level);

        (async () => {
            const { c, data: count } = await requestCommentsCount(props.comment.id);
            if (!count) return;
            setCount(count);
            requestComments(c);
        })()
    }, [props.startLoading])

    const switchMode = () => {
        if (mode == 'Inline') {
            setMode('Normal')
            return;
        }

        setMode('Inline')
    }
    // console.log('debug Comment was rendered', new Date().toLocaleTimeString())
    return (
        <Animated.View style={{
            // marginTop: 4,
            // marginBottom: props.level == 0 ? 4 : 0,
            marginBottom: props.level > 0 ? 0 : 8
        }}
            entering={FadeInUp}
        >

            {
                props.level === 0 && <View
                    style={{
                        borderBottomColor: '#3C3D3F',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                />
            }

            <Pressable
                style={[(props.level == 0) && {
                    paddingTop: 12
                }, (props.level > 0) && {
                    marginVertical: 4,
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 16,
                    borderLeftColor: '#6b5920',
                    borderLeftWidth: 2,
                }]}
                onPress={switchMode}
            >

                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    // backgroundColor: 'blue'
                }}>
                    <Text style={{
                        fontWeight: 'bold',
                        color: props.isRecentComment ? '#F2C740' : '#A3A3A3'
                    }}>
                        {
                            props.isRecentComment ? '@default' : props.comment.author_name
                        }
                    </Text>

                    {
                        mode == 'Normal' &&
                        <Text style={{
                            color: '#A3A3A3'
                        }}> • {
                                moment.utc(props.comment.created_at).local().startOf('seconds').fromNow()
                            }</Text>
                    }

                    {
                        mode == 'Inline' && <Animated.Text style={{
                            color: '#A3A3A3',
                            flex: 1,
                            paddingBottom: props.level > 0 ? 0 : 4,
                        }}
                            numberOfLines={1}
                            entering={FadeInDown}
                        > • {props.commentStream ? '...' : props.comment.content}
                        </Animated.Text>
                    }
                </View>


                {
                    mode == 'Normal' &&
                    <Animated.View
                        entering={inited ? FadeInUp : undefined}
                    >
                        <MarkdownView
                            rules={{
                                quote,
                                link
                            }}
                            onLinkPress={onLinkPress}
                            styles={mdstyles}
                        >
                            {props.commentStream ? 'A *really good* multiple line bot answer that is long and insightful' : props.comment.content}
                        </MarkdownView>


                        {
                            props.commentStream && <BlinkingCursor />
                        }
                    </Animated.View>
                }
            </Pressable>

            <View style={{
                display: mode == 'Inline' ? 'none' : 'flex'
            }}>
                {
                    props.isRecentComment ?
                        <MemoComment
                            commentStream
                            comment={{
                                author_name: 'packer',
                                // content: `It's coming`,
                                created_at: new Date().toUTCString()
                            }}
                            level={props.level + 1}
                            startLoading={props.startLoading}
                            setMode={props.setMode}
                        />
                        : <MemoCommentChildren
                            level={props.level}
                            count={count}
                            comments={comments}
                            mode={mode}
                            requestingComments={requestingComments}
                            requestComments={requestComments}
                        />
                }
            </View>

        </Animated.View>
    );
}

const mdstyles: MarkdownStyles = {
    blockQuote: {
        color: '#A3A3A3',
        opacity: 1,
        marginTop: 8,
        marginBottom: 8,
    },
    codeBlock: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'Roboto',
        color: '#e6e6e6',
        backgroundColor: '#161616',
        padding: 8,
        borderRadius: 4,
        overflow: 'hidden',
        fontWeight: '400',
        marginTop: 4,
        marginBottom: 4,
    },
    del: {
        color: '#e6e6e6',
        marginTop: 0
    },
    em: {
        color: '#e6e6e6',
        marginTop: 0
    },
    heading: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    heading1: {
        color: '#e6e6e6',
        marginTop: 0
    },
    heading2: {
        color: '#e6e6e6',
        marginTop: 0,
    },
    heading3: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    heading4: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    heading5: {
        color: '#e6e6e6',
        marginTop: 0,
    },
    heading6: {
        color: '#e6e6e6',
        marginTop: 0
    },
    hr: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    inlineCode: {
        color: '#e6e6e6',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'Roboto',
        marginTop: 0,
    },
    link: {
        color: '#F2C740',
        marginTop: 0,

    },
    listItemNumber: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    listItemBullet: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    listItemOrderedContent: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    listItemUnorderedContent: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    paragraph: {
        color: '#e6e6e6',
        lineHeight: 18,
        marginTop: 4,
        marginBottom: 4
    },
    strong: {
        color: '#e6e6e6',
        marginTop: 0,

    },
    u: {
        color: '#e6e6e6',
        marginTop: 0,
    },
}

export default Comment;
export const MemoComment = memo(Comment);