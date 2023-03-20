import * as React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutLeft, FadeOutUp, Layout, SequencedTransition, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { State, INIT_DATE, supabaseClient, requestCommentsCount, unitC, C } from '../supabaseClient';
import { MarkdownRule, MarkdownRules, MarkdownStyles, MarkdownView } from 'react-native-markdown-view'
import moment from 'moment';
import { MemoComment } from './Comment';


function CommentChildren(props: any) {
    return (
        <>
            {
                props.comments?.map((c: any, i: number) => <View
                    key={c.id}
                    style={{
                        paddingLeft: props.level > 0 ? 20 : 0
                    }}
                >
                    <MemoComment
                        comment={c}
                        level={props.level + 1}
                        startLoading={props.startLoading}
                        setMode={props.setMode}
                    />
                </View>)
            }

            {
                props.comments.length < props.count && !props.requestingComments && props.mode == 'Normal' &&
                <TouchableOpacity style={{
                    backgroundColor: '#2C2C2C',
                    marginTop: 4,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 4
                }}
                    onPress={() => { props.requestComments() }}
                >
                    <Text style={{
                        color: '#e6e6e6',
                        fontWeight: '500'
                    }}>
                        Load {props.count - props.comments.length} more
                    </Text>
                </TouchableOpacity>
            }



        </>
    );
}

export default CommentChildren;
export const MemoCommentChildren = memo(CommentChildren);