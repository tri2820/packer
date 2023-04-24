import { Octicons } from '@expo/vector-icons';
import moment from 'moment';
import * as React from 'react';
import { memo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MarkdownRule, MarkdownStyles, MarkdownView } from 'react-native-markdown-view';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import BlinkingCursor from './BlinkingCursor';
import { MemoContentMenu } from './ReportMenu';
import { fixText } from '../utils';


const quote: MarkdownRule = {
    order: 0,
    match: (source: string, state: any, lookbehind: any) => {
        // console.log('debug source', source, 'state', state, 'lookbehind', lookbehind)
        // const result = /^\\>(.+)/.exec(source)
        return /^\\>(.+)/.exec(source)
    },
    parse: (capture: any, parse: any, state: any) => {
        // console.log('debug parse', capture, parse, state)
        var stateNested = { ...state, inline: true }
        return { children: parse(capture[1].trim(), stateNested), key: capture[0] }
    },
    render: (node: any, output: any, state: any, styles: any) => {
        const tag = <View
            key={state.key}
            style={blockQuoteView}>
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

const markdownRules = { quote, link }

function Comment(props: any) {
    const [switchedOnce, setSwitchedOnce] = useState(false);
    const longPressed = useSharedValue(false);
    const menuref = useRef<any>(null)
    const openMenu = () => {
        longPressed.value = true;
        menuref.current?.open();
    }
    const created_at = moment
        .utc(props.comment.created_at)
        .local()
        .startOf('seconds')
        .fromNow()

    const onLinkPress = (target: string) => {
        props.setApp({ url: target });
    }

    const switchMode = () => {
        setSwitchedOnce(true);
        if (props.hidden) {
            props.toggle(props.comment.id, true)
            return;
        }

        props.toggle(props.comment.id, false)
    }

    const longPressedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: longPressed.value ? withTiming('rgba(0,0,0,0.5)', { duration: 100 }) : withTiming('rgba(0,0,0,0)', { duration: 200 })
        };
    });

    const onMenuClose = React.useCallback(() => {
        longPressed.value = false;
    }, [])

    const select = () => {
        props.setSelectedComment({ ...props.comment });
    }

    // console.log('debug render comment', props.comment.id)
    return (
        <Animated.View style={longPressedStyle}>
            <Pressable
                style={{
                    paddingBottom: 8,
                    marginLeft: props.comment.level <= 1 ? 0 : (20 * (props.comment.level - 1))
                }}
                onPress={switchMode}
                onLongPress={openMenu}
            >

                {props.comment.level === 0 && <View style={styles.hair} />}

                <View
                    style={props.comment.level == 0 ? styles.level0 : styles.levelMoreThan0}
                >

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        // backgroundColor: 'red'
                    }}>
                        <View style={styles.left}>
                            <Text style={styles.author_name}>
                                {props.comment.author_name}
                            </Text>
                            {/* <Text style={styles.author_name}>
                                {props.comment.id}
                            </Text> */}

                            {!props.hidden
                                ? <Text style={styles.created_at}> • {created_at}</Text>
                                : <Animated.Text style={{
                                    color: '#A3A3A3',
                                    flex: 1,
                                    paddingBottom: props.comment.level > 0 ? 0 : 4,
                                    // backgroundColor: 'blue'
                                }}
                                    numberOfLines={1}
                                    entering={FadeInDown}
                                > • {fixText(props.comment.content, props.comment.author_name)}
                                </Animated.Text>}
                        </View>

                        <MemoContentMenu
                            menuref={menuref}
                            comment={props.comment}
                            triggerOuterWrapper={styles.triggerOuterWrapper}
                            onClose={onMenuClose}
                        />
                    </View>

                    {
                        !props.hidden &&
                        <Animated.View
                            entering={switchedOnce ? FadeInDown : undefined}
                        >
                            <MarkdownView
                                rules={markdownRules}
                                onLinkPress={onLinkPress}
                                styles={mdstyles}
                            >
                                {fixText(props.comment.content, props.comment.author_name) as any}
                            </MarkdownView>

                            {
                                props.comment.blinking
                                    ? <BlinkingCursor />
                                    :
                                    <TouchableOpacity
                                        onPress={select}
                                        style={styles.reply_button}
                                    >
                                        <Octicons name="reply" size={12} color="#A3A3A3" />
                                        <Text style={styles.reply_text}>Reply</Text>
                                    </TouchableOpacity>

                            }
                        </Animated.View>
                    }
                </View>
            </Pressable>
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
        backgroundColor: '#212326',
        paddingVertical: 8,
        paddingHorizontal: 0,
        borderRadius: 4,
        borderColor: '#1E1F22',
        borderWidth: StyleSheet.hairlineWidth,
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
        color: '#FFC542',
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

const blockQuoteView = {
    borderLeftColor: '#6F6F6F',
    borderLeftWidth: 6,
    marginBottom: -32
}

const styles = StyleSheet.create({
    left: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        // backgroundColor: 'green',
        flex: 1
    },
    triggerOuterWrapper: {
        // marginLeft: 'auto',
        // marginRight: 0,
        // alignSelf: 'center',
        // alignContent: 'center',
        // margin-left: auto;
        // order: 2,
        // justifyContent: 'flex-end',
        // backgroundColor: 'blue'
        // paddingHorizontal: 8,
        // paddingVertical: 4,
    },
    reply_text: {
        color: "#A3A3A3",
        marginLeft: 8
    },
    reply_button: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    created_at: {
        color: '#A3A3A3',
        // backgroundColor: 'purple'
    },
    hair: {
        borderBottomColor: '#3C3D3F',
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 16
    },
    header_foot: {
        flexDirection: 'row',
        backgroundColor: 'red',
        flex: 1
    },
    author_name: {
        fontFamily: 'Rubik_500Medium',
        color: 'white'
    },
    level0: {
        marginTop: 8,
        paddingTop: 4,
        paddingLeft: 16,
        paddingRight: 16
    },
    levelMoreThan0: {
        marginVertical: 4,
        paddingTop: 4,
        paddingBottom: 4,
        borderLeftColor: '#FFC542',
        borderLeftWidth: 2,
        paddingLeft: 16,
        marginLeft: 16,
        marginRight: 16
    }
})

export default Comment;
const shouldRerenderTheSame = (p: any, c: any) => {
    return p.hidden == c.hidden
        && p.comment == c.comment
}
export const MemoComment = memo(Comment, shouldRerenderTheSame);