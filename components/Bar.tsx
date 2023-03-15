import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, StyleSheet, Pressable, SafeAreaView, Text, View, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, normalizedHostname } from '../utils';
import { IconX, IconLock, IconChevronLeft, IconArrowUpRightCircle, IconBrandSafari, IconSearch } from 'tabler-icons-react-native';
import Animated, { Easing, KeyboardState, useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, TextInput } from 'react-native-gesture-handler';

function Bar(props: any) {
    const [text, setText] = useState('');
    const insets = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();
    const MARGIN_TOP = insets.top + 100;
    const INSETS_OFFSET_BOTTOM = 200;
    const HANDLER_HEIGHT = 14;
    const HEIGHT = constants.height - MARGIN_TOP + INSETS_OFFSET_BOTTOM;
    const minOffset = -(constants.height - insets.top - insets.bottom - MARGIN_TOP);
    const offset = useSharedValue(0);
    const _offset = useSharedValue(0);


    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: props.offset.value > 1 ? (2 - 1 / Math.pow(props.offset.value, 0.2)) : 1 },
            ]
        };
    });

    // const inputAnimatedStyles = useAnimatedStyle(() => {
    //     return {
    //         top: keyboard.height.value > (insets.bottom - offset.value) ? -(keyboard.height.value - insets.bottom) : HANDLER_HEIGHT
    //     };
    // });

    useEffect(() => {
        setText('');
    }, [props.activePostIndex])

    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname);
    }

    const barStyles = useAnimatedStyle(() => {
        if (keyboard.state.value == KeyboardState.OPENING && offset.value > -(keyboard.height.value - insets.bottom)) {
            offset.value = -(keyboard.height.value - insets.bottom)
            _offset.value = -(keyboard.height.value - insets.bottom)
        }

        return {
            transform: [{
                translateY: offset.value
            }]
        };
    });

    const overlayStyles = useAnimatedStyle(() => {
        return {
            opacity: Math.pow(offset.value / minOffset, 0.3) * 0.8,
            display: offset.value == 0 ? 'none' : 'flex'
        };
    });

    const gesture = Gesture
        .Pan()
        .activeOffsetY([-10, 10])
        .onChange((e) => {
            const newValue = _offset.value + e.changeY;
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
                _offset.value = withSpring(keyboard.state.value == KeyboardState.OPEN || keyboard.state.value == KeyboardState.OPENING ? -keyboard.height.value + insets.bottom : 0, { velocity: event.velocityY, mass: 0.15, overshootClamping: true })
                offset.value = withSpring(keyboard.state.value == KeyboardState.OPEN || keyboard.state.value == KeyboardState.OPENING ? -keyboard.height.value + insets.bottom : 0, { velocity: event.velocityY, mass: 0.15, overshootClamping: true })
                return;
            }

            _offset.value = withSpring(minOffset, { velocity: event.velocityY, mass: 0.15 });
            offset.value = withSpring(minOffset, { velocity: event.velocityY, mass: 0.15 });
        });

    return (
        <>

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
                    Keyboard.dismiss()
                    offset.value = withSpring(0, { velocity: 5, mass: 0.15 });
                    _offset.value = withSpring(0, { velocity: 5, mass: 0.15 });
                }}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
            </Animated.View>
            <GestureDetector gesture={gesture}>
                <Animated.View style={[{
                    top: constants.height - props.minBarHeight - insets.bottom,
                    height: HEIGHT,
                    position: 'absolute',
                    width: constants.width,
                    backgroundColor: props.mode.tag == 'Comment' ? '#212121' : '#151316',
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: '#2A2829',
                }, barStyles]}>

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
                    <Animated.View
                        style={{
                            // backgroundColor: 'red',
                            flex: 1,
                            flexDirection: 'row',
                            height: props.minBarHeight - HANDLER_HEIGHT,
                            alignItems: 'center',
                            paddingLeft: 20,
                            paddingRight: 20,
                            width: '100%',
                            top: HANDLER_HEIGHT,
                            // backgroundColor: props.mode.tag == 'Comment' ? '#212121' : '#151316',
                            position: 'absolute'
                        }}
                    >
                        {
                            (props.mode.tag == 'Comment' || props.mode.tag == 'App') &&
                            <TouchableOpacity onPress={() => {
                                props.setMode({ tag: 'Normal' });
                            }}>
                                <Animated.View style={animatedStyles} >
                                    <IconX size={28} color='#C2C2C2' style={{
                                        padding: 4,
                                        marginRight: props.mode.tag == 'Comment' ? 16 : 0,
                                    }} />
                                </Animated.View>
                            </TouchableOpacity>
                        }

                        {props.mode.tag != 'App' && <TextInput
                            value={text}
                            onChangeText={setText}
                            placeholder='Add a discussion'
                            placeholderTextColor='#C2C2C2'
                            style={{
                                color: 'white',
                                height: '100%',
                                flex: 1,
                                marginLeft: 0,
                                marginRight: 0,
                            }}
                            returnKeyType='send'
                            keyboardAppearance='dark'
                            onSubmitEditing={() => {
                                offset.value = withSpring(0, { velocity: 5, mass: 0.2 });
                                _offset.value = withSpring(0, { velocity: 5, mass: 0.2 });
                                setText('');
                            }}
                            selectionColor='#EA4D60'
                        />}

                        {/* {props.mode.tag == 'Normal' && <IconSearch size={24} color='#C2C2C2' />} */}

                        {
                            props.mode.tag == 'App' &&
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
                                        getSourceName(props.mode.value)
                                    }
                                </Text>
                            </View>
                        }

                        {
                            props.mode.tag == 'App' &&
                            <TouchableOpacity onPress={() => {
                                Linking.openURL(props.mode.value).catch(error =>
                                    console.warn('An error occurred: ', error),
                                )
                            }}>
                                <View>
                                    {
                                        Platform.OS == 'ios' ? <IconBrandSafari size={28} color='#C2C2C2' stroke={1.8} style={{
                                            padding: 4,
                                        }} /> : <IconArrowUpRightCircle size={28} color='#C2C2C2' stroke={1.8} style={{
                                            padding: 4,
                                        }} />
                                    }

                                </View>
                            </TouchableOpacity>
                        }
                    </Animated.View>

                </Animated.View>
            </GestureDetector>
        </>
    );
}

export default Bar;