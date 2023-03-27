import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { createContext, memo, useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, ZoomIn, ZoomInEasyUp, ZoomInLeft, ZoomInRight, ZoomOutLeft } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import Bar from './components/Bar';
import Wall from './components/Wall';
import { constants, loadingView, MainContext, Mode, sharedAsyncState } from './utils';
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
  const { mode, setMode } = useContext(MainContext);
  const insets = useSafeAreaInsets();
  const minBarHeight = 60;

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
    const [r, g, b, a] = mode.insetsColor.slice(mode.insetsColor[3] == 'a' ? 6 : 5, -1).split(',').map((s: any) => parseInt(s));
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
            activePostIndex={props.activePostIndex}
            setActivePostIndex={props.setActivePostIndex}
            height={constants.height - minBarHeight - insets.bottom}
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
            user={props.user}
            setUser={props.setUser}
            activePostIndex={props.activePostIndex}
            minBarHeight={minBarHeight}
            offset={offset}
          />
        </Animated.View>
      </GestureDetector>

      <StatusBar style={statusBarColor()} />
    </View>

  )
}
const MemoMain = memo(Main);


const rp = async (sharedAsyncState: any, setData: any) => {
  console.log('debug post get requested');
  const offset = sharedAsyncState['main'] ?? 0;
  sharedAsyncState['main'] = offset + 5;

  const { data, error } = await supabaseClient.rpc('get_posts', { o: offset, n: 5 })
  if (error) {
    console.log('error post', error)
    return;
  }
  if (data.length > 0) setData((posts: any) => posts.concat(data))
  data.forEach((p: any) => {
    sharedAsyncState[`count/${p.id}`] = p.comment_count;
  })
}

const rc = async (sharedAsyncState: any, insertData: any, post_id: string, parent_id: string | null) => {
  const key = parent_id ?? post_id;

  const offset = sharedAsyncState[key] ?? 0;
  const count = sharedAsyncState[`count/${key}`];
  if (offset >= count) {
    console.log(`had enough of ${post_id}.${parent_id}`, offset, count);
    return [];
  }
  sharedAsyncState[key] = offset + 5;

  const { data, error } = await supabaseClient.rpc('get_comments', { o: offset, n: 5, postid: post_id, parentid: parent_id })
  if (error) {
    console.log('debug error query comments from post', error)
    return [];
  }

  data.forEach((c: any) => {
    sharedAsyncState[`count/${c.id}`] = c.comment_count;
    insertData(c);
  })
  console.log('data.length', data.length)
  return data
}

const grc = async (sharedAsyncState: any, insertData: any, post_id: string, parent_id: string | null) => {
  const key = `status-${parent_id ?? post_id}`;
  if (sharedAsyncState[key] == 'running') return;
  sharedAsyncState[key] = 'running';
  const comments = await rc(sharedAsyncState, insertData, post_id, parent_id);
  if (parent_id == null) {
    comments.forEach((c: any) => {
      grc(sharedAsyncState, insertData, post_id, c.id);
    })
  }
  sharedAsyncState[key] = 'done';
}

export default function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<Mode>({ tag: 'Normal' });

  useEffect(() => {
    // console.log('props.user changed', props.user)
    if (user == null) return
    // Cancel account deletion
    (async () => {
      const { error } = await supabaseClient.from('deletions').delete().eq('user_id', user.id)
    })()
  }, [user])

  const insertComment = (c: any, atHead = false) => {
    if (c.parent_id == null) {
      setComments((comments) =>
        atHead ?
          [{ ...c, level: 0 }, ...comments] :
          [...comments, { ...c, level: 0 }]
      )
      return;
    }

    setComments((comments) => {
      let i = comments.length - 1;
      // console.log('debug', comments, i, comments[i]);
      while (i >= 0) {
        if (comments[i].parent_id == c.parent_id) {
          comments.splice(i + 1, 0, { ...c, level: comments[i].level })
          return [...comments]
        }
        if (comments[i].id == c.parent_id) {
          comments.splice(i + 1, 0, { ...c, level: comments[i].level + 1 })
          return [...comments]
        }
        i -= 1;
      }

      // Should not hit this case
      return comments
    })
  }

  useEffect(() => {
    (async () => {
      const userResponse = await supabaseClient.auth.getUser();
      console.log('Load user', userResponse.data.user)
      setUser(userResponse.data.user)
    })()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        // setSession(session);
        console.log('User changes', session?.user)
        setUser(session?.user ?? null);
      }
    );
  }, [])


  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }, [user])



  let inited = false;


  const updateComment = (id: string, key: any, value: any) => {
    setComments((comments: any) => {
      const index = comments.findIndex((c: any) => c.id == id);
      comments[index][key] = typeof value === 'function' ? value(comments[index][key]) : value;
      comments[index] = { ...comments[index] }
      return [...comments];
    })
  }

  const submitComment = async (text: string, parent_id: string | null, post_id: string) => {
    console.log('submit content by', user.user_metadata.full_name)
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
      author_name: user.user_metadata.full_name,
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

    insertComment(placeholderComment, true);
    insertComment(childComment);

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
      // console.log('update', update);
      updateComment(childId, 'content', (old: string) => old + update);
    });

    updateComment(childId, 'blinking', false)
  }

  const onSubmit = (text: string) => {
    console.log('submitted', activePostIndex);
    submitComment(text, selectedCommentId, posts[activePostIndex].id);
    setSelectedCommentId(null);
  }


  const requestComments = async (post_id: string, parent_id: string | null) => {
    console.log('request comments', post_id, parent_id)
    await grc(sharedAsyncState, insertComment, post_id, parent_id)
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

  const memoRequestPost = React.useCallback(requestPost, [])
  const memoRequestComments = React.useCallback(requestComments, [])
  const memoOnSubmit = React.useCallback(onSubmit, [posts, selectedCommentId])

  return (
    <SafeAreaProvider>
      <MainContext.Provider value={{
        posts: posts,
        comments: comments,
        requestPost: memoRequestPost,
        requestComments: memoRequestComments,
        mode: mode,
        setMode: setMode,
        selectedCommentId: selectedCommentId,
        setSelectedCommentId: setSelectedCommentId,
      }}>
        <MemoMain
          onSubmit={memoOnSubmit}
          selectedCommentId={selectedCommentId}
          setSelectedCommentId={setSelectedCommentId}
          activePostIndex={activePostIndex}
          setActivePostIndex={setActivePostIndex}
          user={user}
          setUser={setUser}
        />
      </MainContext.Provider>
    </SafeAreaProvider>
  );
}


