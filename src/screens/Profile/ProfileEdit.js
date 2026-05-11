import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  Button,
  KeyboardAvoidingView,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {assets} from '../../config/AssetsConfig';
import {GreyBox} from '../../components/GreBox';
import {Input} from '../../components/Input/input';
import {RoundedDarkButton, RoundedThemeButton} from '../../components/Buttons';
import {UserContext} from '../../../context/UserContext';
import {ProfileController} from '../../controllers/ProfileController';
import {useToast} from 'react-native-toast-notifications';
import PageLoader from '../../components/PageLoader';
// import DatePicker from 'react-native-datepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
// import DocumentPicker from 'react-native-document-picker';
import {API_SUCCESS} from '../../config/ApiConfig';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {ModalView} from '../../components/ModalView';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import { CountryPicker } from 'react-native-country-codes-picker';
import NationalityDropdown from '../../components/NationalityDropdown';

var radio_props = [
  {label: 'MALE', value: 'Male'},
  {label: 'FEMALE', value: 'Female'},
];
const ProfileEdit = ({navigation, route},) => {
  const canCancel = route?.params?.cancel
      
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [image, setImage] = useState('');
  const [datePicker, setDatePicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const {getToken} = useContext(UserContext);
  const [user, setUser] = useState({});
  const toast = useToast();
  const [gender, setGender] = useState();
  const userCtx = useContext(UserContext);
  const [singleFile, setSingleFile] = useState('');
  const [nationalityPicker, setNationalityPicker] = useState(false)
    const [nationality, setNationality] = useState({
      country:'',
      flag:null
    })
  const dt = new Date();

  const maxDate = new Date(dt.setFullYear(dt.getFullYear() - 15));

  useEffect(() => {
    getDetail();
  }, []);

  const selectOneFile = async () => {
    setOpen(true);
  };

  const openGallery = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      setOpen(false);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        console.log(response, 'response');
        setImage(imageUri);
        setSingleFile(response.assets ? response.assets[0] : response);
      }
    });

    //Opening Document Picker for selection of one file
    // try {
    //   const res = await DocumentPicker.pick({
    //     type: [DocumentPicker.types.images],
    //   });
    //   setImage(res[0].uri);
    //   setSingleFile(res[0]);
    // } catch (err) {
    //   if (DocumentPicker.isCancel(err)) {
    //     console.log('Canceled');
    //   } else {
    //     Alert.alert('Unknown Error: ' + JSON.stringify(err));
    //     throw err;
    //   }
    // }
  };

  const openCamera = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, response => {
      setOpen(false);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        console.log(response, 'response');
        setImage(imageUri);
        setSingleFile(response.assets ? response.assets[0] : response);
      }
    });
  };

  const getDetail = async () => {
    const token = await getToken();
    const instance = new ProfileController();
    const result = await instance.getUserDetail(token);
    setUser(result.user);
    setFirstName(result.user.first_name);
    setLastName(result.user.last_name);
    setEmail(result.user.email);
    setPhone(result.user.phone);
    setDob(result.user.dob);
    setGender(result.user.gender);
    setNationality(result.user.nationality)
    setImage(API_SUCCESS + '/' + result.user.image);
    setLoading(false);
  };

  function showDatePicker() {
    setDatePicker(true);
  }

  function onDateSelected(event, value) {
    setDob(value.toISOString());
    if (Platform.OS !== 'ios') {
      setDatePicker(false);
    }
  }

  const submit = async () => {
    if (first_name !== '' && last_name !== '' && email !== '' && phone !== '' &&  !!nationality?.country?.length) {
      setLoading(true);
      let data = {
        ...user,
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone: phone,
        gender: gender,
        dob: moment(dob).format('YYYY-MM-DD'),
        country: nationality
      };
      if (singleFile?.uri) {
        data.image = {
          uri: singleFile.uri,
          type: singleFile.type,
          name: singleFile.fileName,
        };
      }
      const token = await getToken();
      const instance = new ProfileController();
      const result = await instance.updateProfile(data, token);
      console.log(result, 'ress');
      if (result.status === 'success') {
        toast.show(result.message);
        userCtx.setUser({...user.data, ...result.user});
        setLoading(false);
        canCancel ? navigation.goBack() : navigation.navigate('Profile', {upload: true});
      } else {
        var errors = result.errors;
        var value = '';
        if (errors.phone) {
          var value = errors.phone + ' ,';
          toast.show(value);
        } else if (errors.email) {
          value = value + errors.email;
          toast.show(value);
        } else if (errors.dob) {
          value = value + errors.dob;
          toast.show(value);
        }

        setLoading(false);
      }
    } else {
      toast.show('Please fill all details');
    }
  };


  const openNationalityView = ()=>{
    setNationalityPicker(!nationalityPicker)

  }

  return (
    <>
     
      <PageLoader loading={loading} />
      <PageContainer>
        <KeyboardAvoidingView behavior='padding' style={{flex:1}}>
          <ScrollView contentContainerStyle={{paddingBottom:90}}>
            <Text style={{paddingLeft: 15}}>EDIT PROFILE</Text>
            <TouchableOpacity onPress={() => selectOneFile()}>
            
              {image == '' ? (
                <View style={[styles.prImg,{backgroundColor:'#ddd'}]} />
              ) : (
                <Image source={{uri: image}} style={styles.prImg} />
              )}

              <View style={styles.editBox}>
                <Image source={assets.edit} style={styles.editIcon} />
              </View>
            </TouchableOpacity>

            <View style={styles.form}>
              <Input
                value={first_name}
                label={'First name'}
                onChang={setFirstName}
              />
              <Input
                value={last_name}
                label={'Last name'}
                onChang={setLastName}
              />
              <Input
                value={email}
                editable={false}
                label={'Email address'}
                onChang={setEmail}
              />

              <Input
                value={phone}
                label={'Phone number'}
                onChang={setPhone}
                keyboardType={'numeric'}
              />
              
              <NationalityDropdown selected={nationality?.country} flag={nationality?.flag} onPress={openNationalityView} />
              
              <View style={{marginBottom:15}}>
                <Text
                  style={{
                    paddingTop: 15,
                    fontSize: 12,
                    color: '#333',
                    marginLeft: 15,
                  }}>
                  Date of Birth
                </Text>
                  <View style={{marginTop: -25}}>
                    <TouchableOpacity
                      style={{
                        height: 50,
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 10,
                        zIndex: 999,
                      }}
                      onPress={() => showDatePicker()}
                    />
                    <Input
                      value={!!dob?.length ? moment(dob).format('YYYY-MM-DD') : ''}
                      onChangeText={() => console.log('')}
                      label={' '}
                      disabled={true}
                    />
                  </View>
                ) 
              </View>

              <RadioForm
                      formHorizontal={true}
                      animation={true}
                    >
                    {
                      radio_props.map((obj, i) => (
                        <RadioButton labelHorizontal={true} key={i} >
                          <RadioButtonInput
                            obj={obj}
                            index={i}
                            isSelected={gender === obj.value}
                            onPress={(value) => setGender(value)}
                            borderWidth={1}
                            buttonInnerColor={'#000'}
                            buttonOuterColor={gender === obj.value ? '#161415' : '#161415'}
                            buttonSize={10}
                            buttonOuterSize={18}
                            buttonStyle={{}}
                            buttonWrapStyle={{marginLeft: 10}}
                          />
                          <RadioButtonLabel
                            obj={obj}
                            index={i}
                            labelHorizontal={true}
                            onPress={(value) => setGender(value)}
                            labelStyle={{fontSize: 14, color: '#161415'}}
                            labelWrapStyle={{}}
                          />
                        </RadioButton>
                      ))
                    }  
                  </RadioForm>


              <View style={styles.btnBox}>
                <RoundedThemeButton
                  label={'CANCEL'}
                  style={{marginTop: 0, width: width / 2 - 50}}
                  onPress={() => {
                    if (canCancel){
                      navigation.goBack()
                      return
                    }
                    navigation.navigate('Profile')}}
                  loading={false}
                />
                <RoundedDarkButton
                  label={'SAVE'}
                  style={{marginTop: 0, width: width / 2 - 50}}
                  onPress={submit}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </PageContainer>

      <ModalView
        visible={open}
        heading=""
        setVisible={() => setOpen(false)}
        style={{
          height: 'auto',
          marginTop: 260,
          justifyContent: 'flex-end',
          marginBottom: 0,
        }}>
        <View style={{paddingHorizontal: '20%', gap: 20, paddingBottom: 40}}>
          <RoundedDarkButton label="Choose from Device" onPress={openGallery} />
          <RoundedDarkButton label="Open Camera" onPress={openCamera} />
        </View>
      </ModalView>

     {datePicker && (
             <View>
              {
                Platform.OS === 'ios' && (
                   <View style={{alignItems:"flex-end"}}>
              <Button style={{alignSelf:'flex-end'}} title="Close" onPress={() => setDatePicker(false)} />
               </View>
                )
              }
              
             <DateTimePicker
               value={ dob?.length ? new Date(dob): new Date()}
               mode={'date'}
               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
               is24Hour={true}
               onChange={onDateSelected}
               maximumDate={maxDate}
               textColor="#333"
             />
             
             </View>
           )}
      <CountryPicker
            show={nationalityPicker}
            onBackdropPress={() => setNationalityPicker(false)}
            modalProps={{
              animationType: 'slide',
              transparent: true,
              presentationStyle: 'overFullScreen',
            }}
            style={{
              modal: {
                justifyContent: 'flex-end',
                margin: 0,
                height:'80%'
              },
              countryButtonStyles: {
                paddingVertical: 12,
              },
              countryList: {
                backgroundColor: '#fff',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                height: '60%',
              },
            }}
            // style={{height:400}}
            pickerButtonOnPress={item => {
              setNationality({
                country:item?.name?.en,
                flag: item?.flag
              });
              setNationalityPicker(false)
            }}
          />
    </>
  );
};
export default ProfileEdit;
const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  form: {
    width: width - 40,
    alignSelf: 'center',
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  prImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Gotham-Medium',
    textAlign: 'center',
    color: '#161415',
  },
  email: {
    fontSize: 12,
    fontFamily: 'Gotham-Medium',
    textAlign: 'center',
    lineHeight: 20,
    color: '#161415',
  },
  phone: {
    fontSize: 12,
    fontFamily: 'Gotham-Medium',
    textAlign: 'center',
    lineHeight: 20,
    color: '#161415',
  },
  editBox: {
    backgroundColor: '#000',
    width: 28,
    height: 28,
    borderRadius: 20,
    padding: 5,
    position: 'absolute',
    right: width / 2 + 20,
    marginTop: 105,
  },
  editIcon: {
    tintColor: '#fff',
    width: 18,
    height: 18,
  },
  nationalityStyle:{
    width:'100%',
    paddingVertical:15,
    paddingLeft:15,
    marginTop:10,
    borderBottomWidth:1,
    borderBottomColor: '#161415',
    flexDirection:"row",
    alignItems:'center'
  },
  nationalityTextStyle:{
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  countryIconStyle:{
    fontSize:20,
    marginRight:10
  }
});
