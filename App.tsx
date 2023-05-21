import * as Haptics from 'expo-haptics';
import { setStatusBarBackgroundColor, setStatusBarStyle } from 'expo-status-bar';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Platform, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from 'sentry-expo';
import { MemoBar } from './components/Bar';
import Wall from './components/Wall';
import { supabaseClient } from './supabaseClient';
import { Mode, addCommentsToPost, constants, executeListeners, randomColor, scaleup, sharedAsyncState, theEmptyFunction, updateCommentsOfPost } from './utils';
import { firebase } from '@react-native-firebase/analytics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';


Sentry.init({
  dsn: 'https://d474c02a976d4a0091626611d20d5da6@o4505035763679232.ingest.sentry.io/4505035768594432',
  tracesSampleRate: 0.1,
  enableInExpoDevelopment: true,
  // debug: true
});
// @ts-ignore
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
// @ts-ignore
import {
  Rubik_300Light, Rubik_300Light_Italic, Rubik_400Regular, Rubik_400Regular_Italic, Rubik_500Medium, Rubik_500Medium_Italic, Rubik_600SemiBold, Rubik_600SemiBold_Italic, Rubik_700Bold, Rubik_700Bold_Italic, Rubik_800ExtraBold, Rubik_800ExtraBold_Italic, Rubik_900Black, Rubik_900Black_Italic, useFonts
} from '@expo-google-fonts/rubik';
import {
  Domine_400Regular,
  Domine_500Medium,
  Domine_600SemiBold,
  Domine_700Bold,
} from '@expo-google-fonts/domine';

import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
// @ts-ignore
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
// @ts-ignore
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';
import { MenuProvider } from 'react-native-popup-menu';

import { useHeaderHeight } from '@react-navigation/elements';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MemoPost } from './components/Post';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Settings from './components/Settings';
import { useFont } from '@shopify/react-native-skia';

const Tab = createBottomTabNavigator();



// SplashScreen.preventAutoHideAsync();


function Main(props: any) {
  const insets = useSafeAreaInsets();
  const minBarHeight = scaleup(60) + insets.bottom;
  // const wallref = useRef<any>(undefined);
  const isSinglePost = props.navProps.route.params?.singlePost ? true : false;
  const mode = isSinglePost ? 'comment' : props.mode;
  const setMode = isSinglePost ? theEmptyFunction : props.setMode;
  const [activePostIndex, setActivePostIndex] = useState(0);

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

  useEffect(() => {
    // setStatusBarStyle('light')
    updateAndroidBarsColor();
  }, [mode, props.app])

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


  const [safeHeight, setSafeHeight] = useState<number>(0);
  // const minBarHeight = useBottomTabBarHeight();



  const onLayoutRootView = useCallback(async (event: any) => {
    if (!props.fontsLoaded || props.posts.length <= 1) return;
    await SplashScreen.hideAsync();
  }, [props.fontsLoaded, props.posts])


  const calculateHeights = async (event: any) => {
    console.log('layout', event.nativeEvent.layout)
    setSafeHeight(event.nativeEvent.layout.height);
  }

  if (!props.fontsLoaded || props.posts.length <= 1) return <View style={{
    backgroundColor: 'black',
    flex: 1
  }}
    onLayout={calculateHeights}
  />;
  return (
    <View style={{
      backgroundColor: 'black',
      flex: 1
    }}
      onLayout={calculateHeights}
    >
      {/* <GestureHandlerRootView>
        <GestureDetector gesture={gesture}> */}
      <Animated.View style={[animatedStyles, {
        // backgroundColor: 'red',
        height: safeHeight
      }]}>
        <View style={{
          height: isSinglePost ? safeHeight - minBarHeight : safeHeight,
          // backgroundColor: 'pink'
        }}>
          {
            isSinglePost ?

              <MemoPost
                navProps={props.navProps}
                isSinglePost
                mode={mode}
                height={isSinglePost ? safeHeight - minBarHeight : safeHeight}
                post={props.navProps.route.params?.singlePost}
                shouldActive={true}
                scrolledOn={true}
                setSelectedComment={props.setSelectedComment}
                setMode={setMode}
                user={props.user}
              />

              :
              <Wall
                navProps={props.navProps}
                offsetZoomStyles={offsetZoomStyles}
                user={props.user}
                // wallref={wallref}
                setSelectedComment={props.setSelectedComment}
                setMode={setMode}
                requestPost={props.requestPost}
                posts={props.posts}
                mode={mode}
                activePostIndex={activePostIndex}
                setActivePostIndex={setActivePostIndex}
                height={safeHeight}
              />
          }
        </View>
        {
          isSinglePost && <MemoBar
            isSinglePost={isSinglePost}
            navProps={props.navProps}
            activePostIndex={props.activePostIndex}
            onSubmit={(text: string, selectedComment: any) => {
              const post_id = isSinglePost ?
                props.navProps.route.params.singlePost.id :
                props.posts[props.activePostIndex].id;
              console.log('debug submit >', text, selectedComment, post_id)
              props.submitContent(text, selectedComment, post_id)
            }}
            // wallref={wallref}
            // navigationBarVisible={navigationBarVisible}
            mode={mode}
            setMode={setMode}
            setSelectedComment={props.setSelectedComment}
            selectedComment={props.selectedComment}
            user={props.user}
            setUser={props.setUser}
            minBarHeight={minBarHeight}
            offset={offset}
            safeHeight={safeHeight}
          // wallHeight={wallHeight}
          />
        }
      </Animated.View>
      {/* </GestureDetector>
      </GestureHandlerRootView> */}
    </View>
  )
}
// const MemoMain = memo(Main);

const rp = async (sharedAsyncState: any, setData: any) => {
  console.log('debug post get requested');
  const offset = sharedAsyncState['offset/main'] ?? 0;
  sharedAsyncState['offset/main'] = offset + 20;

  const { data, error } = await supabaseClient.rpc('get_articles')
  if (error) {
    console.error('error get post', error)
    return;
  }
  // console.log('debug posts', data);
  if (data.length > 0) setData((posts: any) => [...new Map([...posts, ...data].map(item => [item.id, item])).values()])
  data.forEach((p: any) => {
    sharedAsyncState[`count/${p.id}`] = 0;
  })
}

const Stack = createStackNavigator();

function MyStack(props: any) {
  const TheMain = (navProps: any) => {
    // console.log('debug navProps++', navProps)
    return <Main {...props} navProps={navProps} />
  };

  const TheSettings = (navProps: any) => {
    return <Settings {...props} navProps={navProps} />
  };



  const TheTab = () => {
    return <Tab.Navigator screenOptions={{
      tabBarStyle: {
        position: 'absolute',
        borderTopColor: '#3C3D3F',
        borderTopWidth: StyleSheet.hairlineWidth,
        backgroundColor: Platform.OS == 'android' ? '#151316' : undefined,
      },
      tabBarBackground: () => (
        <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
      ),
    }}
    >
      <Tab.Screen name="Discover" children={TheMain} options={{
        headerShown: false,
        // briefcase, layers, albums
        tabBarIcon: ({ focused }) => focused ?
          <Ionicons name="compass" size={24} color={'white'} /> :
          <Ionicons name="compass-outline" size={24} color={'#A3A3A3'} />,
        tabBarLabel: ({ focused }) => <Text style={{
          color: focused ? 'white' : '#a3a3a3',
          fontWeight: focused ? '600' : '400',
          fontSize: 10
        }}>Discover</Text>,
      }} />
      <Tab.Screen name="Profile" component={TheSettings}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => focused ?
            <Ionicons name="person" size={24} color={'white'} /> :
            <Ionicons name="person-outline" size={24} color={'#A3A3A3'} />,
          tabBarLabel: ({ focused }) => <Text style={{
            color: focused ? 'white' : '#a3a3a3',
            fontWeight: focused ? '600' : '400',
            fontSize: 10
          }}>Profile</Text>,
        }}
      />
    </Tab.Navigator>
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TheTab"
        options={{ headerShown: false }}
        children={TheTab}
      />
      <Stack.Screen
        name="SinglePost"
        options={{
          title: 'Post',
          headerStyle: {
            backgroundColor: '#272727',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#3C3D3F'
          },
          headerBackTitle: 'Back',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontFamily: 'Rubik_600SemiBold'
          },
          gestureResponseDistance: constants.width
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
    Domine_400Regular,
    Domine_500Medium,
    Domine_600SemiBold,
    Domine_700Bold,
  });
  const [posts, setPosts] = useState<any[]>([
    // { type: 'welcomePost', id: 'welcome' }
  ]);
  const [selectedComment, setSelectedComment] = useState<any>(null);

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
      const { data, error } = await supabaseClient.rpc('get_bookmarked_articles');
      console.log('debug bookmarks', data.map((r: any) => r.author_name), error);
      if (error) {
        console.warn('Cannot load bookmarks', error);
        return;
      }
      data.forEach((post: any) => {
        sharedAsyncState[`count/${post.id}`] = post.comment_count;
        sharedAsyncState.bookmarks[post.id] = post;
        executeListeners(`BookmarkChangelisteners/${post.id}`);
      })
      executeListeners(`BookmarksChanged`);
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

  const submitComment = async (text: string, selectedComment: any, post_id: string, need_bot_comment = false) => {
    const parent_id = selectedComment?.id ?? null;
    console.log('submit content', text, parent_id, post_id)
    const body = {
      content: text,
      post_id: post_id,
      parent_id: parent_id,
      need_bot_comment: need_bot_comment
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

    addCommentsToPost(post_id, [placeholderComment], true)

    const f = async () => {
      const response = await fetch('https://djhuyrpeqcbvqbhfnibz.functions.supabase.co/comment', {
        // @ts-ignore
        reactNative: { textStreaming: true },
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(body)
      })

      let newId = response.headers.get("comment_id") ?? `placeholder-${Math.random()}`;
      const childId = response.headers.get("child_id") ?? `placeholder-child-${Math.random()}`;
      console.log('debug comment_id', newId)
      console.log('debug childId', childId)


      updateCommentsOfPost(post_id, placeholderId, 'id', newId)
      return { response, newId, childId }
    }

    const g = async () => {
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

      addCommentsToPost(post_id, [childComment]);
      console.log('what')
      const { response, newId, childId } = await f();
      console.log('debug { response, newId, childId } ', { response, newId, childId })
      updateCommentsOfPost(post_id, childPlaceholderId, 'id', childId)
      updateCommentsOfPost(post_id, childId, 'parent_id', newId)


      if (!response.body || !response.ok) {
        console.log('ERROR: response', response);
        updateCommentsOfPost(post_id, childId, 'blinking', false);
        updateCommentsOfPost(post_id, childId, 'content', 'Error: Packer cannot reply you, try again?');
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
        updateCommentsOfPost(post_id, childId, 'content', (old: string) => old + update);
      });

      updateCommentsOfPost(post_id, childId, 'blinking', false)
    }

    if (need_bot_comment) {
      console.log('GGGG')
      await g()
    } else {
      console.log('FFFF')
      await f()
    }
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
  const memoSubmitComment = React.useCallback(submitComment, [user, posts, selectedComment])

  console.log('debug big re-render');

  return (
    <SafeAreaProvider>
      <MenuProvider>

        <NavigationContainer>

          <MyStack
            fontsLoaded={fontsLoaded}
            selectedComment={selectedComment}
            // activePostIndex={activePostIndex}
            user={user}
            mode={mode}
            posts={posts}
            // submitComment={submitComment}
            submitContent={memoSubmitComment}
            setSelectedComment={setSelectedComment}
            setUser={setUser}
            // setActivePostIndex={setActivePostIndex}
            requestPost={memoRequestPost}
            setMode={setMode}
          />
        </NavigationContainer>
      </MenuProvider>
    </SafeAreaProvider>
  );

}


export default Sentry.Native.wrap(App);

