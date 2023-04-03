import * as React from 'react';
import { Platform, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { constants, randomColor } from '../utils';
import { MemoPost } from './Post';

const theEmptyList: any[] = [];
const theEmptyMode = {
    tag: 'Normal'
};

function Wall(props: any) {
    const _setMode = React.useCallback(props.setMode, []);
    const _setSelectedComment = React.useCallback(props.setSelectedComment, []);
    const _requestComments = React.useCallback(props.requestComments, []);

    const getItemLayout = (data: any, index: number) => ({ length: props.height, offset: props.height * index, index })
    const renderItem = ({ index, item }: any) => {
        const scrolledOn = props.activePostIndex == index;
        const shouldActive = props.activePostIndex == index || props.activePostIndex + 1 == index;
        const cs = scrolledOn ? props.comments.filter((c: any) => c.post_id == item.id) : theEmptyList;
        return <MemoPost
            mode={scrolledOn ? props.mode : theEmptyMode}
            height={props.height}
            post={shouldActive ? item : null}
            shouldActive={shouldActive}
            scrolledOn={scrolledOn}
            comments={cs}
            setSelectedComment={_setSelectedComment}
            requestComments={_requestComments}
            setMode={_setMode}
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
        <Animated.FlatList
            showsVerticalScrollIndicator={false}
            style={{
                width: constants.width,
                height: props.height
            }}
            scrollEnabled={props.mode.tag == 'Normal'}
            // Only works on IOS
            pagingEnabled={true}
            data={props.posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReachedThreshold={2}
            onEndReached={onEndReached}
            getItemLayout={getItemLayout}
            onScroll={onScroll}
            // DO NOT USE removeClippedSubviews: Making title not clickable
            // removeClippedSubviews
            windowSize={7}
        />
    );
}

export default Wall;