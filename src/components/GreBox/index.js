import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

export const GreyBox = props => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: props.active ? '#161415' : '#f2f2f2',
        width: '80%',
        alignSelf: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginVertical: 5,
        borderRadius: 12,
      }}
      {...props}
      onPress={() => props.onPress()}>
      <Text
        style={{
          color: props.active ? '#fff' : '#161415',
          fontSize: 16,
          textTransform: 'uppercase',
          fontFamily:'Gotham-Medium',
          ...props.textStyle,
        }}>
        {props.label}
      </Text>
    </TouchableOpacity>
  );
};
