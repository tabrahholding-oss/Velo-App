import React, { useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';

import {Modal, Portal} from 'react-native-paper';
import { RoundedGreyButton } from './Buttons';
import { useNavigation } from '@react-navigation/native';




export const NationalitySelectionModel = (props) =>{
    const navigation = useNavigation()
    return (
      <Portal>
        <Modal
                dismissableBackButton={true}
                visible={props?.visible}
                 dismissable={false}
                
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 999,
                }}>
                <View style={styles.modalBox}>
                  <View style={styles.titleHeading}>
                    <Text style={styles.titleText}>Complete Your Profile!</Text>
                  </View>
                  <View style={styles.summeryBox}>
                    <View style={styles.modalTotalBox}>
                      <Text style={{fontSize: 14, textAlign: 'center'}}>
                        Select your nationality
                      </Text>
                    </View>
        
                    <View
                      style={{
                        marginTop: 15,
                      }}>
                      <RoundedGreyButton
                        label={'UPDATE'}
                        onPress={() => {
                          props.setVisibile(false)
                          navigation.navigate(
                            'ProfileEdit',
                            {
                              cancel:true
                            }
                          );
                        }}
                        style={{ marginTop: 5,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </Modal>
              </Portal>
    )

}

const styles = StyleSheet.create({
  modalBox: {
    paddingTop: Platform.OS === 'ios' ? 30 : 30,
    backgroundColor: '#fff',
    borderRadius: 36,
    width: '85%',
    alignSelf: 'center',
  },
  titleHeading: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  modalContent: {
    paddingBottom: 20,
  },
  modalTotalBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  summeryBox: {
    alignSelf: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
})

