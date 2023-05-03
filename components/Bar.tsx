import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, TextInput } from 'react-native-gesture-handler';
import Animated, { KeyboardState, runOnJS, useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, normalizedHostname, scaleup, sharedAsyncState } from '../utils';
import { MemoInputSend } from './InputSend';
import { MemoSignInSection } from './SignInSection';
import { MemoUserList } from './UserList';



const INSETS_OFFSET_BOTTOM = 0;
const HANDLER_HEIGHT = 20;

function Bar(props: any) {
    const insets = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();
    const MARGIN_TOP = insets.top + scaleup(170);
    const HEIGHT = constants.height
        - MARGIN_TOP
        + INSETS_OFFSET_BOTTOM
        + (Platform.OS == 'android' ? props.minBarHeight : 0)
    const maxBarHeight = props.safeHeight * 0.8;
    const minOffset = -(maxBarHeight - props.minBarHeight);
    const allowShowingUserList = useSharedValue(true);
    const offset = useSharedValue(0);
    const _offset = useSharedValue(0);
    const [focus, setFocus] = useState(false);
    const [userListMode, setUserListMode] = useState<'normal' | 'settings'>('normal')

    const inputref = useRef<any>(undefined);
    // if (props.selectedComment) {
    //     inputref.current?.focus();
    // }

    sharedAsyncState['barstateListener'] = () => {
        changeState('maximize');
    }

    const inputStyles = useAnimatedStyle(() => {
        const keyboard_shown = keyboard.state.value == KeyboardState.OPEN || keyboard.state.value == KeyboardState.OPENING;
        const k = -(offset.value)
            - HANDLER_HEIGHT
            + props.minBarHeight
            - keyboard.height.value
            + (keyboard_shown ? insets.bottom : 0);

        return {
            maxHeight: k,
            display: offset.value < -40 && (allowShowingUserList.value || props.user == null) ? 'none' : (!showUserList ? 'flex' : 'none'),
            // backgroundColor: 'blue'
        };
    });

    const overlayStyles = useAnimatedStyle(() => {
        return {
            display: offset.value > -40 ? 'none' : 'flex',
            opacity: Math.pow(offset.value / minOffset, 0.3) * 0.8
        };
    });

    useEffect(() => {
        if (props.user == null) return;
        allowShowingUserList.value = true;
        setShowUserList(true);
    }, [props.user])


    const changeState = (state: 'maximize' | 'minimize') => {
        console.log('debug changeState')
        if (state == 'maximize') {
            allowShowingUserList.value = false;

            if (props.user == null) {
                offset.value = withSpring(minOffset, { velocity: 5, mass: 0.2 });
                _offset.value = withSpring(minOffset, { velocity: 5, mass: 0.2 });
            } else {
                offset.value = withTiming(minOffset, { duration: 100 });
                _offset.value = withTiming(minOffset, { duration: 100 });

                setTimeout(() => {
                    console.log('debug set focus true')
                    setFocus(true)
                }, 300);
            }

            return
        }

        offset.value = withSpring(0, { velocity: 5, mass: 0.2 });
        _offset.value = withSpring(0, { velocity: 5, mass: 0.2 });
        setFocus(false)
        allowShowingUserList.value = true;
    }

    useEffect(() => {
        console.log("debug focus", focus)
    }, [focus])

    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname);
    }

    const [showUserList, setShowUserList] = useState(false);
    const barAnimationUpDown = useAnimatedStyle(() => {
        // console.log('offset.value', offset.value, focus, showUserList, allowShowingUserList.value, keyboard.state.value, KeyboardState.UNKNOWN)
        if (offset.value < -40 && !focus && !showUserList && allowShowingUserList.value
            &&
            (keyboard.state.value == KeyboardState.CLOSED
                || keyboard.state.value == KeyboardState.UNKNOWN)
        ) {
            runOnJS(setShowUserList)(true);
        }
        if ((focus || offset.value >= -40) && showUserList) {
            runOnJS(setShowUserList)(false);
        }

        return {
            transform: [{
                translateY: offset.value
            }],
            height: props.minBarHeight - offset.value
            // display: props.activePostIndex == 0 ? 'none' : 'flex'
        };
    });


    const gesture = Gesture
        .Pan()
        .enabled(!props.isSinglePost)
        .activeOffsetY(showUserList && Platform.OS == 'android' ? [-100, 100] : [-10, 10])
        // .activeOffsetX([-10, 10])
        .onChange((e) => {
            const newValue = _offset.value + e.changeY;
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
                const value = 0;
                _offset.value = withSpring(value, { velocity: event.velocityY, mass: 0.15, overshootClamping: true })
                offset.value = withSpring(value, { velocity: event.velocityY, mass: 0.15, overshootClamping: true })
                runOnJS(changeState)('minimize')
                runOnJS(setUserListMode)('normal')
                if (props.user === null) runOnJS(props.setSelectedComment)(null)
                return;
            }

            _offset.value = withSpring(minOffset, { velocity: event.velocityY, mass: 0.15 });
            offset.value = withSpring(minOffset, { velocity: event.velocityY, mass: 0.15 });

        })

    const hideInput = () => {
        // props.setSelectedComment(null);
        if (!focus) {
            changeState('minimize');
            return;
        }
        inputref.current?.blur();
    }

    const onBlur = () => {
        changeState('minimize');
    }

    useEffect(() => {
        if (props.selectedComment == null) return;
        changeState('maximize')
    }, [props.selectedComment])

    console.log('debug bar')
    if (props.activePostIndex == 0) return <></>
    return (
        <>
            <Animated.View style={[styles.overlay, overlayStyles]}>
                <Pressable onPress={hideInput} style={styles.expand} />
            </Animated.View>

            <View style={{
                // backgroundColor: 'green',
                width: '100%',
                flex: 1,
                alignSelf: 'stretch'
            }}>

                <GestureDetector gesture={gesture}>
                    <Animated.View style={[
                        {
                            borderTopColor: '#3C3D3F',
                            borderTopWidth: StyleSheet.hairlineWidth,
                            backgroundColor: props.mode == 'normal' ? '#151316' : '#272727',
                            // flex: 1
                        },
                        barAnimationUpDown
                    ]}>
                        {
                            props.user === null && <MemoSignInSection
                                INSETS_OFFSET_BOTTOM={INSETS_OFFSET_BOTTOM}
                                minOffset={minOffset}
                                offset={offset}
                                mode={props.mode}
                                user={props.user}
                                setUser={props.setUser}
                                // setUserListMode={setUserListMode}
                                changeState={changeState}
                                maxBarHeight={maxBarHeight}
                            />
                        }


                        <View style={styles.handler}>
                            {
                                !props.isSinglePost &&
                                <View style={styles.handler_inside} />
                            }
                        </View>


                        <Animated.View style={[inputStyles, {
                            flex: 1,
                            // backgroundColor: 'orange'
                        }]}>
                            <MemoInputSend
                                // wallref={props.wallref}
                                focus={focus}
                                onBlur={onBlur}
                                inputref={inputref}
                                selectedComment={props.selectedComment}
                                setSelectedComment={props.setSelectedComment}
                                changeState={changeState}
                                onSubmit={props.onSubmit}
                                activePostIndex={props.activePostIndex}
                                user={props.user}
                                setMode={props.setMode}
                            />
                        </Animated.View>


                        {
                            showUserList &&
                            props.user !== null &&
                            <MemoUserList navProps={props.navProps} mode={userListMode} setMode={setUserListMode} offset={offset} user={props.user} setUser={props.setUser} minOffset={minOffset} />
                        }
                    </Animated.View>
                </GestureDetector >
            </View >
        </>
    );
}

export default Bar;
const styles = StyleSheet.create({
    press: {
        paddingTop: 5,
        height: '100%',
        width: '100%',
        flex: 1
    },
    overlay:
    {
        backgroundColor: 'black',
        opacity: 0.8,
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0
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
        borderTopColor: '#3C3D3F',
        // borderTopLeftRadius: 4,
        // borderTopRightRadius: 4,
    },
    input: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    inputHeader: {
        // backgroundColor: 'blue',
        height: '100%',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    textinput: {
        color: '#F1F1F1',
        height: '100%',
        width: '100%',
        flex: 1,
        // backgroundColor: 'red',
        textAlignVertical: 'top'
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

export const MemoBar = memo(Bar);