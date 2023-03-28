import * as React from 'react';
import { useContext, useRef, useState } from 'react';
import { Dimensions, Platform, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { useDerivedValue } from 'react-native-reanimated';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, MainContext, normalizedHostname, randomColor } from '../utils';
import Post, { MemoPost } from './Post';

const androidPagingFallback = Platform.OS == 'android' && {
    pagingEnabled: true,
    decelerationRate: 0
}
const theEmptyList: any[] = [];

function Wall(props: any) {
    const { mode, posts, requestPost, comments, setMode, setSelectedCommentId, requestComments } = useContext(MainContext);
    const _setMode = React.useCallback(setMode, []);
    const _setSelectedCommentId = React.useCallback(setSelectedCommentId, []);
    const _requestComments = React.useCallback(requestComments, []);

    const getItemLayout = (data: any, index: number) => ({ length: props.height, offset: props.height * index, index })
    const renderItem = ({ index, item }: any) => {
        const scrolledOn = props.activePostIndex == index;
        const shouldActive = props.activePostIndex == index || props.activePostIndex + 1 == index;
        const cs = scrolledOn ? comments.filter((c: any) => c.post_id == item.id) : theEmptyList;
        return <MemoPost
            mode={mode}
            height={props.height}
            post={shouldActive ? item : null}
            shouldActive={shouldActive}
            scrolledOn={scrolledOn}
            comments={cs}
            setSelectedCommentId={_setSelectedCommentId}
            requestComments={_requestComments}
            setMode={_setMode}
        />
    }

    const keyExtractor = (item: any) => item.id
    const onEndReached = () => {
        console.log('wall on end reached')
        requestPost()
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
            scrollEnabled={mode.tag == 'Normal'}
            // Only works on IOS
            pagingEnabled={true}
            {...androidPagingFallback}
            disableIntervalMomentum
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReachedThreshold={2}
            onEndReached={onEndReached}
            getItemLayout={getItemLayout}
            onScroll={onScroll}
            removeClippedSubviews
            windowSize={3}
        />
    );
}

export default Wall;