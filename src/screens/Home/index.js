import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  StyleSheet,
  Text,
  Linking,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {Heading} from '../../components/Typography';
import {TraingBox} from '../../components/TrainingBox';
import {ExpandingDot} from 'react-native-animated-pagination-dots';
import {UserContext} from '../../../context/UserContext';
import {ClassContoller} from '../../controllers/ClassController';
import {useNavigation} from '@react-navigation/native';
import {SkeltonBlackCard} from '../../components/Skelton';
import analytics from '@react-native-firebase/analytics';
import {HappeningContoller} from '../../controllers/HappeningController';
import {API_SUCCESS} from '../../config/ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {AuthContoller} from '../../controllers/AuthController';
import remoteConfig from '@react-native-firebase/remote-config';
import {RoundedGreyButton} from '../../components/Buttons';
import {Modal, Portal} from 'react-native-paper';
import { UpdateToken } from '../../ErrorBoundary/UpdateToken';
import {NationalitySelectionModel}  from '../../components/NationalitySelectionModel';
import {ProfileController} from '../../controllers/ProfileController';
import { TermsController } from '../../controllers/TermsController';


const {width, height: windowHeight} = Dimensions.get('window');

const Home = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const {getToken, getUser} = useContext(UserContext);
  const [allData, setAllData] = useState([]);
  const [list, setList] = useState([]);
  const [scrollData, setScrollData] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [updateModal, setUpdateModal] = useState(false);
  const [doubleJoyImage, setDoubleJoyImage] = useState('');
  const [storeImage, setStoreImage] = useState('');

  const [doubleJoyStatus, setDoubleJoyStatus] = useState('');
  const [storeStatus, setStoreStatus] = useState('');

  const [doubleJoyStatusText, setDoubleJoyStatusText] = useState('');
  const [storeStatusText, setStoreStatusText] = useState('');
  const [showNationalitySelectionModel, setShowNationalitySelectionModel] = useState(false)
  const [showTermsPopUp, setShowTermsPopUp] = useState(false)
  const [termData,setTermData] = useState()
  const [userInfo, setUserInfo] = useState()

  const userCtx = useContext(UserContext);

  const navigation = useNavigation();

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getDetail()
      getData();
      getList();
      getHappening();
      getFirebaseToken();
      checkForUpdate();
      getTerms()
    });
    return focusHandler;
  }, []);

  async function checkForUpdate() {
    try {
      await remoteConfig().fetchAndActivate();
      const forceUpdateVersion = remoteConfig()
        .getValue('force_update_version')
        .asString();

      const currentAppVersion = 5.04; // Replace with your app's current version
      console.log(forceUpdateVersion, 'fupdate');
      if (forceUpdateVersion > currentAppVersion) {
        setUpdateModal(true);
        // Show a modal or message to the user indicating they need to update the app.
        // You can use a library like 'react-native-modal' for modals.
        // You can also navigate the user to the app store.
      }
    } catch (error) {
      console.error('Error fetching remote config:', error);
    }
  }

    const getTerms = async() => {
      const instance = new TermsController();
      const result = await instance.getTermsCondition();
      if(result.status === 'success'){
        setTermData(result.terms_and_conditions);
      }
    }

  const update = async () => {
    if (Platform.OS === 'android') {
      Linking.openURL(
        'https://play.google.com/store/apps/details?id=com.velo.bassem&hl=en_IN&gl=US',
      );
    } else {
      Linking.openURL('https://apps.apple.com/us/app/velo-qatar/id1510547168');
    }
  };

  const updateUserProfile = async (termsEnable) => {
    try {
          const token = await getToken();
          const instance = new ProfileController();
          let data =userInfo
          data.agreed_terms = termsEnable
          const result = await instance.updateProfile(data, token, termsEnable);
          if (result?.status === "success"){
            setShowTermsPopUp(false)
          }
    }
    catch(error){
      console.log('error. ', error)
    }
  }

  const getFirebaseToken = async () => {
    const newFirebaseToken = await messaging().getToken();
    const saveToken = await AsyncStorage.getItem('firebaseToken');

    console.log(newFirebaseToken, 'newFirebaseToken');
    if (!saveToken || saveToken !== newFirebaseToken) {
      const token = await getToken();
      const instance = new AuthContoller();
      const result = await instance.firebaseTokenUpdate(
        newFirebaseToken,
        token,
      );
      AsyncStorage.setItem('firebaseToken', newFirebaseToken);
    }
  };

  const getData = async () => {
    const token = await getToken();

    const instance = new ClassContoller();
    const result = await instance.getHomeLocation(token);
    setAllData(result.locations);
  };
  
   const getDetail = async () => {
      const token = await getToken();
      const instance = new ProfileController();
      const result = await instance.getUserDetail(token);
      setUserInfo(result?.user)
      setShowNationalitySelectionModel((!result?.user?.nationality?.country?.length && !!result?.user?.popup)  ? true : false)
      console.log('result valueis   ', result)
      setShowTermsPopUp(!result?.user?.agreed_terms && !!result?.user?.terms_pop)
    };

  const getList = async () => {
    const data = [
      {
        img: require('../../../assets/images/bg.png'),
      },
      {
        img: require('../../../assets/images/bg.png'),
      },
      {
        img: require('../../../assets/images/bg.png'),
      },
      {
        img: require('../../../assets/images/bg.png'),
      },
      {
        img: require('../../../assets/images/bg.png'),
      },
    ];
    setList(data);
    // const half = Math.ceil(data.length / 2);
    // const firstHalf = data.slice(0, half);
    // setScrollData(firstHalf);
  };

  const getHappening = async () => {
    const token = await getToken();
    const instance = new HappeningContoller();
    const result = await instance.getAllChallenges(token);
   
    setChallenges(result?.happenings);

    setDoubleJoyImage(result?.doublejoy_banner);
    setStoreImage(result?.store_banner);

    setDoubleJoyStatusText(result?.doublejoy_status_text);
    setStoreStatusText(result?.store_status_text);

    setDoubleJoyStatus(result?.doublejoy_status);
    setStoreStatus(result?.store_status);

    const half = Math.ceil(result?.happenings.length / 2);
    const firstHalf = result?.happenings.slice(0, half);
    setScrollData(firstHalf);
  };

  const logCustomeEvent = async (eventName, name) => {
    const {gender} = await getUser();
    await analytics().logEvent(eventName, {
      name: name,
      gender: gender,
    });
  };

  return (
    <View style={{flex:1}}>
      <PageContainer>
        <ScrollView
          contentContainerStyle={{paddingBottom: 10}}
          showsVerticalScrollIndicator={false}>
          <Heading style={{marginBottom: 5, marginTop: 5}}>Train</Heading>
          {!allData?.length ? (
            <>
              <SkeltonBlackCard />
              <SkeltonBlackCard />
              <SkeltonBlackCard />
            </>
          ) : (
            <>
              {allData?.map((item, key) => (
                <View key={key + 'tr'}>
                  {key < 3 && (
                    <View>
                      <TraingBox
                        title={item.name}
                        bg={{uri: API_SUCCESS + '/' + item.image}}
                        onPress={() => {
                          logCustomeEvent('MostStudioClicked', item.name);
                          AsyncStorage.setItem(
                            'activeStudio',
                            JSON.stringify([key]),
                          );
                          navigation.navigate('classes');
                        }}
                      />
                    </View>
                  )}
                </View>
              ))}
            </>
          )}
          {challenges && challenges.length > 0 && (
            <View style={{marginTop: 10}}>
              <Heading style={{marginBottom: 5, marginTop: 10}}>
                HAPPENING NOW
              </Heading>

              <FlatList
                horizontal={true}
                data={challenges.sort((a, b) => a.position - b.position)}
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{nativeEvent: {contentOffset: {x: scrollX}}}],
                  {
                    useNativeDriver: false,
                  },
                )}
                pagingEnabled
                decelerationRate={'normal'}
                scrollEventThrottle={16}
                renderItem={({item}, key) => (
                  <View key={key + 'happening'}>
                    <TraingBox
                      title={''}
                      bg={{uri: API_SUCCESS + '/' + item.image}}
                      onPress={() => {
                        console.log('onpress. ', item)
                        if (item?.enroll?.id) {
                          navigation.navigate('HappeningsReport', {item: item});
                        } else {
                          navigation.navigate('HappeningDetail', {item: item});
                        }
                      }}
                      style={{
                        width: width / 2 - 15,
                        marginRight: 8,
                        height: 95,
                      }}
                    />
                  </View>
                )}
              />
              {challenges?.length > 2 && (
                <ExpandingDot
                  data={scrollData}
                  expandingDotWidth={30}
                  scrollX={scrollX}
                  inActiveDotOpacity={0.6}
                  dotStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    marginHorizontal: 5,
                  }}
                  activeDotColor="#606060"
                  inActiveDotColor="#888"
                  containerStyle={{
                    top: 145,
                    left: '50%',
                    right: '50%',
                    width: width,
                    marginLeft: -45,
                  }}
                />
              )}
            </View>
          )}
          {doubleJoyStatus != 'block' && (
            <View style={{marginTop: challenges?.length > 2 ? 40 : 20}}>
              <Heading style={{marginBottom: 5,textTransform:'none'}}>run of the mill</Heading>
              <TraingBox
                // title={'Coming Soon...'}
                title={doubleJoyStatusText}
                bg={{uri: doubleJoyImage}}
                style={{marginHorizontal: 0, height: 150,opacity:doubleJoyStatus === 'closed' ? 0.6 : 1}}
                // onPress={() => console.log()}
                onPress={() =>
                  doubleJoyStatus != 'closed'
                    ? navigation.navigate('DoubleJoy')
                    : console.log('closed now')
                }
              />
            </View>
          )}
          {storeStatus != 'block' && (
            <View style={{marginTop: 15}}>
              <Heading style={{marginBottom: 5, marginTop: 10}}>STORE</Heading>
              <TraingBox
                title={storeStatusText}
                bg={{uri: storeImage}}
                style={{marginHorizontal: 0, height: 150,opacity:storeStatus === 'closed' ? 0.6 : 1}}
                onPress={() => console.log()}
                //onPress={() => navigation.navigate('Store')}
              />
            </View>
          )}
        </ScrollView>
      </PageContainer>
        {
          showNationalitySelectionModel && (
            <NationalitySelectionModel visible={showNationalitySelectionModel} setVisibile={setShowNationalitySelectionModel} />
          )
        }
        
      <Modal
        dismissableBackButton={true}
        visible={updateModal}
        onDismiss={() => console.log()}
        onRequestClose={() => console.log()}
        style={{
          height: 'auto',
          marginTop: 260,
          justifyContent: 'flex-end',
          marginBottom: 0,
          zIndex: 999,
        }}>
        <View style={styles.modalBox}>
          <View style={styles.titleHeading}>
            <Text style={styles.titleText}>UPDATE APP</Text>
          </View>
          <View style={styles.summeryBox}>
            <View style={styles.modalTotalBox}>
              <Text style={{fontSize: 14, textAlign: 'center'}}>
                Please update your application to continue.
              </Text>
            </View>

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 15,
              }}>
              <RoundedGreyButton
                label={'UPDATE'}
                onPress={() => update()}
                style={{width: 100, marginLeft: 5, marginTop: 5}}
              />
            </View>
          </View>
        </View>
      </Modal>
      {(!!showTermsPopUp && !!termData?.description?.length) && (
        <Portal>
          <Modal
            visible={showTermsPopUp}
            dismissableBackButton={true}
            contentContainerStyle={styles.termsModalWrapper}>
            <View style={styles.termsModalCard}>
              <View style={styles.termsModalHeader}>
                <View style={styles.termsModalHeaderIcon}>
                  <Text style={styles.termsModalHeaderEmoji}>📋</Text>
                </View>
                <Text style={styles.termsModalTitle}>{!!termData?.value?.length ? termData?.value : 'Terms & Conditions'}</Text>
                <Text style={styles.termsModalSubtitle}>
                  Please read the following carefully
                </Text>
              </View>
              <ScrollView
                style={styles.termsScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.termsScrollContent}>
                <View style={styles.termsContentBox}>
                  <Text style={styles.termsBodyText}>
                      {termData?.description}
                  </Text>
                </View>
                <View style={styles.termsModalFooter}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.termsAgreeButton}
                    onPress={() => updateUserProfile(true)}>
                    <Text style={styles.termsAgreeButtonText}>I Agree</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>
        </Portal>
      )}
   

    </View>
  );
};
export default Home;
const styles = StyleSheet.create({
  modalTotalBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
  },
  summeryBox: {
    width: width - 70,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalBox: {
    paddingTop: Platform.OS === 'ios' ? 30 : 30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  titleHeading: {
    flexDirection: 'row',
  },
  titleText: {
    paddingHorizontal: 20,
    paddingTop: 20,

    paddingBottom: 10,
    fontSize: 18,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  modalContent: {
    paddingBottom: 20,
  },
    paraBox: {
    paddingTop: Platform.OS === 'ios' ? 30 : 30,
    backgroundColor: '#fff',
    borderRadius: 36,
    width: '85%',
    alignSelf: 'center',
  },
  paraText: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 21,
  },
  termsModalWrapper: {
    height: windowHeight -100,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    zIndex: 999,
  },
  termsModalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    flex: 1,
    maxHeight: windowHeight - 48,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  termsModalHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#f8f9fc',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecf4',
  },
  termsModalHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#161415',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsModalHeaderEmoji: {
    fontSize: 28,
  },
  termsModalTitle: {
    fontSize: 20,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  termsModalSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  termsScrollView: {
    flex: 1,
  },
  termsScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 24,
  },
  termsContentBox: {
    paddingVertical: 4,
  },
  termsBodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'left',
  },
  termsModalFooter: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#e8ecf4',
    backgroundColor: '#fff',
  },
  termsAgreeButton: {
    backgroundColor: '#161415',
    borderRadius: 25,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  termsAgreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Gotham-Medium',
    fontWeight: '600',
  },
  termsModalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  termsModalBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  termsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  termsHeaderText: {
    fontSize: 20,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
    fontWeight: '600',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    lineHeight: 24,
    marginTop: -2,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    fontFamily: 'SFProText-Regular',
  },
  termsFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  agreeButton: {
    backgroundColor: '#00C853',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C853',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Gotham-Medium',
    fontWeight: '600',
  },
});
