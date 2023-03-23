import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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
// @ts-ignore
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
// @ts-ignore
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
// @ts-ignore
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';



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
  const [selectedCommentId, setSelectedCommentId] = useState<any>('');

  useEffect(() => {
    (async () => {
      const userResponse = await supabaseClient.auth.getUser();
      console.log('Load user', userResponse.data.user)
      setUser(userResponse.data.user)
    })()
  }, [])

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
    const body = {
      content: comment.text,
      post_id: post_id,
      parent_id: null,
      need_bot_comment: true
    }


    const responseData = {
      // Could get from header
      id: "recent-comment-id",
      created_at: new Date(),
      content: comment.text,
      // author_name: user.user_metadata.full_name,
      author_name: 'Default User',
      parent_id: null,
      post_id: post_id,
      child: {
        content: '',
        finished: false
      }
    }

    setRecentComment(responseData);

    polyfillEncoding()
    polyfillReadableStream()
    polyfillFetch()

    const { data } = await supabaseClient.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      console.log('Access Token is', accessToken)
      return
    }

    const response = await fetch('https://djhuyrpeqcbvqbhfnibz.functions.supabase.co/add_comment', {
      // @ts-ignore
      reactNative: { textStreaming: true },
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // 'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })


    if (!response.body || !response.ok) {
      console.log('ERROR: response', response)
      return
    }


    const utf8Decoder = new TextDecoder('utf-8')

    const decodeResponse = (response?: Uint8Array) => {
      if (!response) {
        return ''
      }

      const pattern = /"delta":\s*({.*?"content":\s*".*?"})/g
      const decodedText = utf8Decoder.decode(response)
      const matches: string[] = []

      let match
      while ((match = pattern.exec(decodedText)) !== null) {
        matches.push(JSON.parse(match[1]).content)
      }
      return matches.join('')
    }

    async function read(reader: ReadableStreamDefaultReader<Uint8Array>, partialUpdate: (update: string) => Promise<void>) {
      const { value, done } = await reader.read()
      if (done) return
      const delta = decodeResponse(value)
      partialUpdate(delta);
      await read(reader, partialUpdate)
    }

    const reader = response.body.getReader()
    await read(reader, async (update) => {
      setRecentComment((recentComment: any) => {
        console.log(update);
        const r = { ...recentComment }
        r.child.content = r.child.content.concat(update).trimStart();
        return r
      })
    });

    setRecentComment((recentComment: any) => {
      const r = { ...recentComment }
      r.child.finished = true;
      console.log('debug DONE r', r)
      return r
    })
  }

  return (
    <View style={{
      height: constants.height,
      width: constants.width,
      backgroundColor: 'black'
    }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyles}>
          <Wall selectedCommentId={selectedCommentId} setSelectedCommentId={setSelectedCommentId} recentComment={recentComment} requestPost={props.requestPost} posts={props.posts} activePostIndex={activePostIndex} setActivePostIndex={setActivePostIndex} height={constants.height - minBarHeight - insets.bottom} mode={mode} setMode={setMode} />

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

          <Bar selectedCommentId={selectedCommentId} setSelectedCommentId={setSelectedCommentId} submitComment={submitComment} user={user} setUser={setUser} activePostIndex={activePostIndex} minBarHeight={minBarHeight} setMode={setMode} mode={mode} offset={offset} />
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


