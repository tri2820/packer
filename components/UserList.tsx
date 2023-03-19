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
    const insets = useSafeAreaInsets();
    const MARGIN_TOP = insets.top + 200;
    const INSETS_OFFSET_BOTTOM = 200;
    const HANDLER_HEIGHT = 14;
    const HEIGHT = constants.height - MARGIN_TOP + INSETS_OFFSET_BOTTOM;
    const minOffset = -(constants.height - insets.top - insets.bottom - MARGIN_TOP);
    // const offset = useSharedValue(-600);

    const userStyles = useAnimatedStyle(() => {
        return {
            display: props.offset.value == 0 ? 'none' : 'flex',
            opacity: Math.pow(props.offset.value / minOffset, 0.3)
        };
    });

    return (

        <Animated.View style={[{
            marginHorizontal: 20
        }, userStyles]}
            exiting={FadeOut}

        >
            <Animated.FlatList
                horizontal={false}
                showsVerticalScrollIndicator={false}
                listKey='userList'
                style={{
                    marginTop: 24,
                    // paddingTop: 12,
                    // backgroundColor: 'blue',
                    height: HEIGHT - 24 - HANDLER_HEIGHT - INSETS_OFFSET_BOTTOM - insets.bottom
                }}
                data={[0, 1]}
                // keyExtractor={keyExtractor}
                renderItem={() =>
                    <View style={{
                        height: constants.height / 3,
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

                ListHeaderComponent={

                    <View>

                        <Text style={{
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
                            Discussions
                        </Text>
                    </View>
                }
            />
        </Animated.View>

    );
}

export default UserList;
