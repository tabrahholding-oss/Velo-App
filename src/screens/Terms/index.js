import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {PageContainer} from '../../components/Container';
import { useEffect, useState } from 'react';
import { TermsController } from '../../controllers/TermsController';

const Terms = ({navigation}) => {
  const [data, setData] = useState({});

  useEffect(() => {
    getTerms();
  },[])
  const getTerms = async() => {
    const instance = new TermsController();
    const result = await instance.getTermsCondition();
    if(result.status === 'success'){
      setData(result.terms_and_conditions);
    }
  }

  return (
    <PageContainer>
      {/* <Text style={{paddingLeft: 15, height: 30, textTransform: 'uppercase'}}>
        TERMS AND CONDITION
      </Text> */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
        <View style={styles.paraBox}>
          <Text style={styles.paraText}>
            {data.description}
          </Text>
        </View>
      </ScrollView>
    </PageContainer>
  );
};
export default Terms;

const styles = StyleSheet.create({
  paraBox: {
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  paraText: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 21,
  },
});
