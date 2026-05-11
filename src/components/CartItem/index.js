import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {RoundedDarkButton} from '../Buttons';
import {assets} from '../../config/AssetsConfig';
import { API_BASE, API_SUCCESS } from '../../config/ApiConfig';

const width = Dimensions.get('window').width;

export const CartItem = ({item, onPress, addClick, minusClick}) => {



  return (
    <TouchableOpacity style={styles.box} onPress={() => onPress(item)}>
      <Image source={{uri:API_SUCCESS +'/'+ item?.attributes?.image}} style={styles.itemImage} />
      <Text style={styles.title}>{item.attributes.name}</Text>
      <View style={styles.priceBox}>
        <Text style={styles.price}>{item.attributes?.price} QAR</Text>
        <View style={styles.addToCart}>
          {item.quantity > 0 &&
          <>
            <TouchableOpacity style={styles.decrementBox} onPress={() => minusClick(item)}>
              <Text style={styles.decrText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
          </>
          }
          <TouchableOpacity style={styles.incrementBox} onPress={() => addClick(item)}>
            <Text style={styles.incText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: Platform.OS === 'android' ? '#f2f2f2' : '#fff',
    textAlign: 'center',
    padding: 10,
    borderRadius: 24,
    shadowColor: '#161415',
    shadowOffset: {width: -1, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginVertical: 20,
    marginHorizontal: 10,
    width: width / 2 - 40,
    //borderWidth:1,
    //borderColor:'#ddd'
  },
  title: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 10,
    height:30,
    lineHeight:15,
    color:'#161415',
    fontFamily:'Gotham-Medium'
  },
  price: {
    fontSize: 14,
    marginVertical: 7,
    color:'#161415',
    fontFamily:'Gotham-Medium',
    lineHeight:24,
  },
  itemImage: {
    width: '100%',
    height: 110,
    alignSelf: 'center',
    borderRadius:10,
  },
  priceBox: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  addToCart: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    height: 24,
    borderRadius: 6,
    marginTop: 7,
  },
  incrementBox: {
    backgroundColor: '#161415',
    padding: 3,
    height: 24,
    width: 24,
    textAlign: 'center',
    borderRadius: 6,
  },
  incText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    width: '100%',
    textAlign: 'center',
    lineHeight: 17,
  },
  decrementBox: {
    backgroundColor: '#161415',
    padding: 3,
    height: 24,
    width: 24,
    textAlign: 'center',
    borderRadius: 6,
  },
  decrText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    width: '100%',
    textAlign: 'center',
    lineHeight: 17,
  },
  qty: {
    textAlign: 'center',
    lineHeight: 24,
    width: 24,
    color:'#161415',
    fontFamily:'Gotham-Medium'
  },
});
