import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Splash from '../screens/Auth/Splash';
import Welcome from '../screens/Auth/Welcome';
import Login from '../screens/Auth/Login';
import SignUp from '../screens/Auth/Signup';
import Forgot from '../screens/Auth/ForgotPassword';
import {Dimensions, Image, Platform, View} from 'react-native';
import {assets} from '../config/AssetsConfig';
import {useNavigation} from '@react-navigation/native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Verify from '../screens/Auth/Verify';
import ChangePassword from '../screens/Auth/ChangePassword';

const width = Dimensions.get('window').width;

function LogoTitle() {
  return (
    <View
      style={{
        width: Platform.OS === 'android' ? width - 30 : width - 138,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Image source={assets.logo} style={{width: 60, height: 24}} />
    </View>
  );
}

function BackIcon() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
      <Image
        source={assets.back}
        style={{width: 24, height: 24, marginLeft: 15}}
      />
    </TouchableOpacity>
  );
}

const AuthNavigationStack = ({navigation}) => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
    
      <Stack.Screen
        name={'Welcome'}
        component={Welcome}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'Login'}
        component={Login}
        options={{
          headerStyle: {
            borderBottomWidth:1,
            borderColor:'#000'
          },
          headerLeft: () => <></>,
          headerRight: () => <></>,
          headerTitle: props => <LogoTitle {...props} />,
        }}
      />
      <Stack.Screen
        name={'Verify'}
        component={Verify}
        options={{
          headerStyle: {
            borderBottomWidth:1,
            borderColor:'#000'
          },
          headerLeft: () => <></>,
          headerRight: () => <></>,
          headerTitle: props => <LogoTitle {...props} />,
        }}
      />
      
      <Stack.Screen
        name={'Signup'}
        component={SignUp}
        options={{
          headerStyle: {
            borderBottomWidth:1,
            borderColor:'#000'
          },
          headerLeft: () => <></>,
          headerRight: () => <></>,
          headerTitle: props => <LogoTitle {...props} />,
        }}
      />
      <Stack.Screen
        name={'Forgot'}
        component={Forgot}
        options={{
          headerLeft: () => <></>,
          headerRight: () => <></>,
          headerTitle: props => <LogoTitle {...props} />,
        }}
      />
       <Stack.Screen
        name={'ResetPassword'}
        component={ChangePassword}
        options={{
          headerLeft: () => <></>,
          headerRight: () => <></>,
          headerTitle: props => <LogoTitle {...props} />,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigationStack;
