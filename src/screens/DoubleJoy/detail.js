import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
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
  RoundedThemeButton,
  RoundedThemeButton2,
} from '../../components/Buttons';
import {FlatList} from 'react-native-gesture-handler';
import {assets} from '../../config/AssetsConfig';
import ScaledImage from '../../components/ScaleImage';
import {useNavigation} from '@react-navigation/native';
import {API_SUCCESS} from '../../config/ApiConfig';
import {Input} from '../../components/Input/input';
import {UserContext} from '../../../context/UserContext';
import {DoubleJoyController} from '../../controllers/DoubleJoyController';
import PageLoader from '../../components/PageLoader';
import {ModalView} from '../../components/ModalView';
import {TextInput} from 'react-native-paper';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const DoubleJoyDetail = props => {
  const navigation = useNavigation();
  const [item, setItem] = useState(props.route?.params?.item);
  const [refresh, setRefresh] = useState(false);
  const {getToken} = useContext(UserContext);
  const [ingredients, setIngredients] = useState([]);
  const [noteModal, setNoteModal] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [addons, setAddons] = useState([]);
  const [addonPrice, setAddonPrice] = useState(0);

  useEffect(() => {
    console.log(props.route.params.item, 'props');
    const ing = JSON.parse(props.route.params.item.attributes.ingredients);
    setIngredients(ing);
    setItem(props.route?.params?.item);

    if (props.route.params.item?.cartAddon) {
      let allAddons = JSON.parse(props.route.params.item.cartAddon);
      setAddons(allAddons);
      let pr = 0;
      allAddons.map((i, index) => {
        pr = pr + JSON.parse(i.price);
      });
      setAddonPrice(pr);
    }
  }, [props]);

  useEffect(() => {}, [refresh, item]);

  const addClick = async () => {
    const token = await getToken();
    const instance = new DoubleJoyController();

    console.log(item, 'item');
    setLoading(true);
    const result = await instance.addItem(
      token,
      item.id,
      item.quantity + 1,
      note,
      addons,
    );
    console.log(result, 'addcart');
    if (result.status === 'success') {
      setRefresh(!refresh);
      let newItem = props.route.params.item;
      newItem.quantity = newItem.quantity + 1;
      setItem(newItem);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const minusClick = async () => {
    const token = await getToken();
    const instance = new DoubleJoyController();

    if (item.quantity > 1) {
      setLoading(true);
      const result = await instance.addItem(
        token,
        item.id,
        item.quantity - 1,
        note,
        addons,
      );
      console.log(result, 'addcart');
      if (result.status === 'success') {
        let newItem = props.route.params.item;
        newItem.quantity = newItem.quantity - 1;
        setItem(newItem);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(true);
      const result = await instance.removeItem(token, item.id);
      console.log(result, 'remove');
      if (result.status === 'success') {
        let newItem = props.route.params.item;
        newItem.quantity = newItem.quantity - 1;
        setItem(newItem);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const updateItem = async allAddon => {
    if (item.quantity > 0) {
      const token = await getToken();
      const instance = new DoubleJoyController();

      console.log(item, 'item');
      setLoading(true);
      const result = await instance.addItem(
        token,
        item.id,
        item.quantity,
        note,
        allAddon,
      );
      if (result.status === 'success') {
        setRefresh(!refresh);

        console.log(addons, 'addons');

        let newItem = props.route.params.item;
        setItem(newItem);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const addAddon = async addItem => {
    let allAddons = [...addons, {name: addItem.name, price: addItem.price}];
    setAddons(allAddons);

    let pr = 0;
    [...addons, {name: addItem.name, price: addItem.price}].map((i, index) => {
      pr = pr + JSON.parse(i.price);
    });
    setAddonPrice(pr);

    updateItem(allAddons);
  };

  const removeAddon = async addItem => {
    const allAddon = addons.filter(i => i.name !== addItem.name);
    setAddons(allAddon);

    let pr = 0;
    allAddon.map((i, index) => {
      pr = pr + JSON.parse(i.price);
    });
    setAddonPrice(pr);

    updateItem(allAddon);
  };

  return (
    <>
      <PageLoader loading={loading} />
      <View style={styles.mainContainer}>
        <View
          style={{
            paddingHorizontal: 10,
            display: 'flex',
            justifyContent: 'center',
          }}>
          <Text style={styles.mainHeading}>run of the mill</Text>
          <TouchableOpacity
            style={{marginTop: Platform.OS === 'android' ? -20 : -20}}
            onPress={() => navigation.navigate('DoubleJoy')}>
            <Image source={assets.back} style={{width: 20, height: 20}} />
          </TouchableOpacity>
          <Image
            source={{uri: API_SUCCESS + '/' + item?.attributes?.image}}
            style={styles.itemImage}
          />
        </View>
        <View style={styles.detailBox}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{height: height / 2 + 200}}>
            <>
              <View style={styles.detailInnerBox}>
                <View
                  style={{
                    marginBottom: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <Text style={styles.title}>{item.attributes?.name}</Text>
                    <Text style={styles.subTitle}>Ingredients</Text>
                  </View>
                  <View>
                    <Text style={styles.title}>{item.attributes?.price}QR</Text>
                  </View>
                </View>
                <Text style={styles.subTitle}>
                  {item.attributes?.description}
                </Text>
              </View>
              <View style={styles.cartBox}>
                {ingredients?.length > 0 && (
                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}>
                    {ingredients?.map((i, index) => (
                      <>
                      {i.value && 
                        <View style={{marginTop: 10, paddingHorizontal: 10}}>
                          <View style={styles.greyBox}>
                            <Text style={styles.unitTitle}>{i.value}</Text>
                            <Text style={styles.unit}>{i.name}</Text>
                          </View>
                        </View>
                      }
                      </>
                    ))}
                  </View>
                )}
                {item.attributes.addons?.length > 0 && (
                  <View>
                    <Text style={styles.addonHeading}>Add Ons</Text>

                    <View
                      style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}>
                      {item.attributes.addons?.map((addItem, index) => (
                        <View style={{marginTop: 10}}>
                          <View
                            style={[
                              styles.greyBox1,
                              addons.filter(i => i.name === addItem.name)
                                .length === 0
                                ? {
                                    borderWidth: 1,
                                    borderColor: '#888',
                                    backgroundColor: '#fff',
                                  }
                                : {borderWidth: 1, borderColor: '#888'},
                            ]}>
                            <Text style={styles.addonTitle}>
                              {addItem.name}
                            </Text>
                            <View
                              style={{display: 'flex', flexDirection: 'row'}}>
                              <Text style={styles.addonTitle}>
                                {addItem.price} QR
                              </Text>

                              {addons.filter(i => i.name === addItem.name)
                                .length ? (
                                <RoundedDarkButton2
                                  label="X"
                                  onPress={() => removeAddon(addItem)}
                                  style={{
                                    paddingHorizontal: 10,
                                    backgroundColor: '#888',
                                  }}
                                />
                              ) : (
                                <RoundedDarkButton2
                                  label="+"
                                  onPress={() => addAddon(addItem)}
                                  style={{paddingHorizontal: 10}}
                                />
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View
                  style={{
                    paddingHorizontal: '15%',
                    marginTop: item?.quantity < 0 ? 20 : 0,
                  }}>
                  {item?.quantity > 0 && (
                    <View style={styles.addToCart}>
                      <TouchableOpacity
                        style={styles.decrementBox}
                        onPress={() => minusClick()}>
                        <Text style={styles.decrText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qty}>{item?.quantity}</Text>
                      <TouchableOpacity
                        style={styles.incrementBox}
                        onPress={() => addClick()}>
                        <Text style={styles.incText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {note ? (
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          margin: 10,
                          width: width - 200,
                          color: '#161415',
                        }}
                        ellipsizeMode="tail"
                        numberOfLines={1}>
                        <Text style={{fontWeight: '700', color: '#000'}}>
                          Note:
                        </Text>{' '}
                        {note}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setNoteModal(true)}
                        style={{height: 16, marginTop: 12}}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Gotham-Black',
                            color: '#000',
                          }}>
                          EDIT
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <RoundedDarkButton2
                      style={styles.buyBtn1}
                      label={'ADD NOTE TO ORDER'}
                      onPress={() => setNoteModal(true)}
                    />
                  )}

                  {item?.quantity > 0 ? (
                    <RoundedDarkButton2
                      style={styles.buyBtn}
                      label={
                        <View
                          style={{
                            display: 'flex',
                            width: '100%',
                            paddingHorizontal: 10,
                            paddingTop: 2,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={{color: '#fff', height: 24}}>
                            GO TO CART
                          </Text>
                          <Text style={{color: '#fff', height: 24}}>
                            {(item.attributes?.price + addonPrice) *
                              item.quantity}
                            QAR{' '}
                          </Text>
                        </View>
                      }
                      onPress={() => navigation.navigate('DoubleJoyCheckout')}
                    />
                  ) : (
                    <RoundedDarkButton2
                      style={styles.buyBtn}
                      label={'ADD TO CART'}
                      onPress={() => addClick()}
                    />
                  )}
                </View>
              </View>
            </>
          </ScrollView>
        </View>
      </View>
      <ModalView
        visible={noteModal}
        heading="Note"
        setVisible={() => setNoteModal(false)}
        style={{
          height: 'auto',
          marginTop: 260,
          justifyContent: 'flex-end',
          marginBottom: 0,
          zIndex: 999,
        }}>
        <View style={styles.summeryBox}>
          <View style={styles.modalTotalBox}>
            <View>
              <TextInput
                mode={'Flat'}
                style={styles.input}
                onChangeText={text => setNote(text)}
                activeOutlineColor="#161415"
                outlineColor="transparent"
                contentStyle={{color: '#161415', fontFamily: 'Gotham-Medium'}}
                textColor="#161415"
                theme={{colors: {primary: '#161415'}}}
                value={note ? note : ''}
                multiline={true}
              />
            </View>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 15,
            }}>
            <RoundedThemeButton2
              label={'Cancel'}
              onPress={() => setNoteModal(false)}
              style={{width: 100, marginLeft: 5, marginTop: 5}}
            />
            <RoundedGreyButton2
              label={'Save'}
              onPress={() => setNoteModal()}
              style={{width: 100, marginLeft: 5, marginTop: 5}}
            />
          </View>
        </View>
      </ModalView>
    </>
  );
};
export default DoubleJoyDetail;

const styles = StyleSheet.create({
  mainHeading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: Platform.OS === 'android' ? 10 : 60,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  itemImage: {
    width: width,
    height: 280,
    alignSelf: 'center',
    marginTop: 10,
  },
  mainContainer: {
    backgroundColor: '#e2e3e5',
    height: '100%',
    display: 'flex',
  },
  addToCart: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    height: 24,
    borderRadius: 6,
    width: 60,
    alignSelf: 'center',
    marginTop: 20,
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
  addonHeading: {
    color: '#161415',
    fontFamily: 'Gotham-Medium',
    fontSize: 16,
    marginVertical: 10,
    marginLeft: 10,
    marginTop: 15,
  },
  qty: {
    textAlign: 'center',
    lineHeight: 24,
    width: 24,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
  },
  buyBtn: {
    marginTop: 5,
    backgroundColor: '#161415',
    width: '100%',
    height: 26,
  },
  buyBtn1: {
    marginTop: 20,
    backgroundColor: '#161415',
    width: '100%',
  },
  detailBox: {
    backgroundColor: '#f2f2f2',
    display: 'flex',
    flex: 1,
    bottom: 0,
    paddingTop: 20,
    marginTop: -35,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  cartBox: {
    backgroundColor: '#fff',
    display: 'flex',
    flex: 1,
    bottom: 0,
    paddingTop: 10,
    marginTop: 25,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  greyBox: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    textAlign: 'center',
    borderRadius: 5,
    width: 70,
  },
  greyBox1: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    textAlign: 'center',
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 50,
  },
  addonTitle: {
    fontSize: 12,
    fontFamily: 'Gotham-Medium',
    marginTop: 6,
    paddingRight: 10,
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
  modalTotalBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 20,
  },
  unitTitle: {
    fontSize: 16,
    fontFamily: 'Gotham-Medium',
    color: '#000000',
    textAlign: 'center',
  },
  summeryBox: {
    width: width - 70,
    alignSelf: 'center',
  },
  unit: {
    fontSize: 10,
    fontFamily: 'Gotham-Medium',
    color: '#000000',
    textAlign: 'center',
    marginTop: 2,
  },
  ingName: {
    fontSize: 11,
    fontFamily: 'Gotham-Book',
    color: '#000000',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 10,
  },
  detailInnerBox: {
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
    marginBottom: 5,
    color: '#161415',
    paddingRight: 10,
    lineHeight: 18,
  },
  subTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    lineHeight: 14,
    fontFamily: 'Gotham-Book',
    color: '#161415',
  },
});
