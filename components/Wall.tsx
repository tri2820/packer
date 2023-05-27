import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { constants, randomColor, scaledown, sharedAsyncState } from '../utils';
import Post, { MemoPost } from './Post';
import { supabaseClient } from '../supabaseClient';
import { MemoSmallPost } from './SmallPost';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const theEmptyList: any[] = [];
const theEmptyMode = 'normal';
const theEmptyFunction = () => { };

const analytics = async (user_id: any, post_id: any) => {
    if (__DEV__) return;
    console.log('debug send analytics', user_id, post_id);
    const { data, error } = await supabaseClient.from('history').insert({
        user_id,
        post_id
    });
    console.log('debug data', data);
    if (error) {
        console.warn('Error Analytics', error);
        return;
    }
}
import { useHeaderHeight } from '@react-navigation/elements';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

function Wall(props: any) {
    const headerHeight = useHeaderHeight();
    const bottomHeight = useBottomTabBarHeight();
    const [viewableMap, setViewableMap] = useState<any>({})
    // const [scrolling, setScrolling] = useState<boolean>(false)
    // console.log('debug props', props.posts)

    // const getItemLayout = (data: any, index: number) => ({ length: props.height, offset: props.height * index, index })
    const renderItem = ({ index, item }: any) => {

        // console.log('debug ', viewableMap)
        const scrolledOn = viewableMap[item.id]
        // props.activePostIndex == index;
        const shouldActive = true;
        // props.activePostIndex == index || props.activePostIndex + 1 == index;
        // console.log('debug wall user', props.user, scrolledOn, sharedAsyncState[`addHistoryRequested/${props.user.id}/${item.id}`]);
        // if (scrolledOn && props.user && !sharedAsyncState[`addHistoryRequested/${props.user.id}/${item.id}`]) {
        //     sharedAsyncState[`addHistoryRequested/${props.user.id}/${item.id}`] = true;
        //     console.log('analyticsss')
        //     analytics(props.user.id, item.id);
        // }
        // console.log('debug render index', index);
        return <MemoSmallPost
            navProps={props.navProps}
            offsetZoomStyles={props.offsetZoomStyles}
            key={item.id}
            index={index}
            mode={scrolledOn ? props.mode : 'normal'}
            height={props.height}
            post={item}
            shouldActive={true}
            scrolledOn={scrolledOn ? true : false}
            setSelectedComment={props.setSelectedComment}
            setMode={props.setMode}
            user={props.user}
            isSinglePost={false}
        // scrolling={scrolling}
        />
        // <MemoPost
        //     offsetZoomStyles={props.offsetZoomStyles}
        //     key={item.id}
        //     index={index}
        //     mode={scrolledOn ? props.mode : 'normal'}
        //     height={props.height}
        //     post={item}
        //     shouldActive={shouldActive}
        //     scrolledOn={scrolledOn}
        //     setSelectedComment={props.setSelectedComment}
        //     setMode={props.setMode}
        //     user={props.user}
        // />
    }

    const keyExtractor = (item: any) => item.id
    const onScroll = (event: any) => {
        let offset = event.nativeEvent.contentOffset.y;
        if (offset < props.height / 2) {
            props.setActivePostIndex(0)
            return;
        }
        offset -= props.height / 2;
        props.setActivePostIndex(Math.floor(offset / props.height) + 1);
    }

    const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        // Do something with the visible items
        // console.log('debug ', viewableItems)
        const idObj = viewableItems.reduce((acc: any, item: any) => {
            acc[item.item.id] = true;
            return acc;
        }, {});
        // console.log('debug idObj', idObj)

        setViewableMap(idObj)
    }, []);


    const separator = () => <View style={styles.hair} />

    return (

        <View style={{
            backgroundColor: '#151316'
        }}>
            <Animated.FlatList
                contentOffset={{ x: 0, y: -headerHeight }}

                // onScrollBeginDrag={() => {
                //     console.log('debug true')
                //     setScrolling(true)
                // }}
                // onMomentumScrollEnd={() => {
                //     console.log('debug false')
                //     setScrolling(false)
                // }}
                scrollsToTop={false}
                ref={props.wallref}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                contentInset={{
                    top: headerHeight,
                    bottom: bottomHeight
                }}
                // windowSize={2}
                initialNumToRender={6}
                // maxToRenderPerBatch={2}
                // updateCellsBatchingPeriod={500}
                showsVerticalScrollIndicator={false}
                scrollEnabled={props.mode == 'normal'}
                // Only works on IOS
                // pagingEnabled={true}
                data={props.posts}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onEndReachedThreshold={2}
                onEndReached={props.requestPost}
                ItemSeparatorComponent={separator}
                // getItemLayout={getItemLayout}
                // onScroll={onScroll}
                // scrollEventThrottle={6}
                // DO NOT USE removeClippedSubviews: Making title not clickable
                // removeClippedSubviews
                windowSize={10}
            />
        </View>
    );
}

export default Wall;

const styles = StyleSheet.create({
    gradient: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        height: 128
    },
    hair: {
        borderTopColor: '#3C3D3F',
        borderTopWidth: StyleSheet.hairlineWidth,
        // marginBottom: 16,
        // marginTop: 16
        // StyleSheet.hairlineWidth
        // ,
        marginHorizontal: 16
    }
});

const gradient = ['transparent', 'rgba(0, 0, 0, 0.9)']