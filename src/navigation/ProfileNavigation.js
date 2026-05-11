import React from 'react';
import Profile from '../screens/Profile';
import ProfileEdit from '../screens/Profile/ProfileEdit';
import {useNavigation} from '@react-navigation/native';
import {
  TouchableOpacity,
  Image,
  Dimensions,
  View,
  Platform,
} from 'react-native';
import {assets} from '../config/AssetsConfig';
import ChangePassword from '../screens/Profile/ChangePassword';
import MyWallet from '../screens/Profile/MyWallet';
import Journey from '../screens/Journey';
import Buy from '../screens/Buy';
import WalletPay from '../screens/Profile/WalletPay';
const {createStackNavigator} = require('@react-navigation/stack');
const width = Dimensions.get('window').width;

const ProfileNavigation = ({navigation}) => {
  const Stack = createStackNavigator();

  function BackIcon() {
    const navigation = useNavigation();
    return (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image
          source={assets.back}
          style={{width: 24, height: 24, marginLeft: 15}}
        />
      </TouchableOpacity>
    );
  }
  function EditIcon() {
    const navigation = useNavigation();
    return (
      <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
        <Image
          source={assets.edit}
          style={{width: 24, height: 24, marginRight: 15}}
        />
      </TouchableOpacity>
    );
  }
  function LogoTitle() {
    return (
      <View
        style={{
          // width:width - 105,
          width: Platform.OS === 'android' ? width - 105 : width - 138,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image source={assets.logo} style={{width: 60, height: 24}} />
      </View>
    );
  }
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'Profile'}
        component={Profile}
        options={{
          headerShown: true,
          cardStyle: {backgroundColor: '#ffffff'},
          headerStyle: {
            borderBottomWidth: 1,
            borderColor: '#000',
          },
          headerLeft: () => <BackIcon />,
          headerTitle: props => <LogoTitle {...props} />,
          headerRight: () => <EditIcon />,
        }}
      />

      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEdit}
        options={{
          headerStyle: {
            borderBottomWidth: 1,
            borderColor: '#000',
          },
          headerLeft: () => <BackIcon />,
          headerTitle: props => <></>,
          headerRight: () => <></>,
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{
          headerStyle: {
            borderBottomWidth: 1,
            borderColor: '#000',
          },
          headerLeft: () => <BackIcon />,
          headerTitle: props => <></>,
          headerRight: () => <></>,
        }}
      />

      <Stack.Screen
        name="MyWallet"
        component={MyWallet}
        options={{
          headerStyle: {
            borderBottomWidth: 1,
            borderColor: '#000',
          },
          headerLeft: () => <BackIcon />,
          headerTitle: props => <LogoTitle {...props} />,
        }}
      />
      <Stack.Screen
        name="WalletPay"
        component={WalletPay}
        options={{
          headerStyle: {
            borderBottomWidth: 1,
            borderColor: '#000',
          },
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
export default ProfileNavigation;
