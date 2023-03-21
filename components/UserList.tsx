import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, StyleSheet, Pressable, SafeAreaView, Text, Image, View, TouchableOpacity, Linking, Platform, ImageBackground, PanResponder } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, normalizedHostname } from '../utils';
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, FadeOutDown, FadeOutUp, KeyboardState, runOnJS, runOnUI, useAnimatedKeyboard, useAnimatedProps, useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useScrollViewOffset, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, TextInput, FlatList } from 'react-native-gesture-handler';
import { signIn } from '../login';
import { supabaseClient, upsertProfile } from '../supabaseClient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import LoginSection from './LoginSection';


function UserList(props: any) {
    const [mode, setMode] = useState<'normal' | 'settings'>('normal')

    const userStyles = useAnimatedStyle(() => {
        return {
            display: props.offset.value == 0 ? 'none' : 'flex',
            opacity: Math.pow(props.offset.value / props.minOffset, 0.3)
        };
    });

    useDerivedValue(() => {
        if (props.offset.value < 0) return
        runOnJS(setMode)('normal')
    })

    return (

        <Animated.View style={[{
            marginHorizontal: 20,
            height: props.listHeight,
            // backgroundColor: 'blue'
        }, userStyles]}
            exiting={FadeOut}
        >
            {mode == 'normal' ?
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                >
                    <View>
                        <View style={{
                            marginTop: 24,
                            flexDirection: 'row',
                            alignItems: 'center',
                            // backgroundColor: 'blue'
                        }}>
                            <Text style={{
                                color: '#F1F1F1',
                                fontSize: 24,
                                fontWeight: '800'
                            }}>
                                {
                                    props.user.user_metadata.full_name
                                }
                            </Text>

                            <TouchableOpacity onPress={() => {
                                setMode('settings')
                            }} style={{
                                marginLeft: 'auto',
                                marginRight: 0,
                                paddingVertical: 3,
                                paddingRight: 3,
                                // Coyote
                                paddingLeft: 12,
                                // backgroundColor: 'green'
                            }} >
                                <FontAwesome name='gear' color='#E6E6E6' size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{
                            color: '#C2C2C2',
                            fontWeight: '300',
                            marginTop: 4
                        }}>
                            {
                                // props.user.user_metadata.email
                                '@default'
                            }
                        </Text>

                        <Text style={{
                            color: '#F1F1F1',
                            marginTop: 20,
                            // backgroundColor: 'red'
                        }}>
                            Just joined Packer to connect with interesting people from all over the world. Looking forward to discovering new perspectives and making new friends!
                        </Text>

                        <Text style={{
                            marginTop: 40,
                            marginBottom: 4,
                            color: '#F1F1F1',
                            fontSize: 24,
                            fontWeight: '800'
                        }}>
                            My Discussions
                        </Text>
                    </View>
                    <Animated.FlatList
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        listKey='userList'
                        style={{
                            marginTop: 8,
                            // paddingTop: 12,
                            // backgroundColor: 'blue',
                        }}
                        data={[0, 1, 2, 3, 4]}
                        // keyExtractor={keyExtractor}
                        renderItem={() =>
                            <View style={{
                                height: 60,
                                width: '100%',
                                // backgroundColor: 'blue',
                                borderRadius: 8,
                                marginVertical: 8,
                                borderStyle: 'dashed',
                                borderWidth: 2,
                                borderColor: '#5D5F64'
                            }}>

                            </View>
                        }
                    />
                </Animated.View> :
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                >
                    <View>
                        <View style={{
                            marginTop: 24,
                            flexDirection: 'row',
                            alignItems: 'center',
                            // backgroundColor: 'blue'
                        }}>
                            <Text style={{
                                color: '#F1F1F1',
                                fontSize: 24,
                                fontWeight: '800'
                            }}>
                                Settings
                            </Text>

                            <TouchableOpacity onPress={() => {
                                setMode('normal')
                            }} style={{
                                marginLeft: 'auto',
                                marginRight: 0,
                                paddingVertical: 0,
                                paddingRight: 3,
                                // Coyote
                                paddingLeft: 12,
                                // backgroundColor: 'green'
                            }} >
                                {/* <FontAwesome name='close' color='#E6E6E6' size={24} /> */}
                                <Ionicons name="close" size={28} color='#C2C2C2' />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => {
                            // setMode('normal')
                        }} style={{
                            marginTop: 30,
                            paddingVertical: 10,
                            borderRadius: 8,
                            backgroundColor: '#323032',
                            alignItems: 'center'
                        }} >
                            {/* <FontAwesome name='close' color='#E6E6E6' size={24} /> */}
                            <Text style={{
                                color: '#ed4339',
                                fontSize: 18
                            }}>Sign Out</Text>
                        </TouchableOpacity>

                        <View
                            style={{
                                marginVertical: 20,
                                borderBottomColor: '#323032',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                        />

                        <TouchableOpacity onPress={() => {
                            // setMode('normal')
                        }} style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            backgroundColor: '#323032',
                            alignItems: 'center'
                        }} >
                            {/* <FontAwesome name='close' color='#E6E6E6' size={24} /> */}
                            <Text style={{
                                color: '#ed4339',
                                fontSize: 18
                            }}>Request account deletion</Text>
                        </TouchableOpacity>

                        <Text style={{
                            color: '#929196',
                            marginTop: 20,
                            // backgroundColor: 'red',
                            textAlign: 'center'
                        }}>
                            Please note that it may take up to 14 days for us to process your request. During this time, your account will remain active. If you change your mind, you can cancel the request by logging in to your account. Thank you for your understanding.
                        </Text>
                    </View>
                </Animated.View>
            }
        </Animated.View>

    );
}

export default UserList;
