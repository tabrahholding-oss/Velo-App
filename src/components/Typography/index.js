import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {assets} from '../../config/AssetsConfig';

export const Heading = ({children, style}) => {
  return <Text style={[styles.Heading, style]}>{children}</Text>;
};
export const Heading2 = ({children}, props) => {
  return <Text style={[styles.Heading2, props.style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  Heading: {
    textTransform: 'uppercase',
    fontSize: 14,
    marginHorizontal:5,
    fontFamily:'Gotham-Book',
    color:'#000',
  },
  Heading2: {
    textTransform: 'uppercase',
    fontSize: 16,
  },
});
