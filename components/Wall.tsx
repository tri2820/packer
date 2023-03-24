import * as React from 'react';
import { useRef, useState } from 'react';
import { Dimensions, Platform, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { useDerivedValue } from 'react-native-reanimated';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, normalizedHostname, randomColor } from '../utils';
import Post, { MemoPost } from './Post';

const androidPagingFallback = Platform.OS == 'android' && {
    pagingEnabled: true,
    decelerationRate: 0
}

function Wall(props: any) {
    const getItemLayout = (data: any, index: number) => ({ length: props.height, offset: props.height * index, index })
    const renderItem = ({ index, item }: any) => {
        return <MemoPost
            requestComments={props.requestComments}
            comments={props.comments}
            height={props.height}
            post={item}
            shouldActive={props.activePostIndex == index}
            index={index}
            mode={props.mode}
            setMode={props.setMode}
        />
    }

    const keyExtractor = (item: any) => item.id
    const onEndReached = () => {
        console.log('wall on end reached')
        props.requestPost()
    }
    const onScroll = (event: any) => {
        let offset = event.nativeEvent.contentOffset.y;
        if (offset < props.height / 2) {
            props.setActivePostIndex(0)
            return;
        }
        offset -= props.height / 2;
        props.setActivePostIndex(Math.floor(offset / props.height) + 1);
    }

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            style={{
                width: constants.width,
                height: props.height
            }}
            scrollEnabled={props.mode.tag == 'Normal'}
            // Only works on IOS
            pagingEnabled={true}
            {...androidPagingFallback}
            disableIntervalMomentum
            data={props.posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReachedThreshold={2}
            onEndReached={onEndReached}
            getItemLayout={getItemLayout}
            onScroll={onScroll}
            // removeClippedSubviews
            windowSize={7}
        />
    );
}

export default Wall;