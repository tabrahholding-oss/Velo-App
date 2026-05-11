import {Image, TouchableOpacity} from 'react-native';
import {assets} from '../config/AssetsConfig';
import { useNavigation } from '@react-navigation/native';

export const NotificationBell = props => {

    const navigation = useNavigation();

  return (
    <TouchableOpacity style={{position:'absolute',top:-10,zIndex:99999,right:0}} onPress={() => navigation.navigate('Notification')}>
      <Image
        source={assets.bell}
        style={{width: 24, height: 24, marginRight: 15}}
      />
    </TouchableOpacity>
  );
};
