import {createStackNavigator} from '@react-navigation/stack';

import DrawerNavigation from './DrawerNavigation';
import Splash from '../screens/Auth/Splash';
import ProfileEdit from '../screens/Profile/ProfileEdit';
import { useNavigation } from '@react-navigation/native';
import { Image, TouchableOpacity } from 'react-native';
import { assets } from '../config/AssetsConfig';
import { Provider as PaperProvider, Provider } from 'react-native-paper';
import Buy from '../screens/Buy';


const ScreenNavigationStack = ({navigation}) => {
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

  return (
    <Provider>
    <Stack.Navigator>
       {/* <Stack.Screen
        name={'Splash'}
        component={Splash}
        options={{
          headerShown: false,
        }}
      /> */}
      <Stack.Screen
        name={'Drawer'}
        component={DrawerNavigation}
        options={{
          headerShown: false,
          cardStyle: {backgroundColor: '#ffffff'},
        }}
      />
      <Stack.Screen
        name={'ProfileEdit'}
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
      {/* <Stack.Screen
        name={'buy'}
        component={Buy}
       options={{
          headerStyle: {
            borderBottomWidth: 1,
            borderColor: '#000',
          },
          headerLeft: () => <BackIcon />,
          headerTitle: props => <></>,
          headerRight: () => <></>,
        }}
      /> */}
    </Stack.Navigator>
    </Provider>
  );
};

export default ScreenNavigationStack;
