import {
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ClassDetail from '../screens/ClassDetail';
import Classes from '../screens/Classes';
import {assets} from '../config/AssetsConfig';
import {useNavigation} from '@react-navigation/native';
import DoubleJoy from '../screens/DoubleJoy';
import DoubleJoyDetail from '../screens/DoubleJoy/detail';
import DoubleJoyCheckout from '../screens/DoubleJoy/DoubleJouCheckout';
import Home from '../screens/Home';
import MyOrder from '../screens/DoubleJoy/myOrder';
import DoubleJoypay from '../screens/DoubleJoy/doubleJoypay';

const {createStackNavigator} = require('@react-navigation/stack');
const width = Dimensions.get('window').width;

const DoubleJoyStack = ({navigation}) => {
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

  function BackIconFromOrder(){
    const navigation = useNavigation();
    return (
      <TouchableOpacity onPress={() => navigation.navigate('DoubleJoy')}>
        <Image
          source={assets.back}
          style={{width: 24, height: 24, marginLeft: 15}}
        />
      </TouchableOpacity>
    );
  }

  function LogoTitle() {
    return (
      <View
        style={{
          // width: width - 30,
          width: Platform.OS === 'android' ? width - 30 : width - 138,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image source={assets.logo} style={{width: 60, height: 24}} />
      </View>
    );
  }

  function DoubleJoyTitle() {
    return (
      <View
        style={{
          width: Platform.OS === 'android' ? width - 105 : width - 138,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{fontFamily: 'Gotham-Medium', color: '#161415', fontSize: 18}}>
          run of the mill
        </Text>
      </View>
    );
  }
  function MyOrderTitle() {
    return (
      <View
        style={{
          width: Platform.OS === 'android' ? width - 105 : width - 138,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{fontFamily: 'Gotham-Medium', color: '#161415', fontSize: 18}}>
          MY ORDERS
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DoubleJoy"
        component={DoubleJoy}
        options={{
          headerLeft: () => <BackIcon />,
          headerTitle: props => <DoubleJoyTitle />,
        }}
      />
      <Stack.Screen
        name="DoubleJoyDetail"
        component={DoubleJoyDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DoubleJoyCheckout"
        component={DoubleJoyCheckout}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyOrder"
        component={MyOrder}
        options={{
          headerLeft: () => <BackIconFromOrder />,
          headerTitle: props => <MyOrderTitle />,
        }}
      />

      <Stack.Screen
        name="DoubleJoyPay"
        component={DoubleJoypay}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
export default DoubleJoyStack;
