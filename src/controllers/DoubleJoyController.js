import {API_BASE} from '../config/ApiConfig';

export class DoubleJoyController {
  async getAllDoubleJoy(token) {
    console.log(token, 'token');
    return fetch(API_BASE + '/category/get', {
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

  async getMyOrder(token) {
    return fetch(API_BASE + '/order/get', {
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

  async getMyCart(token) {
    return fetch(API_BASE + '/cart/get', {
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

  async addItem(token, id, qty, notes, addons) {
 
    var myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + token);

    var formdata = new FormData();
    formdata.append('optional_item_id', id);
    formdata.append('quantity', qty);
    formdata.append('addons', JSON.stringify(addons));
    formdata.append('notes', notes);

    console.log(formdata,'formdata')

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    return fetch(API_BASE + '/cart/add', requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result,'result')
        return result;
      })
      .catch(error => {
        return {success: false, error};
      });
  }

  async removeItem(token, id) {
    const newdata = new FormData();
    newdata.append('optional_item_id', id);

    return fetch(API_BASE + '/cart/remove', {
      method: 'POST',
      body: newdata,
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

  async checkout(token, cart_id, type, note) {
    var myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + token);

    const newdata = new FormData();
    newdata.append('cart_id', cart_id);
    newdata.append('type', type);
    if (note || note?.length) {
      newdata.append('note', note);
    }

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: newdata,
      redirect: 'follow',
    };

    return fetch(API_BASE + '/order/checkout', requestOptions)
      .then(response => response.text())
      .then(result => {
        return JSON.parse(result);
      })
      .catch(error => {
        return error;
      });
  }
}
