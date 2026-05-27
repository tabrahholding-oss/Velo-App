import {API_BASE} from '../config/ApiConfig';

export class WalletController {

  async getBalance(token) {
    console.log(token,'token')
    return fetch(API_BASE + '/wallet/balance', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        return responseJson;
      })
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
  }

  async executePayment(amount, type, token) {
    var myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + token);

    var formdata = new FormData();
   
    formdata.append('amount', amount);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    let url = API_BASE + '/wallet/recharge';
    if(type === 'Debit'){
      url = API_BASE + '/wallet/recharge/skipcash';

    }
    else{
      formdata.append('type', type);
    }
    console.log(url, requestOptions,'url, requestOptions')

    return fetch(url, requestOptions)
      .then(response => response.text())
      .then(result => {
        return JSON.parse(result);
      })
      .catch(error => {
        return error;
      });
  }

}