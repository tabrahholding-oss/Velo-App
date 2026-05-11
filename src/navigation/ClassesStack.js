import { Image, TouchableOpacity } from 'react-native';
import ClassDetail from '../screens/ClassDetail';
import Classes from '../screens/Classes';
import { assets } from '../config/AssetsConfig';
import { useNavigation } from '@react-navigation/native';

const {createStackNavigator} = require('@react-navigation/stack');

const ClassesStack = ({navigation}) => {
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

    {/* <Stack.Screen
        name="Classes"
        component={Classes}
        options={{
          headerShown:false
        }}
      /> */}

      <Stack.Screen
        name={'ClassDetail'}
        component={ClassDetail}
        options={{
          cardStyle: {backgroundColor: '#ffffff'},
          headerShown:false
        }}
      />

      

    </Stack.Navigator>
  );
};
export default ClassesStack;
