import {API_BASE} from '../config/ApiConfig';

export class ProfileController {
  async getUserDetail(token) {
    return fetch(API_BASE + '/auth/profile', {
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

  async deleteAccount(token) {
    console.log(API_BASE + '/auth/request-delete', 'api', token);
    return fetch(API_BASE + '/auth/request-delete', {
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

  async changePassword(data, token) {
    const newdata = new FormData();
    newdata.append('old_password', data.oldPassword);
    newdata.append('password', data.password);
    newdata.append('password_confirmation', data.confirmPassword);

    return fetch(API_BASE + '/auth/update/password', {
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

async updateProfile(data, token, terms = false) {
    const newdata = new FormData();
    newdata.append('first_name', data.first_name);
    newdata.append('last_name', data.last_name);
    newdata.append('email', data.email);
    newdata.append('phone', data.phone);
    newdata.append('dob', data.dob);
    newdata.append('gender', data.gender);
    newdata.append('nationality[country]', data?.country?.country)
    newdata.append('nationality[flag]', data?.country?.flag);
    if (terms){
      newdata.append('agreed_terms', !!data?.agreed_terms ? 1 : 0)
    }
    if (data.image) {
      newdata.append('image', data.image);
    }


    return fetch(API_BASE + '/auth/profile/update', {
      method: 'POST',
      body: newdata,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
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
}
