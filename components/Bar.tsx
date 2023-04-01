import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, TextInput } from 'react-native-gesture-handler';
import Animated, { KeyboardState, runOnJS, useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, normalizedHostname } from '../utils';
import SignInSection from './SignInSection';
import UserList from './UserList';

const INSETS_OFFSET_BOTTOM = 200;
const HANDLER_HEIGHT = 20;

function Bar(props: any) {
    const { mode, setMode, selectingComment, setSelectedComment } = props;
    const [text, setText] = useState('');
    const insets = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();
    const MARGIN_TOP = insets.top + 170;
    const HEIGHT = constants.height - MARGIN_TOP + INSETS_OFFSET_BOTTOM;
    const minOffset = -(constants.height - insets.top - insets.bottom - MARGIN_TOP);
    const offset = useSharedValue(0);
    const _offset = useSharedValue(0);
    const [focused, setFocused] = useState(false);
    const [userListMode, setUserListMode] = useState<'normal' | 'settings'>('normal')

    const ref = useRef<any>(undefined);
    if (selectingComment) {
        ref.current?.focus();
    }

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: props.offset.value > 1 ? (2 - 1 / Math.pow(props.offset.value, 0.2)) : 1 },
            ]
        };
    });

    const inputStyles = useAnimatedStyle(() => {
        const k = -(offset.value) - HANDLER_HEIGHT + props.minBarHeight - keyboard.height.value +
            (keyboard.state.value == KeyboardState.OPEN || keyboard.state.value == KeyboardState.OPENING ? insets.bottom : 0);
        return {
            height: k,
            display: offset.value > -40 || focused ? 'flex' : 'none'
        };
    });

    const overlayStyles = useAnimatedStyle(() => {
        return {
            display: offset.value > -40 ? 'none' : 'flex',
            opacity: Math.pow(offset.value / minOffset, 0.3) * 0.8
        };
    });

    useEffect(() => {
        setText('');
    }, [props.activePostIndex])

    const changeState = (state: 'maximize' | 'minimize') => {
        if (state == 'maximize') {
            offset.value = withSpring(minOffset, { velocity: 5, mass: 0.2 });
            _offset.value = withSpring(minOffset, { velocity: 5, mass: 0.2 });
            return
        }
        offset.value = withSpring(0, { velocity: 5, mass: 0.2 });
        _offset.value = withSpring(0, { velocity: 5, mass: 0.2 });
    }

    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname);
    }

    const barStyles = useAnimatedStyle(() => {
        if
            (
            keyboard.state.value == KeyboardState.OPENING
            && offset.value > -(keyboard.height.value - insets.bottom)
        ) {
            offset.value = -(keyboard.height.value - insets.bottom)
            _offset.value = -(keyboard.height.value - insets.bottom)
        }

        return {
            transform: [{
                translateY: offset.value
            }]
        };
    });


    const gesture = Gesture
        .Pan()
        .activeOffsetY([-10, 10])
        .onChange((e) => {
            const newValue = _offset.value + e.changeY;
            // TWO
            const keyboardOffset = -(keyboard.height.value - insets.bottom);
            if (keyboardOffset < newValue) {
                _offset.value = keyboardOffset;
                offset.value = keyboardOffset;
                return;
            }

            if (minOffset <= newValue) {
                _offset.value = newValue;
                offset.value = newValue;
                return
            }

            _offset.value = newValue;
            const overdrag = minOffset - newValue;
            offset.value = minOffset - Math.pow(overdrag, 0.5);
        })
        .onEnd((event, success) => {
            const newOffset = _offset.value + event.velocityY / constants.pixelratio

            if (newOffset > minOffset / 2) {
                // THREE
                const value = keyboard.state.value == KeyboardState.OPEN || keyboard.state.value == KeyboardState.OPENING ? -keyboard.height.value + insets.bottom : 0;
                _offset.value = withSpring(value, { velocity: event.velocityY, mass: 0.15, overshootClamping: true })
                offset.value = withSpring(value, { velocity: event.velocityY, mass: 0.15, overshootClamping: true })
                if (value == 0) runOnJS(setUserListMode)('normal')
                return;
            }

            _offset.value = withSpring(minOffset, { velocity: event.velocityY, mass: 0.15 });
            offset.value = withSpring(minOffset, { velocity: event.velocityY, mass: 0.15 });

        })

    const getQuote = () => {
        const text = props.selectedCommenText;
        return text.length > 30 ? `${text.slice(0, 30)}...` : text;
    }

    const hideInput = () => {
        setSelectedComment(null);
        changeState('minimize');
        ref.current?.blur();
    }

    const setModeNormal = () => {
        setMode({ tag: 'Normal' });
    }

    const onFocus = () => {
        if (props.user === null) {
            ref.current?.blur()
            changeState('maximize');
            return;
        }
        setFocused(true);
    }

    const onBlur = () => {
        console.log('called');
        setFocused(false);
        if (props.user === null) return;
        changeState('minimize');
    }

    const send = () => {
        if (text.trim().length > 0) {
            props.onSubmit(text);
        }
        ref.current?.blur();
        setText('');
    }

    const open = () => {
        Linking.openURL(mode.value).catch(error =>
            console.warn('An error occurred: ', error),
        )
    }

    const placeHolder = selectingComment ? `Replying to "${getQuote()}"` : 'Add a discussion...'

    return (
        <>
            <Animated.View style={[styles.overlay, overlayStyles]}>
                <Pressable onPress={hideInput} style={styles.expand} />
            </Animated.View>


            {/* Sheet */}
            <GestureDetector gesture={gesture}>
                <Animated.View style={[{
                    top: props.wallHeight,
                    backgroundColor: mode.tag == 'Comment' ? '#212121' : '#151316',
                    height: HEIGHT
                }, styles.sheet, barStyles]}
                >
                    {
                        props.user === null && <SignInSection INSETS_OFFSET_BOTTOM={INSETS_OFFSET_BOTTOM} minOffset={minOffset} offset={offset} mode={mode} user={props.user} setUser={props.setUser} />
                    }

                    <View style={styles.handler}>
                        <View style={styles.handler_inside} />
                    </View>

                    <Animated.View
                        style={[styles.inputbar, inputStyles]}
                    >
                        <View style={styles.input}>
                            {/* Close Button */}
                            {
                                (mode.tag == 'Comment' || mode.tag == 'App') &&
                                !focused &&
                                <TouchableOpacity onPress={setModeNormal}>
                                    <Animated.View style={animatedStyles} >
                                        <Ionicons name="close"
                                            size={26}
                                            color='#C2C2C2'
                                            style={{
                                                marginRight: mode.tag == 'Comment' ? 8 : 0,
                                            }} />
                                    </Animated.View>
                                </TouchableOpacity>
                            }


                            {
                                mode.tag == 'App' ?
                                    <>
                                        <View style={styles.sourceNameView}>
                                            <Text style={styles.sourceName}>{
                                                getSourceName(mode.value)
                                            }
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={open}>
                                            {
                                                Platform.OS == 'ios' ?
                                                    <Ionicons name='compass-outline' size={26} color='#C2C2C2' />
                                                    : <Ionicons name='arrow-forward-circle-outline' size={26} color='#C2C2C2' />
                                            }
                                        </TouchableOpacity>
                                    </>

                                    : <View style={styles.inputHeader}>
                                        <TextInput
                                            multiline
                                            onFocus={onFocus}
                                            onBlur={onBlur}
                                            ref={ref}
                                            value={text}
                                            onChangeText={setText}
                                            placeholder={placeHolder}
                                            placeholderTextColor='#C2C2C2'
                                            style={styles.textinput}
                                            keyboardAppearance='dark'
                                            selectionColor='#F2C740'
                                        />

                                        {focused &&
                                            <TouchableOpacity onPress={send}
                                                style={{
                                                    height: props.minBarHeight - HANDLER_HEIGHT,
                                                    width: props.minBarHeight - HANDLER_HEIGHT,
                                                    alignItems: 'flex-end',
                                                    justifyContent: 'flex-start'
                                                }}
                                            >
                                                <Ionicons name="send" size={24} color='#F2C740' />
                                            </TouchableOpacity>
                                        }
                                    </View>
                            }
                        </View>

                    </Animated.View>


                    {
                        props.user !== null && !focused && <UserList mode={userListMode} setMode={setUserListMode} offset={offset} user={props.user} setUser={props.setUser} listHeight={HEIGHT - HANDLER_HEIGHT - INSETS_OFFSET_BOTTOM - insets.bottom} minOffset={minOffset} />
                    }

                </Animated.View>
            </GestureDetector>
        </>
    );
}

export default Bar;
const styles = StyleSheet.create({
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
    },
    handler_inside: {
        height: 6,
        width: 40,
        backgroundColor: '#5D5F64',
        borderRadius: 3
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
        alignItems: 'center'
    },
    inputHeader: {
        height: '100%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    textinput: {
        color: '#F1F1F1',
        height: '100%',
        width: '100%',
        flex: 1
    },
    sourceNameView: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
    },
    sourceName: {
        color: '#C2C2C2',
        fontWeight: '600'
    }
})