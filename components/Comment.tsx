import { Octicons } from '@expo/vector-icons';
import moment from 'moment';
import * as React from 'react';
import { memo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MarkdownRule, MarkdownStyles, MarkdownView } from 'react-native-markdown-view';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BlinkingCursor from './BlinkingCursor';
import { MemoContentMenu } from './ReportMenu';


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
    const [display, setDisplay] = useState<'Normal' | 'Inline'>('Normal');
    const [switchedOnce, setSwitchedOnce] = useState(false);

    const created_at = moment
        .utc(props.comment.created_at)
        .local()
        .startOf('seconds')
        .fromNow()

    const onLinkPress = (target: string) => {
        props.backToApp(target)
    }

    const switchMode = () => {
        setSwitchedOnce(true);
        if (display == 'Inline') {
            setDisplay('Normal')
            props.toggle(props.comment.id, true)
            return;
        }

        setDisplay('Inline')
        props.toggle(props.comment.id, false)
    }

    const select = () => {
        props.setSelectedComment(props.comment);
    }


    return (
        <Pressable
            style={{
                paddingBottom: 8,
                marginLeft: props.comment.level <= 1 ? 0 : (16 * props.comment.level)
            }}
            onPress={switchMode}
        >

            {props.comment.level === 0 && <View style={styles.hair} />}

            <View
                style={props.comment.level == 0 ? styles.level0 : styles.levelMoreThan0}
            >

                <View style={styles.header_foot}>
                    <Text style={styles.author_name}>
                        {props.comment.author_name}
                    </Text>

                    {
                        display == 'Normal'
                            ? <Text style={styles.created_at}> • {created_at}</Text>
                            : <Animated.Text style={{
                                color: '#A3A3A3',
                                flex: 1,
                                paddingBottom: props.comment.level > 0 ? 0 : 4,
                            }}
                                numberOfLines={1}
                                entering={FadeInDown}
                            > • {props.comment.content}
                            </Animated.Text>
                    }
                </View>

                {
                    display == 'Normal' &&
                    <Animated.View
                        entering={switchedOnce ? FadeInDown : undefined}
                    >
                        <MarkdownView
                            rules={markdownRules}
                            onLinkPress={onLinkPress}
                            styles={mdstyles}
                        >
                            {props.comment.content}
                        </MarkdownView>

                        {
                            props.comment.blinking
                                ? <BlinkingCursor />
                                :
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    alignSelf: 'flex-end',
                                }}>
                                    <MemoContentMenu
                                        comment={props.comment}
                                        triggerOuterWrapper={{
                                            // backgroundColor: 'red',
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                        }} />

                                    <TouchableOpacity
                                        onPress={select}
                                        style={styles.reply_button}
                                    >
                                        <Octicons name="reply" size={12} color="#A3A3A3" />
                                        {
                                            props.comment.level == 0 &&
                                            <Text style={styles.reply_text}>Reply</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                        }
                    </Animated.View>
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
        backgroundColor: '#212326',
        padding: 8,
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
    reply_text: {
        color: "#A3A3A3",
        marginLeft: 8
    },
    reply_button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    created_at: {
        color: '#A3A3A3'
    },
    hair: {
        borderBottomColor: '#3C3D3F',
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 16
    },
    header_foot: {
        flexDirection: 'row'
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
export const MemoComment = memo(Comment);