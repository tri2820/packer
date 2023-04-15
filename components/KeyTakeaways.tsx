import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInUp, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../utils';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import Comment from './Comment';
import * as Haptics from 'expo-haptics';


function KeyTakeaways(props: any) {
    const [showKeyTakeaways, setShowKeyTakeaways] = useState(true);
    const [inited, setInited] = useState(false);

    useEffect(() => {
        if (!inited) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }, [showKeyTakeaways])

    useEffect(() => {
        setInited(true);
    }, [])


    if (props.content == '') return <></>;

    return <Pressable onPress={() => {
        setShowKeyTakeaways(!showKeyTakeaways);
    }}>
        <View style={{
            backgroundColor: '#323032',
            paddingVertical: showKeyTakeaways ? 8 : 8,
            paddingHorizontal: showKeyTakeaways ? 8 : 8,
            borderRadius: 8,
            marginTop: 4,
            marginBottom: 16,
        }}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <View style={{
                    // backgroundColor: '#F2C740',
                    borderRadius: 4,
                    padding: 2,
                    marginRight: 8,
                }}>
                    <FontAwesome5 name='pen' size={16} color="#FFC542" />
                </View>

                <Text style={{
                    color: '#E6E6E6',
                    fontWeight: 'bold',
                }}>In short</Text>
            </View>

            {
                showKeyTakeaways &&
                <Animated.Text style={{
                    color: '#E6E6E6',
                    marginTop: 8
                }}
                    entering={inited ? FadeInUp : undefined}
                >
                    {props.content}
                </Animated.Text>
            }

        </View>
    </Pressable>

}

export default KeyTakeaways;