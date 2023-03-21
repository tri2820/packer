import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, StyleSheet, Pressable, SafeAreaView, Text, Image, View, TouchableOpacity, Linking, Platform, ImageBackground } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, normalizedHostname } from '../utils';
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, FadeOutDown, FadeOutUp, KeyboardState, useAnimatedKeyboard, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, TextInput } from 'react-native-gesture-handler';
import { signIn } from '../auth';
import { supabaseClient, upsertProfile } from '../supabaseClient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';


function SignInSection(props: any) {
    const signInAndUpdateProfile = async (provider: 'apple' | 'google') => {
        const user = await signIn(provider);
        if (!user) return;

        console.log('debug user', JSON.stringify(user));
        props.setUser(user);

        // // Round trip
        // await upsertProfile(user);
        // await syncProfile();
    }

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: Math.pow(props.offset.value / props.minOffset, 0.3)
        };
    });


    return (
        <Animated.View
            style={[animatedStyles,
                {
                    position: 'absolute',
                    width: constants.width,
                }]}
            exiting={FadeOut}
        >
            <ImageBackground style={{
                position: 'absolute',
                width: '100%',
                height: 600,
            }}
                source={require('../assets/loginBackground.jpg')}
            >
                <LinearGradient colors={['transparent', props.mode.tag == 'Comment' ? '#212121' : '#151316']} style={{
                    width: '100%',
                    height: '100%'
                }}
                    pointerEvents='none'
                />
            </ImageBackground>


            <Image
                style={{
                    marginTop: 100,
                    width: 60,
                    height: 60,
                    borderRadius: 4,
                    alignSelf: 'center'
                }}
                source={require('../assets/icon.png')}
            />

            <Text style={{
                marginTop: 24,
                color: 'white',
                fontSize: 30,
                fontWeight: '700',
                alignSelf: 'center',
                textAlign: 'center'
            }}>Explore the Internet. Together with Packer.</Text>

            <View style={{
                marginTop: 32,
                marginLeft: 'auto',
                marginRight: 'auto',
                shadowColor: 'black',
                shadowOpacity: 0.8,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 3,
            }}>
                <Ionicons.Button name='logo-apple' style={{
                    backgroundColor: "black",
                    paddingVertical: 10,
                    paddingHorizontal: 32,
                }} onPress={() => {
                    signInAndUpdateProfile('apple')
                }}>
                    Sign in with Apple
                </Ionicons.Button>
            </View>
        </Animated.View>
    );
}

export default SignInSection;
