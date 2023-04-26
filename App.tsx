import * as Haptics from 'expo-haptics';
import { setStatusBarBackgroundColor, setStatusBarStyle } from 'expo-status-bar';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from 'sentry-expo';
import { MemoBar } from './components/Bar';
import Wall from './components/Wall';
import { supabaseClient } from './supabaseClient';
import { Mode, addCommentsToPost, constants, executeListeners, sharedAsyncState, theEmptyFunction, updateCommentsOfPost } from './utils';

Sentry.init({
  dsn: 'https://d474c02a976d4a0091626611d20d5da6@o4505035763679232.ingest.sentry.io/4505035768594432',
  tracesSampleRate: 1.0,
  enableInExpoDevelopment: true,
  // debug: true
});
// @ts-ignore
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
// @ts-ignore
import {
  Rubik_300Light, Rubik_300Light_Italic, Rubik_400Regular, Rubik_400Regular_Italic, Rubik_500Medium, Rubik_500Medium_Italic, Rubik_600SemiBold, Rubik_600SemiBold_Italic, Rubik_700Bold, Rubik_700Bold_Italic, Rubik_800ExtraBold, Rubik_800ExtraBold_Italic, Rubik_900Black, Rubik_900Black_Italic, useFonts
} from '@expo-google-fonts/rubik';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
// @ts-ignore
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
// @ts-ignore
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';
import { MenuProvider } from 'react-native-popup-menu';

import { useHeaderHeight } from '@react-navigation/elements';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MemoPost } from './components/Post';


SplashScreen.preventAutoHideAsync();


function Main(props: any) {
  const insets = useSafeAreaInsets();
  const [navigationBarVisible, setNavigationBarVisible] = useState(false);

  // const wallref = useRef<any>(undefined);
  const isSinglePost = props.navProps.route.params?.singlePost ? true : false;
  const mode = isSinglePost ? 'comment' : props.mode;
  const setMode = isSinglePost ? theEmptyFunction : props.setMode;

  const updateAndroidBarsColor = () => {
    if (Platform.OS == 'ios') return;
    const color = mode == 'comment' ? '#272727' : '#151316';
    NavigationBar.setBackgroundColorAsync(color);
    setStatusBarBackgroundColor(color, false);
  }

  useEffect(() => {
    setStatusBarStyle('light')
    updateAndroidBarsColor();
  }, [])



  const offset = useSharedValue(0);
  const offsetZoomStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: offset.value > 1 ? (2 - 1 / Math.pow(offset.value, 0.2)) : 1 },
      ]
    };
  });
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offset.value },
      ]
    };
  });
  const gesture = Gesture
    .Pan()
    .enabled(!isSinglePost && (mode === 'comment'))
    .activeOffsetX([-10, 10])
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
      if (offset.value < 20) return;
      runOnJS(setMode)('normal')
    });

  // Note: Some Android treats the bottom handle as navigationBar, so navigationBarVisible is true
  // In thoses cases, this still works as intended
  const minBarHeight = 60 + (Platform.OS == 'android' && !navigationBarVisible ? 16 : 0);
  const wallHeight = constants.height
    - (
      Platform.OS == 'android'
        ? constants.statusBarHeight + Math.max((navigationBarVisible ? constants.navigationBarHeight : 0), insets.bottom)
        : 0
    )
    - (
      Platform.OS == 'ios'
        ? insets.bottom
        : 0
    )
    - minBarHeight
    - useHeaderHeight()
    ;
  console.log('debug wallheight', wallHeight, insets.bottom, navigationBarVisible)

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

  console.log('navProps', props.navProps)

  return (
    <GestureHandlerRootView>
      <View
        onLayout={onLayoutRootView}
        style={{
          height: constants.height,
          width: constants.width,
          backgroundColor: 'black'
        }}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={animatedStyles}>
            {
              isSinglePost ?
                <MemoPost
                  isSinglePost
                  mode={mode}
                  height={wallHeight}
                  post={props.navProps.route.params?.singlePost}
                  shouldActive={true}
                  scrolledOn={true}
                  setSelectedComment={() => { }}
                  setMode={setMode}
                  user={props.user}
                /> :
                <Wall
                  offsetZoomStyles={offsetZoomStyles}
                  user={props.user}
                  // wallref={wallref}
                  setSelectedComment={props.setSelectedComment}
                  setMode={setMode}
                  requestPost={props.requestPost}
                  posts={props.posts}
                  mode={mode}
                  activePostIndex={props.activePostIndex}
                  setActivePostIndex={props.setActivePostIndex}
                  height={wallHeight}
                />
            }
            <MemoBar
              isSinglePost={props.navProps.route.params?.singlePostId}
              navProps={props.navProps}
              activePostIndex={props.activePostIndex}
              onSubmit={props.onSubmit}
              // wallref={wallref}
              navigationBarVisible={navigationBarVisible}
              mode={mode}
              setMode={setMode}
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
    </GestureHandlerRootView>
  )
}
const MemoMain = memo(Main);

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

const Stack = createNativeStackNavigator();

function MyStack(props: any) {
  const TheMain = (navProps: any) => {
    return <MemoMain {...props} navProps={navProps} />
  };


  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        options={{ headerShown: false }}
        children={TheMain}
      />
      <Stack.Screen
        name="SinglePost"
        options={{
          title: 'Bookmark',
          headerStyle: {
            backgroundColor: '#272727',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontFamily: 'Rubik_600SemiBold'
          },
          // headerRight: headerRight
        }}
        children={TheMain}
      />
    </Stack.Navigator>
  );
}

function App() {
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
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<Mode>('normal');



  useEffect(() => {
    // console.log('props.user changed', props.user)

    if (user == null) {
      // Clear local cache
      if (sharedAsyncState.bookmarks) {
        Object.keys(sharedAsyncState.bookmarks).forEach((previous_user_bookmarked_post_id: string) => {
          if (!sharedAsyncState.bookmarks[previous_user_bookmarked_post_id]) return;
          sharedAsyncState.bookmarks[previous_user_bookmarked_post_id] = undefined;
          executeListeners(`BookmarkChangelisteners/${previous_user_bookmarked_post_id}`);
        })
      }
      return;
    }
    // Cancel account deletion
    (async () => {
      const { error } = await supabaseClient.from('deletions').delete().eq('user_id', user.id)
    })();

    (async () => {
      const { data, error } = await supabaseClient.rpc('get_bookmarked_posts');
      console.log('debug bookmarks', data.map((r: any) => r.author_name), error);
      if (error) {
        console.warn('Cannot load bookmarks', error);
        return;
      }
      data.forEach((post: any) => {
        sharedAsyncState.bookmarks[post.id] = post;
        executeListeners(`BookmarkChangelisteners/${post.id}`);
      })
    })()
  }, [user])


  useEffect(() => {
    if (mode == 'normal') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [mode])

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

  const submitComment = async (text: string, selectedComment: any, post_id: string) => {
    const parent_id = selectedComment?.id ?? null;
    console.log('submit content', text, parent_id, post_id)
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

    addCommentsToPost(post_id, [placeholderComment], true)
    addCommentsToPost(post_id, [childComment]);

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

    updateCommentsOfPost(post_id, childPlaceholderId, 'id', childId)
    updateCommentsOfPost(post_id, childId, 'parent_id', newId)
    updateCommentsOfPost(post_id, placeholderId, 'id', newId)

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
      updateCommentsOfPost(post_id, childId, 'content', (old: string) => old + update);
    });

    updateCommentsOfPost(post_id, childId, 'blinking', false)
  }

  const onSubmit = (text: string, selectedComment: any) => {
    console.log('submitted', activePostIndex);
    submitComment(text, selectedComment, posts[activePostIndex].id);
  }


  const requestPost = async () => {
    await rp(sharedAsyncState, setPosts)
  }

  const [inited, setInited] = useState(false);
  useEffect(() => {
    if (inited) return;
    setInited(true);
    requestPost();
  }, [])

  const memoRequestPost = React.useCallback(requestPost, [])
  const memoOnSubmit = React.useCallback(onSubmit, [posts, selectedComment, activePostIndex])

  console.log('debug big re-render');
  return (
    <SafeAreaProvider>
      <MenuProvider>

        <NavigationContainer>

          <MyStack
            fontsLoaded={fontsLoaded}
            selectedComment={selectedComment}
            activePostIndex={activePostIndex}
            user={user}
            mode={mode}
            posts={posts}
            onSubmit={memoOnSubmit}
            setSelectedComment={setSelectedComment}
            setUser={setUser}
            setActivePostIndex={setActivePostIndex}
            requestPost={memoRequestPost}
            setMode={setMode}
          />
        </NavigationContainer>
      </MenuProvider>
    </SafeAreaProvider>
  );

}


export default Sentry.Native.wrap(App);

