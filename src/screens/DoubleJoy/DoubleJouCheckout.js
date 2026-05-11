import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {
  RoundedDarkButton,
  RoundedDarkButton2,
  RoundedGreyButton,
  RoundedGreyButton2,
  RoundedOutlineButton,
  RoundedThemeButton,
  RoundedThemeButton2,
} from '../../components/Buttons';
import {FlatList} from 'react-native-gesture-handler';
import {useState} from 'react';
import {PackageItem} from '../../components/PackageItem';
import {CartItem} from '../../components/CartItem';
import {useNavigation} from '@react-navigation/native';
import {assets} from '../../config/AssetsConfig';
import {CartItem1} from '../../components/CartItem/CartItem1';
import {ModalView} from '../../components/ModalView';
import {UserContext} from '../../../context/UserContext';
import {DoubleJoyController} from '../../controllers/DoubleJoyController';
import PageLoader from '../../components/PageLoader';
import {Input} from '../../components/Input/input';
import {TextInput} from 'react-native-paper';
import {transparent} from 'react-native-paper/lib/typescript/src/styles/themes/v2/colors';

const height = Dimensions.get('window').height;

const DoubleJoyCheckout = () => {
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const {getToken} = useContext(UserContext);
  const [cart, setCart] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getAllData();
    });
    return focusHandler;
  }, [navigation]);

  useEffect(() => {
    getAllData();
  }, [refresh]);

  const getAllData = async () => {
    setLoading(true);
    const token = await getToken();
    console.log(token, 'token');
    const instance = new DoubleJoyController();
    const result = await instance.getMyCart(token);
    setLoading(false);
    let totalamount = 0;
    result.relation.items.map((itemnew, index) => {
      totalamount = totalamount + itemnew?.attributes?.total_price;
    });
    setTotal(totalamount);
    setCart(result);
  };

  const selectItem = item => {
    navigation.navigate('DoubleJoyDetail');
  };

  const addClick = async item => {
    const token = await getToken();
    const instance = new DoubleJoyController();
    let addons = item.attributes.addons?.length
      ? JSON.parse(item.attributes.addons)
      : [];

    console.log(item, 'item');
    setLoading(true);
    const result = await instance.addItem(
      token,
      item.attributes.optional_item_id,
      item.attributes.quantity + 1,
      item.attributes.notes,
      addons,
    );
    console.log(result, 'addcart');
    if (result.status === 'success') {
      setRefresh(!refresh);
    } else {
      setLoading(false);
    }
  };
  const minusClick = async item => {
    const token = await getToken();
    const instance = new DoubleJoyController();
    let addons = item.attributes.addons?.length
      ? JSON.parse(item.attributes.addons)
      : [];

    if (item.attributes.quantity > 1) {
      setLoading(true);
      const result = await instance.addItem(
        token,
        item.attributes.optional_item_id,
        item.attributes.quantity - 1,
        item.attributes.notes,
        addons,
      );
      console.log(result, 'addcart');
      if (result.status === 'success') {
        setRefresh(!refresh);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(true);
      console.log(item.attributes.optional_item_id, 'idd');
      const result = await instance.removeItem(
        token,
        item.attributes.optional_item_id,
      );
      console.log(result, 'remove');
      if (result.status === 'success') {
        setRefresh(!refresh);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <PageLoader loading={loading} />
      <PageContainer>
        <View style={{paddingHorizontal: 10}}>
          <View
            style={{
              paddingHorizontal: 10,
              display: 'flex',
              justifyContent: 'center',
              marginTop: Platform.OS === 'android' ? 0 : 50,
            }}>
            <Text style={styles.mainHeading}>run of the mill</Text>
            <TouchableOpacity
              style={{marginTop: Platform.OS === 'android' ? -20 : 0}}
              onPress={() => navigation.navigate('DoubleJoy')}>
              <Image source={assets.back} style={{width: 20, height: 20}} />
            </TouchableOpacity>
          </View>

          <View style={styles.classesList}>
            <FlatList
              data={cart?.relation?.items}
              pagingEnabled
              renderItem={({item}, key) => (
                <CartItem1
                  key={key}
                  item={item}
                  addClick={addClick}
                  minusClick={minusClick}
                  onPress={() => console.log()}
                />
              )}
            />
          </View>

          {cart?.relation?.items.length > 0 ? (
            <View style={styles.summeryBox}>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() =>
                  navigation.navigate('DoubleJoyPay', {
                    cart: cart,
                    total: total,
                  })
                }>
                <Text style={styles.btnText}>GO TO CHECKOUT</Text>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                  <Text style={styles.btnText}>{total} QAR</Text>
                  <Image source={assets.chevron} style={styles.btnImage} />
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                alignItems: 'center',
                left: 0,
                right: 0,
              }}>
              <Text>No items available in cart</Text>
              <RoundedGreyButton
                style={{marginTop: 10}}
                label={'Add Items'}
                onPress={() => navigation.navigate('DoubleJoy')}
              />
            </View>
          )}
        </View>
      </PageContainer>
    </>
  );
};
export default DoubleJoyCheckout;

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  mainHeading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
  },
  input: {
    backgroundColor: 'transparent',
    color: '#161415',
    borderColor: '#161415',
    borderWidth: 1,
    textTransform: 'uppercase',
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
    width: width - 70,
  },
  buyBtn: {
    marginBottom: 10,
    backgroundColor: '#ddd',
  },
  tab: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  tabBtn: {
    width: width / 3 - 20,
  },
  classesList: {
    marginBottom: 0,
    marginTop: 20,
    height: Platform.OS === 'ios' ? height - 200 : height - 190,
  },
  calander: {
    marginBottom: 20,
  },
  summeryBox: {
    width: width - 70,
    alignSelf: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  checkoutBtn: {
    backgroundColor: '#161415',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  btnImage: {
    width: 24,
    height: 24,
    tintColor: '#fff',
    transform: [{rotate: '-90deg'}],
  },

  methodBtn: {
    backgroundColor: '#f2f2f2',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  methodBtnImage: {
    width: 24,
    height: 24,
    tintColor: '#161415',
    transform: [{rotate: '-90deg'}],
  },
  methodBtnText: {
    color: '#161415',
    fontSize: 16,
  },
  totalBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
  },
  modalTotalBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 20,
  },
  priceText: {
    fontSize: 16,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
  },
  para: {
    fontSize: 12,
    color: '#161415',
    fontFamily: 'Gotham-Book',
    marginTop: 4,
  },
  payBtnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  payBtn: {
    backgroundColor: '#161415',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
  },
  payBtnText: {
    fontFamily: 'Gotham-Medium',
    color: '#fff',
    fontSize: 18,
    width: 70,
    textAlign: 'center',
  },
});
