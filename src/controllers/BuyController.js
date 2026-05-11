import {API_BASE} from '../config/ApiConfig';

export class BuyContoller {
  async getAllPackages(token) {
    return fetch(API_BASE + '/packages/get', {
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

  async getUserPackages(token) {
    console.log(token,'token')
    return fetch(API_BASE + '/packages/active', {
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

  async getUserAllPackages(token) {
    console.log(token,'token')
    return fetch(API_BASE + '/packages/all/active', {
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

  async purchasePackage(data, token) {
    const newdata = new FormData();
    newdata.append('package_id', data.id);
    newdata.append('type', data.type);
    newdata.append('device', 'mobile');
    const payuri =
      API_BASE +
      '/packages/purchase?package_id=' +
      data.id +
      '&type=Wallet&device=mobile';

    return fetch(payuri, {
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
        return error;
      });
  }

  async executePayment(data, type, token) {
    var myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + token);

    var formdata = new FormData();
    formdata.append('type', type);
    formdata.append('amount', data.attributes.amount);
    // formdata.append('PaymentMethodId', '2');
    formdata.append('package_id', data.id);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    return fetch(API_BASE + '/packages/purchase', requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result)
        return JSON.parse(result);
      })
      .catch(error => {
        return error;
      });
  }
}
