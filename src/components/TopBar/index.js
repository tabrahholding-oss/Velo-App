import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {assets} from '../../config/AssetsConfig';
import { useNavigation } from '@react-navigation/native';

const TopBar = () => {

  const navigation = useNavigation();

  return (
    <>
    {/* <DrawerNavigation /> */}
      <View style={styles.box}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image source={assets.bell} style={styles.bar} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={assets.logo} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={assets.bell} style={styles.bell} />
        </TouchableOpacity>
      </View>
    </>
  );
};
export default TopBar;

const styles = StyleSheet.create({
  box: {
    display: 'flex',
    padding: 10,
    paddingTop: Platform.OS === 'ios' ? 60 : 10,
    borderBottomWidth: 1,
    paddingBottom: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  logo: {
    width: 60,
    height: 24,
  },
  bar: {
    height: 24,
    width: 24,
  },
  bell: {
    width: 24,
    height: 24,
  },
});
