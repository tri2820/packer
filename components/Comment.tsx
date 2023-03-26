import * as React from 'react';
import { memo, useContext, useEffect, useRef, useState } from 'react';
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
import BlinkingCursor from './BlinkingCursor';
import Octicons from '@expo/vector-icons/Octicons';
import { MainContext } from '../utils';

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
    const { posts, comments, setMode, selectedCommentId, requestComments, setSelectedCommentId } = useContext(MainContext);
    const [display, setDisplay] = useState<'Normal' | 'Inline'>('Normal');
    const [requestingChildren, setRequestingChildren] = useState(false);
    const comment = comments.find((c: any) => c.id == props.id);
    const myCommentIds = comments.filter((c: any) => c.parent_id == comment.id).map((c: any) => c.id);
    const [switchedOnce, setSwitchedOnce] = useState(false);

    const onLinkPress = (target: string) => {
        setMode({
            tag: 'App',
            value: target,
            insetsColor: 'rgba(0, 0, 0, 0)'
        })
    }

    const requestChildren = async () => {
        if (comment.blockRequestChildren) return;
        // if (comment.id.startsWith('placeholder')) return;
        setRequestingChildren(true)
        await requestComments(comment.post_id, comment.id);
        setRequestingChildren(false)
    }


    const switchMode = () => {
        setSwitchedOnce(true);
        if (display == 'Inline') {
            setDisplay('Normal')
            return;
        }

        setDisplay('Inline')
    }

    console.log('comment ger render', comment.id)

    return (
        <Pressable
            style={{
                paddingBottom: props.level > 0 ? 0 : 8,
                // paddingHorizontal: props.level == 0 ? 16 : 0,
                // backgroundColor: props.level == 0 ? 'yellow' : 'transparent'
            }}
            onPress={switchMode}
            onLongPress={() => {
                setSelectedCommentId(comment.id);
            }}
        >

            {
                props.level === 0 && <View
                    style={{
                        borderBottomColor: '#3C3D3F',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                />
            }

            <View
                style={[(props.level == 0) && {
                    marginTop: 8,
                    paddingTop: 4,
                    paddingLeft: 16,
                    paddingRight: 16
                }, (props.level > 0) && {
                    marginVertical: 4,
                    paddingTop: 4,
                    paddingBottom: 4,
                    borderLeftColor: '#6b5920',
                    borderLeftWidth: 2,
                    paddingLeft: 16,
                    marginLeft: 16,
                    marginRight: 16
                }, {
                    backgroundColor: selectedCommentId == comment.id ? '#6b5920' : 'transparent',
                }
                ]}

            >

                <View style={{
                    flex: 1,
                    flexDirection: 'row'
                }}

                >
                    <Text style={{
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        {
                            comment.author_name
                        }
                    </Text>

                    {
                        display == 'Normal' &&
                        <Text style={{
                            color: '#A3A3A3'
                        }}> • {
                                moment.utc(comment.created_at).local().startOf('seconds').fromNow()
                            }</Text>
                    }

                    {
                        display == 'Inline' && <Animated.Text style={{
                            color: '#A3A3A3',
                            flex: 1,
                            paddingBottom: props.level > 0 ? 0 : 4,
                        }}
                            numberOfLines={1}
                            entering={FadeInDown}
                        > • {comment.content}
                        </Animated.Text>
                    }

                </View>


                {
                    display == 'Normal' &&
                    <Animated.View
                        entering={switchedOnce ? FadeInDown : undefined}
                    >
                        <MarkdownView
                            rules={{
                                quote,
                                link
                            }}
                            onLinkPress={onLinkPress}
                            styles={mdstyles}
                        >
                            {
                                comment.content
                            }
                        </MarkdownView>

                        {
                            comment.blinking && <BlinkingCursor />
                        }
                    </Animated.View>
                }

            </View>

            <View style={{
                display: display == 'Inline' ? 'none' : 'flex'
            }}>
                {

                    <View style={{
                        marginTop: 4
                    }}>


                        {
                            myCommentIds?.map((c: any, i: number) =>
                                <View
                                    key={c}
                                    style={{
                                        marginLeft: props.level == 0 ? 0 : 16
                                    }}
                                >
                                    <MemoComment
                                        id={c}
                                        level={props.level + 1}
                                    />
                                </View>)
                        }

                        {
                            !requestingChildren &&
                            myCommentIds.length < comment.comment_count && display == 'Normal' &&
                            <TouchableOpacity style={{
                                backgroundColor: '#2C2C2C',
                                marginBottom: 8,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                                borderRadius: 4
                            }}
                                onPress={() => {
                                    requestChildren()
                                }}
                            >
                                <Text style={{
                                    color: '#e6e6e6',
                                    fontWeight: '500'
                                }}>
                                    Load {comment.comment_count - myCommentIds.length} more
                                </Text>
                            </TouchableOpacity>
                        }
                    </View>
                }
            </View>
        </Pressable>

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