import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import * as React from 'react';
import { memo, useEffect, useState } from 'react';
import Animated, { Platform, Text, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { TextInput } from 'react-native-gesture-handler';
import { constants } from '../utils';
import { FadeIn } from 'react-native-reanimated';
import { TextInput } from 'react-native-gesture-handler';

const HANDLER_HEIGHT = 20;

function InputSend(props: any) {
    const [text, setText] = useState('');



    const getQuote = () => {
        const text = props.selectedComment.content;
        return text.length > 30 ? `${text.slice(0, 30)}...` : text;
    }

    useEffect(() => {
        setText('');
        props.setSelectedComment(null)
    }, [props.activePostIndex])

    const send = async () => {
        if (text.trim().length > 0) {
            props.onSubmit(text, props.selectedComment);
        }
        setText('');
        props.setSelectedComment(null)
        props.inputref.current?.blur();
        props.setMode('comment');
    }

    const placeHolder =
        // props.activePostIndex == 0 ?
        //     'Down the rabbit hole we go!' :
        (props.selectedComment ?
            `Replying to "${getQuote()}"` :
            (props.focus ? '"Tell me one good thing about this"' : 'Chat with Packer...')
        )

    const press = () => {
        // if (props.activePostIndex == 0) {
        // props.wallref.current?.scrollToIndex({ index: 1 })
        // return;
        // }
        props.changeState('maximize');
    }

    // useEffect(() => {
    //     console.log('debug text', text)
    // }, [text])

    const blur = () => {
        if (text.trim().length == 0) {
            setText('')
            props.setSelectedComment(null)
        }
        props.onBlur()
    }

    // console.log('render')
    return (
        <>


            {props.focus ?
                <View style={{
                    flexDirection: 'row',
                    flex: 1,
                }}>

                    {
                        props.selectedComment &&
                        <Octicons name="reply" size={12} style={{
                            marginTop: 6,
                            marginLeft: 16
                        }} color="#A3A3A3" />
                    }
                    <TextInput
                        autoFocus
                        multiline
                        onBlur={blur}
                        ref={props.inputref}
                        value={text}
                        onChangeText={setText}
                        placeholder={placeHolder}
                        placeholderTextColor='#C2C2C2'
                        style={{
                            color: '#F1F1F1',
                            alignSelf: 'stretch',
                            flex: 1,
                            marginLeft: props.selectedComment ? 8 : 16,
                            // backgroundColor: 'red'
                        }}
                        keyboardAppearance='dark'
                        {...(Platform.OS == 'ios' ? {
                            selectionColor: '#FFC542'
                        } : {
                            cursorColor: '#FFC542'
                        })
                        }
                    />
                    <TouchableOpacity onPress={send} style={{
                        paddingHorizontal: 16,
                        // backgroundColor: 'red',
                        alignSelf: 'baseline'
                    }}>
                        <Ionicons name="send" size={24} color='#FFC542' />
                    </TouchableOpacity>
                </View> :
                // <Text>154</Text>
                <Pressable
                    style={styles.press}
                    onPress={press}
                >
                    {
                        props.user ?
                            <Text style={{
                                color: text == '' ? '#C2C2C2' : '#F1F1F1'
                            }}>{
                                    text == '' ? placeHolder : (text.length > 30 ? `${text.slice(0, 30)}...` : text)
                                }
                            </Text> : <View>
                                <Text style={{
                                    color: '#C2C2C2'
                                }}>Sign in to chat with Packer</Text>
                            </View>
                    }
                </Pressable>
            }
        </>
    );
}

export default InputSend;
const styles = StyleSheet.create({
    press: {
        paddingTop: 5,
        paddingLeft: 16,
        flex: 1,
        // backgroundColor: 'yellow'
    },
    overlay:
    {
        backgroundColor: 'black',
        opacity: 0.8,
        height: constants.height,
        width: constants.width,
        position: 'absolute'
    },
    expand: {
        width: '100%',
        height: '100%'
    },
    handler: {
        width: '100%',
        height: HANDLER_HEIGHT,
        alignItems: 'center',
        justifyContent: 'flex-end',
        // backgroundColor: 'blue'
    },
    handler_inside: {
        height: 6,
        width: 40,
        backgroundColor: '#5D5F64',
        borderRadius: 3,
        marginBottom: 8
    },
    inputbar: {
        paddingLeft: 20,
        paddingRight: 20,
        width: '100%',
    },
    sheet: {
        position: 'absolute',
        width: constants.width,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#2A2829',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    input: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    inputHeader: {
        height: '100%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    sourceNameView: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'red',
        height: 26
    },
    sourceName: {
        color: '#C2C2C2',
        fontWeight: '600'
    }
})

export const MemoInputSend = memo(InputSend);