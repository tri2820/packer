import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, StyleSheet, Pressable, SafeAreaView, Text, Image, View, TouchableOpacity, Linking, Platform, ImageBackground, PanResponder } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, normalizedHostname } from '../utils';
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, FadeOutDown, FadeOutUp, KeyboardState, runOnJS, runOnUI, useAnimatedKeyboard, useAnimatedProps, useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useScrollViewOffset, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, TextInput, FlatList } from 'react-native-gesture-handler';
import { signIn } from '../login';
import { supabaseClient, upsertProfile } from '../supabaseClient';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import LoginSection from './LoginSection';


function UserList(props: any) {


    const userStyles = useAnimatedStyle(() => {
        return {
            display: props.offset.value == 0 ? 'none' : 'flex',
            opacity: Math.pow(props.offset.value / props.minOffset, 0.3)
        };
    });

    return (

        <Animated.View style={[{
            marginHorizontal: 20,
            height: props.listHeight,
            // backgroundColor: 'blue'
        }, userStyles]}
            exiting={FadeOut}
        >
            <View>
                <Text style={{
                    marginTop: 24,
                    color: '#F1F1F1',
                    fontSize: 24,
                    fontWeight: '800'
                }}>
                    {
                        props.user.user_metadata.full_name
                    }
                </Text>

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
                    marginTop: 20
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
        </Animated.View>

    );
}

export default UserList;
