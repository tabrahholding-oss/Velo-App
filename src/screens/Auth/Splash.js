import React, {useEffect} from 'react';
import {assets} from '../../config/AssetsConfig';

const {
  View,
  StatusBar,
  Image,
  StyleSheet,
  Dimensions,
  BackHandler,
} = require('react-native');
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
      
      AsyncStorage.getItem('user', (err, result) => {
        // setTimeout(() => {
          if (result) {
            navigation.navigate('Drawer');
          } else {
            navigation.navigate('Welcome');
          }
        // }, 3000);
      });
   
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  }, [navigation]);

  const handleBackButton = () => {
    switch (navigation.current.state) {
      case 'Welcome':
        BackHandler.exitApp();
        break;
      default:
        navigation.goBack();
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#161415" />
      
      <Image source={assets.splash} style={styles.logo} />
    </View>
  );
};
export default Splash;

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
