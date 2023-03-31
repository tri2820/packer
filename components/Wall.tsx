import * as React from 'react';
import { Platform } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import { constants } from '../utils';
import { MemoPost } from './Post';

const androidPagingFallback = Platform.OS == 'android' && {
    pagingEnabled: true,
    decelerationRate: 0
}
const theEmptyList: any[] = [];
const theEmptyMode = {
    tag: 'Normal'
};

function Wall(props: any) {
    const { mode, posts, requestPost, comments, setMode, setSelectedComment, requestComments } = props;
    const _setMode = React.useCallback(setMode, []);
    const _setSelectedComment = React.useCallback(setSelectedComment, []);
    const _requestComments = React.useCallback(requestComments, []);

    const getItemLayout = (data: any, index: number) => ({ length: props.height, offset: props.height * index, index })
    const renderItem = ({ index, item }: any) => {
        const scrolledOn = props.activePostIndex == index;
        const shouldActive = props.activePostIndex == index || props.activePostIndex + 1 == index;
        const cs = scrolledOn ? comments.filter((c: any) => c.post_id == item.id) : theEmptyList;
        return <MemoPost
            mode={scrolledOn ? mode : theEmptyMode}
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
            // DO NOT USE removeClippedSubviews: Making title not clickable
            // removeClippedSubviews
            windowSize={7}
        />
    );
}

export default Wall;