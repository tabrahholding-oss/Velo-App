import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-paper';

export const Input = props => {
  const [focus, setFocus] = useState(false);

  return (
    <View style={styles.row}>
      <TextInput
        mode={'Flat'}
        onFocus={() => setFocus(!focus)}
        style={styles.input}
        onChangeText={text => props.onChang(text)}
        activeOutlineColor="#161415"
        outlineColor="transparent"
        contentStyle={{color: '#161415',fontFamily:'Gotham-Medium' }}
        textColor="#161415"
        theme={{colors: {primary: '#161415'}}}
        value={props.value ? props.value : ''}
        {...props}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginTop: 0,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'transparent',
    color: '#161415',
    borderBottomColor: '#161415',
    borderBottomWidth: 1,
    textTransform: 'uppercase',
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
  },
});
