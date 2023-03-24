import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, ZoomIn, ZoomInEasyUp, ZoomInLeft, ZoomInRight, ZoomOutLeft } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import Bar from './components/Bar';
import Wall from './components/Wall';
import { constants, loadingView, Mode } from './utils';
import React from 'react';
import * as Haptics from 'expo-haptics';
import { INIT_DATE, supabaseClient } from './supabaseClient';
const INJECTED_JAVASCRIPT = `(function() {
  window.ReactNativeWebView.postMessage(JSON.stringify(
    window.getComputedStyle( document.documentElement ,null).getPropertyValue('background-color')
    ));
})();`;



function Main(props: any) {
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<Mode>({ tag: 'Normal' });
  const [activePostIndex, setActivePostIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const userResponse = await supabaseClient.auth.getUser();
      // console.log('Load user', userResponse.data.user)
      setUser(userResponse.data.user)
    })()
  }, [])


  const insets = useSafeAreaInsets();
  const minBarHeight = 60;

  useEffect(() => {
    if (mode.tag == 'Normal') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }, [mode.tag])


  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }, [user])

  const onMessage = (event: WebViewMessageEvent) => {
    if (mode.tag != 'App') return;
    setMode({
      tag: 'App',
      value: mode.value,
      insetsColor: JSON.parse(event.nativeEvent.data)
    })
  }

  const statusBarColor = () => {
    if (mode.tag != 'App') {
      return 'light'
    }
    const [r, g, b, a] = mode.insetsColor.slice(mode.insetsColor[3] == 'a' ? 6 : 5, -1).split(',').map(s => parseInt(s));
    if (r == 0 && g == 0 && b == 0) {
      return 'dark'
    }
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    if (luma < 40) {
      return 'light'
    }
    return 'dark'
  }

  const offset = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value },
      ]
    };
  });
  const gesture = Gesture
    .Pan()
    .enabled(mode.tag === 'Comment' || mode.tag === 'App')
    .onChange((e) => {

      if (e.changeX < 0) {
        const o = offset.value + e.changeX;
        if (o < 0) return;
        offset.value = o;
        return;
      }

      offset.value += offset.value < 5 ? e.changeX : e.changeX / (offset.value / 5);

    })
    .onEnd((event, success) => {
      offset.value = withSpring(0, { velocity: event.velocityX, damping: 5, mass: 0.1 });
      if (offset.value < 30) return;
      runOnJS(setMode)({ tag: 'Normal' })
    });

  console.log('debug main get rendered')
  return (
    <View style={{
      height: constants.height,
      width: constants.width,
      backgroundColor: 'black'
    }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyles}>
          <Wall
            requestComments={props.requestComments}
            comments={props.comments}
            requestPost={props.requestPost}
            posts={props.posts}
            activePostIndex={activePostIndex}
            setActivePostIndex={setActivePostIndex}
            height={constants.height - minBarHeight - insets.bottom}
            mode={mode}
            setMode={setMode}
          />
          {
            mode.tag === 'App' && <Animated.View style={{
              position: 'absolute',
              backgroundColor: 'white',
              height: constants.height - insets.bottom - minBarHeight,
              width: constants.width,
            }}
              entering={FadeIn.duration(100)}
              exiting={FadeOut.duration(100)}
            >
              <WebView
                containerStyle={{
                  paddingTop: insets.top,
                  backgroundColor: mode.insetsColor
                }}
                decelerationRate='normal'
                source={{ uri: mode.value }}
                onNavigationStateChange={(navState) => {
                  setMode({
                    tag: mode.tag,
                    value: navState.url,
                    insetsColor: mode.insetsColor
                  });
                }}
                mediaPlaybackRequiresUserAction={true}
                allowsInlineMediaPlayback={true}
                onMessage={onMessage}
                injectedJavaScript={INJECTED_JAVASCRIPT}
                autoManageStatusBarEnabled={false}
              />
            </Animated.View>
          }

          <Bar onSubmit={() => {

          }}
            user={user}
            setUser={setUser}
            activePostIndex={activePostIndex}
            minBarHeight={minBarHeight}
            setMode={setMode}
            mode={mode}
            offset={offset}
          />
        </Animated.View>
      </GestureDetector>

      <StatusBar style={statusBarColor()} />
    </View>

  )
}
const MemoMain = memo(Main);


export default function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [offsets, setOffsets] = useState<any>({});
  const [_, setRequestStatuses] = useState<any>({});

  const _requestComments = async (post_id: string, parent_id: string | null) => {
    const key = parent_id ?? post_id;
    const count = parent_id === null ?
      posts.find(p => p.id == post_id).comment_count :
      comments.find(p => p.id == parent_id).comment_count;

    const offset = offsets[key] ?? 0;
    if (offset >= count) return;

    setOffsets((offsets: any) => {
      return {
        ...offsets,
        [key]: offset + 6
      }
    })

    const { data, error } = await supabaseClient.rpc('get_comments', { o: offset, n: 5, postid: post_id, parentid: parent_id })
    if (error) {
      console.log('debug error query comments from post', error)
      return 'error';
    }

    if (data.length > 0) setComments((comments) => comments.concat(data));
  }

  const requestComments = async (post_id: string, parent_id: string | null) => {
    const key = parent_id ?? post_id;
    setRequestStatuses((s: any) => {
      if (s[key] == 'running') {
        console.log('reject request comments from', post_id, parent_id);
        return s;
      }
      return {
        ...s,
        [key]: 'running'
      }
    })

    await _requestComments(post_id, parent_id);

    setRequestStatuses((s: any) => {
      return { ...s, [key]: 'done' }
    })
  }


  const requestPost = async () => {
    console.log('debug post get requested');
    const offset = offsets['main'] ?? 0;
    setOffsets((offsets: any) => {
      return {
        ...offsets,
        'main': offset + 6
      }
    })

    const { data, error } = await supabaseClient.rpc('get_posts', { o: offset, n: 5 })
    if (error) {
      console.log('error post', error)
      return;
    }
    if (data.length > 0) setPosts(posts => posts.concat(data))
  }

  useEffect(() => {
    requestPost();
  }, [])

  useEffect(() => {
    console.log('debug posts.length', posts.length)
  }, [posts])

  useEffect(() => {
    console.log('debug comments.length', comments.length)
  }, [comments])

  useEffect(() => {
    console.log('debug requestPost', requestPost)
  }, [requestPost])

  return (
    <SafeAreaProvider>
      <MemoMain
        posts={posts}
        requestPost={requestPost}
        requestComments={requestComments}
        comments={comments}
      />
    </SafeAreaProvider>
  );
}


