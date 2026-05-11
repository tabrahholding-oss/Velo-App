import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const TraingBox = props => {
  return (
    <TouchableOpacity style={styles.box} {...props}>
      <ImageBackground source={props.bg} style={styles.imgBg}>
        <Text style={styles.heading}>{props.title}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  heading: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 21,
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
  },
  imgBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  box: {
    height: 95,
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 2,
    borderColor: '#ddd',
  },
});
