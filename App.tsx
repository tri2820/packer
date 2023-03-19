import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, ZoomIn, ZoomInEasyUp, ZoomInLeft, ZoomInRight, ZoomOutLeft } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import Bar from './components/Bar';
import Wall from './components/Wall';
import { constants, Mode } from './utils';
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
  const [recentComment, setRecentComment] = useState<any>(null);

  // const [webviewBackgroundColor, setWebviewBackgroundColor] = useState('transparent');
  const insets = useSafeAreaInsets();
  const minBarHeight = 60;

  useEffect(() => {
    console.log('debug activePostIndex', activePostIndex)
  }, [activePostIndex])

  useEffect(() => {
    if (mode.tag == 'Normal') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }, [mode.tag])

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
    // return;
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

  // useEffect(() => {
  //   console.log('debug recentComments', recentComments)
  // }, [recentComments])

  const submitComment = async (comment: any) => {
    const post_id = props.posts[activePostIndex].id;

    console.log("debug text", comment.text)
    const data = {
      content: comment.text,
      post_id: post_id,
      parent_id: null,
      need_bot_comment: false
    }
    // console.log(data)

    const responseData = {
      comment: {
        id: "6fa61e63-b7e3-4cf5-844f-0f8e6eb5fc02",
        created_at: "2023-03-19T20:11:24.073577+00:00",
        content: "How does Twitter as an ‘infomediary’ influence on bank’s reputation and how are banks’ reputation defined and (re)measured through digital platforms?",
        author_name: "Anon",
        parent_id: null,
        // post_id: "89a3a11c-0191-54e9-a350-27837bae863e"
        post_id: post_id
      }
    }

    setRecentComment(responseData);

    // const { data, error } = 
    // await supabaseClient.functions.invoke('add_comment')
    // if (error) {
    //   console.log('there is an error while querying bookings', error)
    //   return null;
    // }
    // console.log(`bookings: ${data.length} items, example:`, data[0]);
    return {

    };

  }

  return (
    <View style={{
      height: constants.height,
      width: constants.width,
      backgroundColor: 'black'
    }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyles}>
          <Wall recentComment={recentComment} requestPost={props.requestPost} posts={props.posts} activePostIndex={activePostIndex} setActivePostIndex={setActivePostIndex} height={constants.height - minBarHeight - insets.bottom} mode={mode} setMode={setMode} />

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

          <Bar submitComment={submitComment} user={user} setUser={setUser} activePostIndex={activePostIndex} minBarHeight={minBarHeight} setMode={setMode} mode={mode} offset={offset} />
        </Animated.View>
      </GestureDetector>

      <StatusBar style={statusBarColor()} />
    </View>

  )
}

const PAGE = 7
export default function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [range, setRange] = useState(0);

  const requestPost = async () => {
    console.log('debug requesting posts from app');
    const { data, error } = await supabaseClient
      .from('posts')
      .select()
      .lt('created_at', INIT_DATE)
      .order('created_at', { ascending: false })
      .range(range, range + PAGE - 1);
    if (error) return;
    setPosts(posts.concat(data));
    setRange(range + PAGE);
  }

  useEffect(() => {
    requestPost();
  }, [])

  return (
    <SafeAreaProvider>
      <Main posts={posts} requestPost={requestPost} />
    </SafeAreaProvider>
  );
}


