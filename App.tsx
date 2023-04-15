import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { setStatusBarBackgroundColor, setStatusBarHidden, setStatusBarStyle, setStatusBarTranslucent, StatusBar } from 'expo-status-bar';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, View, Text, Image } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import Bar, { MemoBar } from './components/Bar';
import Wall from './components/Wall';
import { supabaseClient } from './supabaseClient';
import { calcStatusBarColor, constants, Mode, sharedAsyncState } from './utils';
// @ts-ignore
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
// @ts-ignore
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
// @ts-ignore
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { MenuProvider } from 'react-native-popup-menu';
SplashScreen.preventAutoHideAsync();

// import AppLoading from 'expo-app-loading';
const INJECTED_JAVASCRIPT = `(function() {
  window.ReactNativeWebView.postMessage(JSON.stringify(
    window.getComputedStyle( document.documentElement ,null).getPropertyValue('background-color')
    ));
})();`;
import {
  useFonts,
  Rubik_300Light,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
  Rubik_800ExtraBold,
  Rubik_900Black,
  Rubik_300Light_Italic,
  Rubik_400Regular_Italic,
  Rubik_500Medium_Italic,
  Rubik_600SemiBold_Italic,
  Rubik_700Bold_Italic,
  Rubik_800ExtraBold_Italic,
  Rubik_900Black_Italic,
} from '@expo-google-fonts/rubik';
// import { MenuView } from '@react-native-menu/menu';


function Main(props: any) {
  const insets = useSafeAreaInsets();
  const [navigationBarVisible, setNavigationBarVisible] = useState(false);
  const minBarHeight = 60 + (Platform.OS == 'android' ? (navigationBarVisible ? 0 : 32) : 0);
  const [webviewBackgroundColor, setWebviewBackgroundColor] = useState('rgba(0, 0, 0, 0)')
  const wallref = useRef<any>(undefined);

  useEffect(() => {
    if (props.app) return;
    setWebviewBackgroundColor('rgb(0,0,0)');
    setStatusBarStyle('light')
    if (Platform.OS == 'ios') return;
    const color = props.mode.tag == 'Comment' ? '#272727' : '#151316';
    NavigationBar.setBackgroundColorAsync(color);
    setStatusBarBackgroundColor(color, false);
  }, [props.mode])


  const onMessage = (event: WebViewMessageEvent) => {
    if (props.app === null) return;
    const backgroundColor = JSON.parse(event.nativeEvent.data);
    console.log('backgroundColor', backgroundColor)
    setWebviewBackgroundColor(backgroundColor)

    // TODO: Android this, android that, android with translucent status bar or not
    if (Platform.OS == 'android') return;
    const color = calcStatusBarColor(backgroundColor);
    console.log('color', color)
    setStatusBarStyle(color)
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
    .enabled(props.mode.tag === 'Comment' || props.app !== null)
    .activeOffsetX([-50, 50])
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
      if (props.app) {
        runOnJS(props.setApp)(null)
        return;
      }

      runOnJS(props.setMode)({ tag: 'Normal' })
    });

  // Cannot make status bar translucent on android :(
  // Maybe check if status bar is translucent?


  const [wallHeight, setWallHeight] = useState(constants.height
    - (
      Platform.OS == 'android'
        ? constants.statusBarHeight +
        (navigationBarVisible ? constants.navigationBarHeight : 0)
        : 0
    )
    - insets.bottom
    - minBarHeight)

  useEffect(() => {
    const wallHeight = constants.height
      - (
        Platform.OS == 'android'
          ? constants.statusBarHeight +
          (navigationBarVisible ? constants.navigationBarHeight : 0)
          : 0
      )
      - insets.bottom
      - minBarHeight;
    setWallHeight(wallHeight)
  }, [navigationBarVisible, insets.bottom])

  useEffect(() => {
    (async () => {
      if (Platform.OS == 'ios') return;
      const visibility = await NavigationBar.getVisibilityAsync();
      setNavigationBarVisible(visibility == 'visible')
    })()
  }, [])


  const onLayoutRootView = useCallback(async () => {
    if (!props.fontsLoaded || props.posts.length <= 1) return;
    await SplashScreen.hideAsync();
  }, [props.fontsLoaded, props.posts])

  if (!props.fontsLoaded || props.posts.length <= 1) return null;

  return (
    <View
      onLayout={onLayoutRootView}
      style={{
        height: constants.height,
        width: constants.width,
        backgroundColor: 'black'
      }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyles}>
          <Wall
            app={props.app}
            setApp={props.setApp}
            preloadImage={props.preloadImage}
            wallref={wallref}
            requestComments={props.requestComments}
            setSelectedComment={props.setSelectedComment}
            setMode={props.setMode}
            requestPost={props.requestPost}
            posts={props.posts}
            comments={props.comments}
            mode={props.mode}
            activePostIndex={props.activePostIndex}
            setActivePostIndex={props.setActivePostIndex}
            height={wallHeight}
          />
          {
            props.app && <View style={{
              position: 'absolute',
              // Catch transparency
              backgroundColor: 'black',
              height: constants.height - insets.bottom - minBarHeight,
              width: constants.width,
            }}
            // entering={FadeIn.duration(300)}
            // exiting={FadeOut.duration(300)}
            >
              <WebView
                domStorageEnabled={true}
                sharedCookiesEnabled={true}
                containerStyle={{
                  paddingTop: insets.top,
                  backgroundColor: webviewBackgroundColor
                }}
                decelerationRate='normal'
                source={{ uri: props.app.url }}
                onNavigationStateChange={(navState) => {
                  props.setApp({ url: navState.url })
                }}
                mediaPlaybackRequiresUserAction={true}
                allowsInlineMediaPlayback={true}
                onMessage={onMessage}
                injectedJavaScript={INJECTED_JAVASCRIPT}
                autoManageStatusBarEnabled={false}
              />
            </View>
          }


          <MemoBar
            setApp={props.setApp}
            app={props.app}
            activePostIndex={props.activePostIndex}
            onSubmit={props.onSubmit}
            wallref={wallref}
            navigationBarVisible={navigationBarVisible}
            mode={props.mode}
            setMode={props.setMode}
            setSelectedComment={props.setSelectedComment}
            selectedComment={props.selectedComment}
            user={props.user}
            setUser={props.setUser}
            minBarHeight={minBarHeight}
            offset={offset}
            wallHeight={wallHeight}
          />

        </Animated.View>
      </GestureDetector>
    </View>

  )
}
const MemoMain = memo(Main);

const pi = async (sharedAsyncState: any, imageURI: string) => {
  if (sharedAsyncState[`preload/${imageURI}`] == 'error') return false;
  if (sharedAsyncState[`preload/${imageURI}`] == 'ok') return true;

  try {
    await Image.prefetch(imageURI);
  } catch (e) {
    sharedAsyncState[`preload/${imageURI}`] = 'error';
    console.log('cannot load image', e, imageURI)
    return false;
  }

  sharedAsyncState[`preload/${imageURI}`] = 'ok';
  return true;
};


const rp = async (sharedAsyncState: any, setData: any) => {
  console.log('debug post get requested');
  const offset = sharedAsyncState['offset/main'] ?? 0;
  sharedAsyncState['offset/main'] = offset + 5;

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

  const offset = sharedAsyncState[`offset/${key}`] ?? 0;
  const count = sharedAsyncState[`count/${key}`];
  if (offset >= count) {
    console.log(`had enough of ${post_id}.${parent_id}`, offset, count);
    return [];
  }

  sharedAsyncState[`offset/${key}`] = offset + 3;

  const { data, error } = await supabaseClient.rpc('get_comments_batch', { o: offset, n: 3, postid: post_id, parentid: parent_id, nchildren: 3 })
  if (error) {
    console.log('debug error query comments from post', error)
    return [];
  }

  const newIds = data.map((c: any) => c.id);
  data.forEach((c: any) => {
    if (newIds.includes(c.parent_id)) sharedAsyncState[`offset/${c.parent_id}`] = 3
    sharedAsyncState[`count/${c.id}`] = c.comment_count;
    sharedAsyncState[`num/${c.id}`] = 0;
    if (c.parent_id) sharedAsyncState[`num/${c.parent_id}`] += 1;
    // insertData(c);
  })
  insertData(data);
  // console.log('data.length', data.length)
  // return data
}

const grc = async (sharedAsyncState: any, insertData: any, post_id: string, parent_id: string | null) => {
  const key = `status-${parent_id ?? post_id}`;
  if (sharedAsyncState[key] == 'running') return;
  sharedAsyncState[key] = 'running';
  // const comments = 
  await rc(sharedAsyncState, insertData, post_id, parent_id);
  // if (parent_id == null) {
  //   comments.forEach((c: any) => {
  //     grc(sharedAsyncState, insertData, post_id, c.id);
  //   })
  // }
  sharedAsyncState[key] = 'done';
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Rubik_300Light,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
    Rubik_800ExtraBold,
    Rubik_900Black,
    Rubik_300Light_Italic,
    Rubik_400Regular_Italic,
    Rubik_500Medium_Italic,
    Rubik_600SemiBold_Italic,
    Rubik_700Bold_Italic,
    Rubik_800ExtraBold_Italic,
    Rubik_900Black_Italic,
  });
  const [posts, setPosts] = useState<any[]>([{ type: 'welcomePost', id: 'welcome' }]);
  const [comments, setComments] = useState<any[]>([]);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<Mode>({ tag: 'Normal' });
  const [app, setApp] = useState<null | { url: string }>(null);


  useEffect(() => {
    // console.log('props.user changed', props.user)
    if (user == null) return
    // Cancel account deletion
    (async () => {
      const { error } = await supabaseClient.from('deletions').delete().eq('user_id', user.id)
    })()
  }, [user])


  useEffect(() => {
    if (mode.tag == 'Normal') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [mode.tag])

  // useEffect(() => {
  //   if (app == null) return;
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  // }, [app])

  // TODO: set only once
  const insertComments = (cs: any[], atHead = false) => {
    const _insert = (c: any, comments: any[]) => {
      if (c.parent_id == null) {
        if (atHead) {
          comments.unshift({ ...c, level: 0 });
          return;
        }

        comments.push({ ...c, level: 0 });
        return;
      }

      let i = comments.length - 1;
      while (i >= 0) {
        if (!atHead) {
          if (comments[i].parent_id == c.parent_id) {
            comments.splice(i + 1, 0, { ...c, level: comments[i].level })
            return;
          }
        }
        if (comments[i].id == c.parent_id) {
          comments.splice(i + 1, 0, { ...c, level: comments[i].level + 1 })
          return;
        }
        i -= 1;
      }
    }

    setComments((comments) => {
      const newComments = [...comments];
      cs.forEach(c => _insert(c, newComments))
      return newComments;
    })
  }

  useEffect(() => {
    (async () => {
      const userResponse = await supabaseClient.auth.getUser();
      console.log('Load user', userResponse.data.user ? 'ok' : userResponse.data.user)
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


  const updateComment = (id: string, key: any, value: any) => {
    setComments((comments: any) => {
      const index = comments.findIndex((c: any) => c.id == id);
      comments[index][key] = typeof value === 'function' ? value(comments[index][key]) : value;
      comments[index] = { ...comments[index] }
      return [...comments];
    })
  }

  const submitComment = async (text: string, selectedComment: any, post_id: string) => {
    const parent_id = selectedComment?.id ?? null;
    console.log('submit content', parent_id, post_id)
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

    // TODO: fix this properly
    let _user = user;
    if (!_user) {
      const { data: user_data, error: user_error } = await supabaseClient.auth.getUser();
      if (!user_data.user || user_error) {
        console.log('debug error user when submit', user_data, user_error)
        return;
      }

      _user = user_data.user;
    }

    const placeholderId = `placeholder-${Math.random()}`;
    const placeholderComment = {
      // Could get from header
      id: placeholderId,
      created_at: new Date(),
      content: text,
      author_name: _user.user_metadata.full_name,
      parent_id: parent_id,
      post_id: post_id,
      blockRequestChildren: true,
      author_id: 'self'
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
      blockRequestChildren: true,
      author_id: null
    }

    insertComments([placeholderComment], true);
    insertComments([childComment]);

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

  const onSubmit = (text: string, selectedComment: any) => {
    // if (activePostIndex == 0) return;
    console.log('submitted', activePostIndex);
    submitComment(text, selectedComment, posts[activePostIndex].id);
    // setSelectedComment(null);
  }

  const requestComments = async (post_id: string, parent_id: string | null) => {
    console.log('request comments', post_id, parent_id)
    await grc(sharedAsyncState, insertComments, post_id, parent_id)
  }

  const requestPost = async () => {
    await rp(sharedAsyncState, setPosts)
  }

  const preloadImage = async (imageURI: string) => {
    return await pi(sharedAsyncState, imageURI)
  }

  const [inited, setInited] = useState(false);
  useEffect(() => {
    if (inited) return;
    setInited(true);
    requestPost();
  }, [])

  const memoRequestPost = React.useCallback(requestPost, [])
  const memoPreloadImage = React.useCallback(preloadImage, [])
  const memoRequestComments = React.useCallback(requestComments, [])
  const memoOnSubmit = React.useCallback(onSubmit, [posts, selectedComment, activePostIndex])



  return (
    // <MenuProvider >
    <SafeAreaProvider>
      <MenuProvider>
        <GestureHandlerRootView>
          <MemoMain
            preloadImage={memoPreloadImage}
            fontsLoaded={fontsLoaded}
            onSubmit={memoOnSubmit}
            setSelectedComment={setSelectedComment}
            selectedComment={selectedComment}
            activePostIndex={activePostIndex}
            setActivePostIndex={setActivePostIndex}
            user={user}
            setUser={setUser}
            posts={posts}
            requestPost={memoRequestPost}
            comments={comments}
            setMode={setMode}
            requestComments={memoRequestComments}
            mode={mode}
            app={app}
            setApp={setApp}
          />
        </GestureHandlerRootView>
      </MenuProvider>
    </SafeAreaProvider>
    // </MenuProvider>
  );

}