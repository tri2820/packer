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
import * as Haptics from 'expo-haptics';


function SignInSection(props: any) {
    const insets = useSafeAreaInsets();
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
                    height: '100%',
                    // backgroundColor: 'blue'
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
                    // left: 'auto',
                    // right: 'auto',
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
            }}>Explore digital worlds.</Text>

            <Text style={{
                color: 'white',
                fontSize: 30,
                fontWeight: '700',
                alignSelf: 'center',
                textAlign: 'center'
            }}>Together with Packer.</Text>

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
                    backgroundColor: "white",
                    paddingTop: 12,
                    paddingBottom: 10,
                    paddingHorizontal: 32,
                    // alignItems: 'flex-end'
                }}
                    iconStyle={{
                        // backgroundColor: 'red',
                        marginRight: 8,
                        marginBottom: 4.5,
                        // marginVertical: 4
                    }}
                    color='black'
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        signInAndUpdateProfile('apple')
                    }}>
                    <Text style={{
                        fontWeight: '600',
                        fontSize: 18,
                        // paddingTop: 2,
                        // backgroundColor: 'blue'
                    }}>
                        Sign in with Apple
                    </Text>
                    {/* Sign in with Apple */}
                </Ionicons.Button>
            </View>

            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: insets.bottom + props.INSETS_OFFSET_BOTTOM + 40,
                // marginTop: 140,
                alignItems: 'center',
                // justifyContent: 'center',
                // flexDirection: 'row'
            }}>
                <TouchableOpacity onPress={() => {
                    Linking.openURL('https://github.com/tri2820/packer-policies/blob/main/privacy_policy.md')
                }}>
                    <Text style={{
                        color: '#f1f1f1',
                        fontWeight: '300'
                    }}>Privacy Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    Linking.openURL('https://github.com/tri2820/packer-policies/blob/main/terms_and_conditions.md')
                }}>
                    <Text style={{
                        // marginLeft: 16,
                        marginTop: 4,
                        color: '#f1f1f1',
                        fontWeight: '300'
                    }}>Terms & Conditions</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

export default SignInSection;
