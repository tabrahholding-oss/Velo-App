import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {assets} from '../../config/AssetsConfig';
import { API_SUCCESS } from '../../config/ApiConfig';
import { Badge } from 'react-native-paper';

const width = Dimensions.get('window').width;

export const CartItem1 = ({item, onPress,  addClick, minusClick}) => {

    const [addons, setAddons] = useState(item.attributes.addons ? JSON.parse(item.attributes.addons) : [])
  return (
    <TouchableOpacity style={styles.box} onPress={() => onPress(item)}>
      <View style={styles.imgBox}>
        <Image source={{uri:API_SUCCESS +'/'+ item?.attributes?.image}} style={styles.itemImage} />
      </View>
      <View style={styles.contBox}>
        <Text style={styles.title}>{item?.attributes?.optional_item}</Text>
        {item?.attributes?.notes ? 
        <Text style={{fontSize:10,marginTop:5}}>{item?.attributes?.notes}</Text>
        :
        <></>
        }


        {addons?.length > 0 &&
          <View style={{display:'flex',flexDirection:'row',marginTop:5}}>
            {addons.map((i,index) => (
              <Badge
                  style={[
                    styles.bedge,
                    {
                      backgroundColor: '#fff',
                      color: '#000',
                      paddingHorizontal: 8,
                      borderWidth:0.5,
                      height:15,
                      fontSize:9,lineHeight:13,
                      fontWeight:'600',
                      marginRight:2
                    },
                  ]}>
                {i.name}
            </Badge>
            ))}
          </View>
        }

        <View style={styles.priceBox}>
          <Text style={styles.price}>{item?.attributes?.total_price} QAR</Text>
          <View style={styles.addToCart}>
            <TouchableOpacity style={styles.decrementBox} onPress={() => minusClick(item)}>
              <Text style={styles.decrText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qty}>{item?.attributes?.quantity}</Text>
            <TouchableOpacity style={styles.incrementBox} onPress={() => addClick(item)}>
              <Text style={styles.incText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    textAlign: 'center',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    width: width - 60,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor:'#f2f2f2',
    borderRadius:16,
  },
  imgBox: {
    width: 80,
    height: 80,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginRight: 15,
  },

  title: {
    fontSize: 14,
    lineHeight:16,
    textTransform: 'uppercase',
    marginTop: 3,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
    width:width - 180
  },
  price: {
    fontSize: 14,
    marginVertical: 5,
    lineHeight:24,
    marginRight: 20,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius:10,
    alignSelf: 'center',
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
    color: '#161415',
    fontFamily: 'Gotham-Medium',
  },
});
