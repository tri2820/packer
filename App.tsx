import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { memo, useCallback, useEffect, useState } from 'react';
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



  useEffect(() => {
    // console.log('props.user changed', props.user)
    if (props.user == null) return
    // Cancel account deletion
    (async () => {
      const { error } = await supabaseClient.from('deletions').delete().eq('user_id', props.user.id)
      console.log('debug cancel deletion error, [NORMAL IF NOT REQUEST DELETION BEFORE]', error)
    })()
  }, [props.user])

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
            activePostIndex={props.activePostIndex}
            setActivePostIndex={props.setActivePostIndex}
            height={constants.height - minBarHeight - insets.bottom}
            mode={mode}
            setMode={setMode}
            selectedCommentId={props.selectedCommentId}
            setSelectedCommentId={props.setSelectedCommentId}
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

          <Bar onSubmit={props.onSubmit}
            user={user}
            setUser={setUser}
            activePostIndex={props.activePostIndex}
            minBarHeight={minBarHeight}
            setMode={setMode}
            mode={mode}
            offset={offset}
            selectedCommentId={props.selectedCommentId}
            setSelectedCommentId={props.setSelectedCommentId}
          />
        </Animated.View>
      </GestureDetector>

      <StatusBar style={statusBarColor()} />
    </View>

  )
}
const MemoMain = memo(Main);

const sharedAsyncState: any = {}
const rp = async (sharedAsyncState: any, setData: any) => {
  console.log('debug post get requested');
  const offset = sharedAsyncState['main'] ?? 0;
  sharedAsyncState['main'] = offset + 6;

  const { data, error } = await supabaseClient.rpc('get_posts', { o: offset, n: 5 })
  if (error) {
    console.log('error post', error)
    return;
  }
  if (data.length > 0) setData((posts: any) => posts.concat(data))
}

const rc = async (sharedAsyncState: any, setData: any, post_id: string, parent_id: string | null, count: number) => {
  const key = parent_id ?? post_id;


  const offset = sharedAsyncState[key] ?? 0;
  if (offset >= count) return;
  sharedAsyncState[key] = offset + 6;

  const { data, error } = await supabaseClient.rpc('get_comments', { o: offset, n: 5, postid: post_id, parentid: parent_id })
  if (error) {
    console.log('debug error query comments from post', error)
    return 'error';
  }

  if (data.length > 0) setData((comments: any) => comments.concat(data));
}

const grc = async (sharedAsyncState: any, setData: any, post_id: string, parent_id: string | null, count: number) => {
  const key = `status-${parent_id ?? post_id}`;
  if (sharedAsyncState[key] == 'running') return;
  sharedAsyncState[key] = 'running';
  await rc(sharedAsyncState, setData, post_id, parent_id, count);
  sharedAsyncState[key] = 'done';
}

export default function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [activePostIndex, setActivePostIndex] = useState(0);
  let inited = false;

  const updateComment = (id: string, key: any, value: any) => {
    setComments((comments: any) => {
      const comment = comments.find((c: any) => c.id == id);
      // if (!comment) return comments;
      const others = comments.filter((c: any) => c.id != id);
      comment[key] = typeof value === 'function' ? value(comment[key]) : value;
      const x = [comment, ...others];
      return x;
    })
  }

  const submitComment = async (
    text: string,
    parent_id: string | null,
    post_id: string) => {
    const body = {
      content: text,
      post_id: post_id,
      parent_id: parent_id,
      need_bot_comment: true
    }

    polyfillEncoding()
    polyfillReadableStream()
    polyfillFetch()

    const { data } = await supabaseClient.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      console.log('Access Token is', accessToken)
      return
    }

    const placeholderId = `placeholder-${Math.random()}`;
    const placeholderComment = {
      // Could get from header
      id: placeholderId,
      created_at: new Date(),
      content: text,
      // author_name: user.user_metadata.full_name,
      author_name: 'Default User',
      parent_id: parent_id,
      post_id: post_id,
      blockRequestChildren: true
    }

    const childPlaceholderId = `placeholder-${Math.random()}`;
    const childComment = {
      id: childPlaceholderId,
      created_at: new Date(),
      content: '',
      author_name: 'Packer',
      parent_id: placeholderId,
      post_id: post_id,
      blinking: true,
      blockRequestChildren: true
    }


    setComments((comments) => [placeholderComment, childComment, ...comments])

    const response = await fetch('https://djhuyrpeqcbvqbhfnibz.functions.supabase.co/comment', {
      // @ts-ignore
      reactNative: { textStreaming: true },
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    })

    const newId = response.headers.get("comment_id");
    const childId = response.headers.get("child_id")
    console.log('debug comment_id', newId)
    console.log('debug childId', childId)

    if (!response.body || !response.ok || !childId) {
      console.log('ERROR: response', response)
      return
    }

    updateComment(childPlaceholderId, 'id', childId)
    updateComment(childId, 'parent_id', newId)
    updateComment(placeholderId, 'id', newId)

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
      console.log('update', update);
      updateComment(childId, 'content', (old: string) => old + update);
    });

    updateComment(childId, 'blinking', false)
  }

  const onSubmit = (text: string) => {
    console.log('submitted');
    submitComment(text, selectedCommentId, posts[activePostIndex].id);
    setSelectedCommentId(null);
  }

  const requestComments = async (post_id: string, parent_id: string | null) => {
    const count = parent_id === null ?
      posts.find((p: any) => p.id == post_id).comment_count :
      comments.find((c: any) => c.id == parent_id).comment_count;
    await grc(sharedAsyncState, setComments, post_id, parent_id, count)
  }

  const requestPost = async () => {
    await rp(sharedAsyncState, setPosts)
  }

  useEffect(() => {
    if (inited) return;
    inited = true;
    requestPost();
  }, [])

  useEffect(() => {
    console.log('debug posts.length', posts.length)
  }, [posts])

  useEffect(() => {
    console.log('debug comments.length', comments.length)
  }, [comments])

  return (
    <SafeAreaProvider>
      <MemoMain
        posts={posts}
        requestPost={requestPost}
        requestComments={requestComments}
        comments={comments}
        onSubmit={onSubmit}
        selectedCommentId={selectedCommentId}
        setSelectedCommentId={setSelectedCommentId}
        activePostIndex={activePostIndex}
        setActivePostIndex={setActivePostIndex}
      />
    </SafeAreaProvider>
  );
}


