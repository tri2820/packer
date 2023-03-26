import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, StyleSheet, Pressable, SafeAreaView, Text, Image, View, TouchableOpacity, Linking, Platform, ImageBackground, PanResponder } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, MainContext, normalizedHostname } from '../utils';
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp, KeyboardState, runOnJS, runOnUI, useAnimatedKeyboard, useAnimatedProps, useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useScrollViewOffset, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, TextInput, FlatList } from 'react-native-gesture-handler';
import { signIn } from '../auth';
import { supabaseClient, upsertProfile } from '../supabaseClient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import SignInSection from './SignInSection';
import UserList from './UserList';
import * as Haptics from 'expo-haptics';


function Bar(props: any) {
    const { mode, setMode, setSelectedCommentId, selectedCommentId } = useContext(MainContext);
    const [text, setText] = useState('');
    const [profile, setProfile] = useState<any>(undefined);

    const insets = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();
    const MARGIN_TOP = insets.top + 170;
    const INSETS_OFFSET_BOTTOM = 200;
    const HANDLER_HEIGHT = 14;
    const HEIGHT = constants.height - MARGIN_TOP + INSETS_OFFSET_BOTTOM;
    const minOffset = -(constants.height - insets.top - insets.bottom - MARGIN_TOP);
    const offset = useSharedValue(0);
    const _offset = useSharedValue(0);
    const [focused, setFocused] = useState(false);

    // const showHint = useSharedValue(false);
    const ref = useRef<any>(undefined);
    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: props.offset.value > 1 ? (2 - 1 / Math.pow(props.offset.value, 0.2)) : 1 },
            ]
        };
    });

    const [showInputBar, setShowInputBar] = useState(true);
    useDerivedValue(() => {
        // console.log('props.offset.value', offset.value)
        runOnJS(setShowInputBar)(offset.value > -200 || focused)
        return offset.value
    })

    useEffect(() => {
        setText('');
    }, [props.activePostIndex])

    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname);
    }

    const barStyles = useAnimatedStyle(() => {
        // ONE
        // console.log('debug showHint.value', showHint.value == '& ');

        const x = text[0] == '&' && text[1] == ' ' && focused ? 24 : 0
        if
            (
            // keyboard.state.value == KeyboardState.OPEN || keyboard.state.value == KeyboardState.OPENING
            // && 
            // offset.value > 0 && 
            keyboard.state.value == KeyboardState.OPENING
            && offset.value > -(keyboard.height.value - insets.bottom + x)
        ) {
            // ) {
            offset.value = -(keyboard.height.value - insets.bottom)
            _offset.value = -(keyboard.height.value - insets.bottom)
        }

        return {
            transform: [{
                translateY:
                    // withSpring(
                    offset.value - x
                // , { mass: 0.01, overshootClamping: true })
            }]
        };
    });

    const overlayStyles = useAnimatedStyle(() => {
        return {
            opacity: Math.pow(offset.value / minOffset, 0.3) * 0.8,
            display: offset.value == 0 ? 'none' : 'flex'
        };
    });


    const [needReset, setNeedReset] = useState(false);
    useEffect(() => {
        if (!needReset) return;
        setNeedReset(false)
    }, [needReset])

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
                _offset.value = withSpring(keyboard.state.value == KeyboardState.OPEN || keyboard.state.value == KeyboardState.OPENING ? -keyboard.height.value + insets.bottom : 0, { velocity: event.velocityY, mass: 0.15, overshootClamping: true })
                offset.value = withSpring(keyboard.state.value == KeyboardState.OPEN || keyboard.state.value == KeyboardState.OPENING ? -keyboard.height.value + insets.bottom : 0, { velocity: event.velocityY, mass: 0.15, overshootClamping: true })
                return;
            }

            _offset.value = withSpring(minOffset, { velocity: event.velocityY, mass: 0.15 });
            offset.value = withSpring(minOffset, { velocity: event.velocityY, mass: 0.15 });
        })

    useEffect(() => {
        if (selectedCommentId === null) return;
        ref.current.focus()
    }, [selectedCommentId])

    return (
        <>

            {/* Overlay */}
            <Animated.View
                style={[{
                    backgroundColor: 'black',
                    height: constants.height,
                    width: constants.width,
                    position: 'absolute'
                },
                    overlayStyles]}
            >
                <Pressable onPress={() => {
                    Keyboard.dismiss();
                    setSelectedCommentId(null);
                    offset.value = withSpring(0, { velocity: 5, mass: 0.15 });
                    _offset.value = withSpring(0, { velocity: 5, mass: 0.15 });
                }}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
            </Animated.View>

            {/* Sheet */}
            <GestureDetector
                gesture={gesture}

            >
                <Animated.View style={[{
                    top: constants.height - props.minBarHeight - insets.bottom,
                    height: HEIGHT,
                    position: 'absolute',
                    width: constants.width,
                    backgroundColor: mode.tag == 'Comment' ? '#212121' : '#151316',
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: '#2A2829',
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                }, barStyles]}
                >
                    {
                        props.user === null && <SignInSection INSETS_OFFSET_BOTTOM={INSETS_OFFSET_BOTTOM} minOffset={minOffset} offset={offset} mode={mode} user={props.user} setUser={props.setUser} />
                    }


                    {/* HANDLER */}
                    <View style={{
                        width: '100%',
                        height: HANDLER_HEIGHT,
                        // backgroundColor: 'blue',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}>

                        <View style={{
                            height: 6,
                            width: 40,
                            backgroundColor: '#5D5F64',
                            borderRadius: 3
                        }} />

                    </View>

                    {/* INPUT BAR */}
                    {showInputBar && <Animated.View
                        style={[{
                            // backgroundColor: 'red',
                            paddingLeft: 20,
                            paddingRight: 20,
                            width: '100%',
                            height: props.minBarHeight - HANDLER_HEIGHT - 4,
                            // top: HANDLER_HEIGHT,
                            // backgroundColor: 'blue',
                            // position: 'absolute'
                        },
                        ]}
                        exiting={FadeOutUp.duration(100)}
                        entering={FadeInDown.duration(100)}
                    >
                        {/* TOOLS */}
                        {/* {
                            selectedCommentId != '' &&
                            focused &&
                            <View style={{
                                marginTop: 4,
                                height: 20,
                                width: '100%',
                                // backgroundColor: 'blue',
                                // alignContent: 'center',
                                justifyContent: 'center'
                            }}
                            >
                                <Text style={{
                                    color: '#C2C2C2',
                                    fontSize: 10
                                }}>Replying to a comment</Text>
                            </View>
                        } */}

                        {/* INPUT */}
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            height: props.minBarHeight - HANDLER_HEIGHT,
                            paddingBottom: 4,
                            // backgroundColor: 'blue'
                        }}>
                            {/* Close Button */}
                            {
                                (mode.tag == 'Comment' || mode.tag == 'App') &&
                                !focused &&
                                <TouchableOpacity onPress={() => {
                                    setMode({ tag: 'Normal' });
                                }}>
                                    <Animated.View style={animatedStyles} >
                                        <Ionicons name="close" size={26} color='#C2C2C2' style={{
                                            // padding: 4,
                                            marginRight: mode.tag == 'Comment' ? 8 : 0,
                                            // backgroundColor: 'red'
                                        }} />
                                    </Animated.View>
                                </TouchableOpacity>
                            }


                            {mode.tag != 'App' && <>
                                <TextInput
                                    // multiline
                                    onFocus={() => {
                                        if (props.user === null) {
                                            console.log('debug minOffset', minOffset)
                                            ref.current.blur()
                                            _offset.value = withSpring(minOffset, { mass: 0.15 })
                                            offset.value = withSpring(minOffset, { mass: 0.15 })
                                            return;
                                        }

                                        setFocused(true)
                                    }}
                                    onBlur={() => { setFocused(false) }}
                                    ref={ref}
                                    value={text}
                                    onChangeText={setText}
                                    placeholder={'Add a discussion...'}
                                    placeholderTextColor='#C2C2C2'
                                    style={{
                                        color: '#F1F1F1',
                                        height: '100%',
                                        flex: 1,
                                        marginLeft: 0,
                                        marginRight: 0
                                    }}
                                    returnKeyType='send'
                                    keyboardAppearance='dark'
                                    onSubmitEditing={() => {
                                        props.onSubmit(text);
                                        offset.value = withSpring(0, { velocity: 5, mass: 0.2 });
                                        _offset.value = withSpring(0, { velocity: 5, mass: 0.2 });
                                        setText('');
                                    }}
                                    selectionColor='#F2C740'
                                />

                            </>}


                            {
                                mode.tag == 'App' &&
                                <View style={{
                                    // backgroundColor: 'blue',
                                    width: '100%',
                                    flex: 1,
                                    alignItems: 'center',
                                    // marginRight: 28 + 16
                                }}>
                                    <Text style={{
                                        color: '#C2C2C2',
                                        fontWeight: '600'
                                    }}>{
                                            getSourceName(mode.value)
                                        }
                                    </Text>
                                </View>
                            }

                            {
                                mode.tag == 'App' &&
                                <TouchableOpacity onPress={() => {
                                    Linking.openURL(mode.value).catch(error =>
                                        console.warn('An error occurred: ', error),
                                    )
                                }}>
                                    <View style={{
                                        // padding: 4,
                                    }}>
                                        {
                                            Platform.OS == 'ios' ?
                                                <Ionicons name='compass-outline' size={26} color='#C2C2C2' />
                                                : <Ionicons name='arrow-forward-circle-outline' size={26} color='#C2C2C2' />
                                        }

                                    </View>
                                </TouchableOpacity>
                            }
                        </View>

                    </Animated.View>
                    }

                    {
                        props.user !== null && !focused && <UserList needReset={needReset} offset={offset} user={props.user} setUser={props.setUser} listHeight={HEIGHT - HANDLER_HEIGHT - INSETS_OFFSET_BOTTOM - insets.bottom} minOffset={minOffset} />
                    }

                </Animated.View>
            </GestureDetector>
        </>
    );
}

export default Bar;
