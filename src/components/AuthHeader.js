import {Image, StyleSheet, Text, View} from 'react-native';
import {assets} from '../config/AssetsConfig';

export const AuthHeader = ({title}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row:{
    marginTop:10
  },
  title: {
    fontSize: 24,
    color:'#161415',
    textTransform:'uppercase',
    fontFamily:'Gotham-Book',
  },
});
