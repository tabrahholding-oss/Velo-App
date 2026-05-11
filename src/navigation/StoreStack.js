import {Image, TouchableOpacity} from 'react-native';
import {assets} from '../config/AssetsConfig';
import {useNavigation} from '@react-navigation/native';
import Store from '../screens/Store';

const {createStackNavigator} = require('@react-navigation/stack');

const StoreStack = ({navigation}) => {
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

  function LogoTitle() {
    return <Image source={assets.logo} style={{width: 60, height: 24}} />;
  }

  return (
    <Stack.Navigator>
    
      <Stack.Screen
        name="Store"
        component={Store}
        options={{
          headerLeft: () => <BackIcon />,
          headerTitle: props => <LogoTitle {...props} />,
        }}
      />
    </Stack.Navigator>
  );
};
export default StoreStack;
