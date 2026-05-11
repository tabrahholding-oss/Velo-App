import React, {Component, useContext, useEffect, useState} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Button,
} from 'react-native';
import {AuthContoller} from '../../controllers/AuthController';
import {useNavigation} from '@react-navigation/native';
import {AuthHeader} from '../../components/AuthHeader';
import {DarkButton, ThemeButton} from '../../components/Buttons';
import {Input} from '../../components/Input/input';
import {useToast} from 'react-native-toast-notifications';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import DateTimePicker from '@react-native-community/datetimepicker';
import NationalityDropdown from '../../components/NationalityDropdown'

// import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import CheckBox from 'react-native-check-box';
//  import { Checkbox } from 'react-native-paper';

import {ModalView} from '../../components/ModalView';
import Terms from '../Terms';
import PrivacyPolicy from '../PrivacyPolicy';
import {CountryPicker} from 'react-native-country-codes-picker';
import {assets} from '../../config/AssetsConfig';
import {UserContext} from '../../../context/UserContext';
import {Modal} from 'react-native-paper';
import { PageContainer } from '../../components/Container';
import { TermsController } from '../../controllers/TermsController';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

var radio_props = [
  {label: 'MALE', value: 'Male'},
  {label: 'FEMALE', value: 'Female'},
];

const SignUp = (props) => {
  const validationStatus = props?.route?.params?.validationStatus
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState({
    country:'',
    flag:null
  })

  const [terms, setTerms] = useState(false);
  const [termsConditionModal, setTermsConditionModal] = useState(false);
  const [policyModal, setPolicyModal] = useState(false);
  const [code, setCode] = useState('+974');
  const [countryPicker, setCountryPicker] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState('🇶🇦');
  const [datePicker, setDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nationalityPicker, setNationalityPicker] = useState(false)
  const navigation = useNavigation();
  const userCtx = useContext(UserContext);
  const {setAuth} = useContext(UserContext);
  const {setToken} = useContext(UserContext);
  const toast = useToast();

  const dt = new Date();
  const maxDate = new Date(dt.setFullYear(dt.getFullYear() - 15));
  const minDate = new Date(dt.setFullYear(dt.getFullYear() - 45));
const [dob, setDob] = useState();
  const [termData, setTermData] = useState();

  const submit = async () => {
    try {
const validate = validateDetail();
    if (!validate.msg) {
      setLoading(true);
      const data = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        dob: moment(dob).format('YYYY-MM-DD'),
        phone: code + phone,
        gender: gender,
        country: nationality
      };
      const instance = new AuthContoller();
      const result = await instance.signUpUser(data);
      setLoading(false);
      if (result?.status) {
        // userCtx.setUser(result.user);
        // setToken(result.access_token);
        // setAuth(true);
        // toast.show(result.message);
        toast.show("We have sent a verify link on your email please verify.");
        navigation.navigate('Verify',{email:email})
        setLoading(false);
      } else {
        var errors = result.errors;
        var value = '';
        if (errors?.phone) {
          value = errors.phone + ' ,';
        }
        if (errors?.email) {
          value = value + errors.email;
        }
        if (value === '') {
          value = JSON.stringify(result.error);
        }

        setLoading(false);
        toast.show(value);
      }
    } else {
      toast.show(validate.msg);
    }
    }
    catch(err){
      console.log('errrrr. ',err)

    }
    
  };

 const validateRequired = (value, validationStatus, message) => {
  if (!validationStatus) return null; // not required
  if (!value) return message;
  return null;
};

  // function validateDetail() {
  //   if (
  //     first_name !== '' &&
  //     last_name !== '' &&
  //     email !== '' &&
  //     isValidIfRequired(phone, validationStatus) &&
  //     password !== '' &&
  //     confirmPassword !== '' &&
  //     isValidIfRequired(!!nationality?.country, validationStatus)
   
  //   ) {
  //     if (password == confirmPassword) {
  //       if (password.length > 7) {
  //         if (terms === true) {
  //           return true;
  //         } else {
  //           return {msg: 'Please accept our terms and condition.'};
  //         }
  //       } else {
  //         return {msg: 'Password must be 8 characters.'};
  //       }
  //     } else {
  //       return {msg: 'New Password and Confirm Password does not each other.'};
  //     }
  //   } else {
  //     return {msg: 'please fill all details'};
  //   }
  // }
  function validateDetail() {
  if (!first_name) {
    return { msg: 'First name is required.' };
  }

  if (!last_name) {
    return { msg: 'Last name is required.' };
  }

  if (!email) {
    return { msg: 'Email is required.' };
  }

  // Conditional validations
  let error;

  error = validateRequired(
    nationality?.country,
    validationStatus,
    'Nationality is required.'
  );
  if (error) return { msg: error };

  error = validateRequired(
    phone,
    validationStatus,
    'Phone number is required.'
  );
  if (error) return { msg: error };

  error = validateRequired(
   dob,
    validationStatus,
    'Birthday is required.'
  );
  if (error) return { msg: error };

  // Password validations
  if (!password) {
    return { msg: 'Password is required.' };
  }

  if (!confirmPassword) {
    return { msg: 'Confirm password is required.' };
  }

  if (password !== confirmPassword) {
    return { msg: 'Passwords do not match.' };
  }

  if (password.length < 8) {
    return { msg: 'Password must be at least 8 characters.' };
  }

  // Terms
  if (!terms) {
    return { msg: 'Please accept our terms and conditions.' };
  }

  return true;
}


  function showDatePicker() {
    setDatePicker(true);
  }

  function onDateSelected(event, value) {
    setDob(value);
    if (Platform.OS !== 'ios') {
      setDatePicker(false);
    }
  }


  useEffect(() => {
    getTerms();
  },[])

  const getTerms = async() => {
    const instance = new TermsController();
    const result = await instance.getTermsCondition();
    if(result.status === 'success'){
      setTermData(result.terms_and_conditions);
    }
  }

  const renderTerms = () => {
    return (
      <View style={styles.termsBox}>
        <Text style={styles.normalText}>By signup you agree our </Text>
        <TouchableOpacity onPress={() => setTermsConditionModal(true)}>
          <Text style={styles.mediumText}>T&C and Privacy Policy.</Text>
        </TouchableOpacity>
        {/* <Text style={styles.normalText}> and </Text>
        <TouchableOpacity onPress={() => setPolicyModal(true)}>
          <Text style={styles.mediumText}>Privacy Policy.</Text>
        </TouchableOpacity> */}
      </View>
    );
  };

  const openNationalityView = () => {
   setNationalityPicker(!nationalityPicker)
  }

  return (
    <>
      {/* <PageLoader loading={loading} /> */}
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        style={{
          paddingTop: Platform.OS === 'ios' ? 0 : 0,
          backgroundColor: '#fff',
          flex:1
        }}>
        <ScrollView
          contentContainerStyle={{paddingBottom: 80}}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          >
          <View
            style={{
              width: '100%',
              maxWidth: 320,
              alignSelf: 'center',
            }}>
            <AuthHeader title={'Sign up'} />

            <View style={styles.form}>
              <View>
                <Input
                  value={first_name}
                  label={'FIRST NAME'}
                  onChang={setFirstName}
                />
                <Input
                  value={last_name}
                  label={'LAST NAME'}
                  onChang={setLastName}
                />
                <Input
                  value={email}
                  label={'E-MAIL ADDRESS'}
                  onChang={setEmail}
                />

                <View style={{display: 'flex', flexDirection: 'row'}}>
                  <TouchableOpacity
                    style={styles.codeInput}
                    onPress={() => setCountryPicker(true)}>
                    <Text style={styles.codeText}>
                      {selectedFlag} {code}
                    </Text>
                    <Image
                      source={assets.chevron}
                      style={{width: 14, height: 14, marginTop: 7}}
                    />
                  </TouchableOpacity>
                  <Input
                    value={phone}
                    label={'PHONE NUMBER'}
                    onChang={setPhone}
                    keyboardType={'numeric'}
                    style={styles.countryPicker}
                  />
                </View>

                  <NationalityDropdown onPress={openNationalityView} selected={nationality?.country} flag= {nationality?.flag} />
                 

                <View style={{position: 'relative'}}>
                  <Text
                    style={{
                      paddingTop: 15,
                      fontSize: 12,
                      color: '#333',
                      marginLeft: 15,
                    }}>
                    BIRTH DATE
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
                      onPress={() => showDatePicker()}></TouchableOpacity>
                    <Input
                      value={!!dob? moment(dob).format('YYYY-MM-DD') : null}
                      onChangeText={() => console.log('')}
                      label={' '}
                      disabled={true}
                    />
                  </View>
                </View>

                <View style={{marginTop: 15}}>
                  {/* <RadioForm
                    radio_props={radio_props}
                    buttonColor={'#000000'}
                    formHorizontal={true}
                    initial={0}
                    buttonSize={10}
                    buttonOuterSize={20}
                    labelStyle={{
                      fontSize: 14,
                      fontFamily: 'Gotham-Book',
                      color: '#000000',
                      paddingRight: 15,
                      marginBottom: 10,
                    }}
                    onPress={value => {
                      setGender(value);
                    }}
                  /> */}

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
                </View>

                <Input
                  value={password}
                  label={'PASSWORD'}
                  onChang={setPassword}
                  secureTextEntry={true}
                />
                <Input
                  value={confirmPassword}
                  label={'CONFIRM PASSWORD'}
                  onChang={setConfirmPassword}
                  secureTextEntry={true}
                />
              </View>

              <View
                style={{width: '100%', marginTop: 20, flexDirection: 'row'}}>
                <CheckBox
                  style={{
                    width: 30,
                    paddingLeft: 0,
                    paddingTop: 8,
                  }}
                  onClick={() => setTerms(!terms)}
                  isChecked={terms}
                  checkBoxColor={'#000000'}
                  rightText={''}
                  rightTextStyle={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#000000',
                  }}
                />
                {renderTerms()}
              </View>

              <DarkButton
                label={'SIGN UP'}
                style={{marginTop: 20, backgroundColor: '#000'}}
                onPress={submit}
                loading={loading}
                disabled={loading}
              />
            </View>

            <View style={styles.alreadyBox}>
              <Text
                style={
                  (styles.mediumText,
                  {fontSize: 14, textTransform: 'uppercase'})
                }>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.AlreadyText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ModalView
        visible={termsConditionModal}
        heading="TERMS AND CONDITION"
        setVisible={() => setTermsConditionModal(false)}
        style={{
          height: 'auto',
          marginTop: 260,
          justifyContent: 'flex-end',
          marginBottom: 0,
          zIndex: 999,
        }}>
         <PageContainer>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
            <View style={styles.paraBox}>
              <Text style={styles.paraText}>
                {termData?.description}
              </Text>
            </View>
          </ScrollView>
        </PageContainer>
      </ModalView>

      <ModalView
        visible={policyModal}
        heading="PRIVACY POLICY"
        setVisible={() => setPolicyModal(false)}>
        <PrivacyPolicy />
      </ModalView>

      <CountryPicker
        show={countryPicker}
        pickerButtonOnPress={item => {
          console.log(item,'item')
          setSelectedFlag(item.flag);
          setCode(item.dial_code);
          setCountryPicker(false);
        }}
      />
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
          value={dob || minDate}
          mode={'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={true}
          onChange={onDateSelected}
          maximumDate={maxDate}
          textColor="#333"
        />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  form: {
    marginTop: 0,
  },
  alreadyBox: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
  },
  AlreadyText: {
    color: '#000',
    textTransform: 'uppercase',
    lineHeight: 16,
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
  },
  normalText: {
    color: '#161415',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Gotham-Book',
  },
  mediumText: {
    color: '#000000',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Gotham-Medium',
  },
  termsBox: {
    display: 'flex',
    width: width - 80,
    paddingTop: 8,
    paddingLeft: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  countryPicker: {
    width: width - 170,
    marginLeft: 5,
    backgroundColor: 'transparent',
    color: '#000000',
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
    textTransform: 'uppercase',
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
  },
  codeInput: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    height: 32,
    width: 85,
    marginTop: 13,
    borderRadius: 6,
    paddingHorizontal: 5,
    borderColor: '#000000',
  },
  codeText: {
    lineHeight: 28,
    fontSize: 14,
  },
  paraBox: {
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  paraText: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 21,
  },
  nationalityStyle:{
    width:'100%',
    paddingVertical:15,
    paddingLeft:15,
    marginTop:13,
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
export default SignUp;
