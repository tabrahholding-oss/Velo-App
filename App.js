import React, {useEffect, useState} from 'react';
import {DrawerActions, NavigationContainer} from '@react-navigation/native';
import ScreenNavigationStack from './src/navigation/ScreenNavigation';
import messaging from '@react-native-firebase/messaging';
import {ToastProvider} from 'react-native-toast-notifications';
import {
  Alert,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {assets} from './src/config/AssetsConfig';
import DrawerNavigation from './src/navigation/DrawerNavigation';
import AuthNavigationStack from './src/navigation/AuthNavigation';
import UserProvider, {UserConsumer} from './context/UserContext';
import {PermissionsAndroid} from 'react-native';

import {ErrorBoundary} from './src/ErrorBoundary';
import { notificationListener, requestUserPermission } from './src/utils/fcm';

const App = () => {
  console.log('AAAApppppppp')
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage, 'remoteMessage');
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    registerAppWithFCM();
    requestUserPermission();
    notificationListener();
  }, []);

  const registerAppWithFCM = async () => {
    await messaging().registerDeviceForRemoteMessages();
  };

  return (
    <>
      {/* <ErrorBoundary> */}
      <ToastProvider
        offset={-100}
        animationType="zoom-in"
        placement="center"
        icon={
          <Image
            source={assets.vlogo}
            style={{width: 24, height: 24, tintColor: '#fff'}}
          />
        }
        normalColor={'#000'}
        duration={2000}
        textStyle={{paddingRight: 40}}>
        <UserProvider>
          {loading ? (
            <View style={[styles.container, {backgroundColor: '#000'}]}>
              <StatusBar barStyle="light-content" backgroundColor="#161415" />
              {/* <Image source={assets.splash} style={styles.logo} /> */}
              <Image source={assets.logoWhite} style={{width:170,height:80,tintColor:'#fff'}} /> 
            </View>
          ) : (
            <UserConsumer>
              {({auth}) => {
                console.log(auth, 'authhh');
                return (
                  <NavigationContainer>
                    {auth === true && <ScreenNavigationStack />}
                    {!auth && <AuthNavigationStack />}
                  </NavigationContainer>
                );
              }}
            </UserConsumer>
          )}
        </UserProvider>
      </ToastProvider>
      {/* </ErrorBoundary> */}
    </>
  );
};

export default App;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  logo: {
    position: 'absolute',
    resizeMode: 'cover',
    left: 0,
    right: 0,
    top: 0,
    height: height,
    width: width,
    bottom: -2,
    zIndex: 2,
  },
});
