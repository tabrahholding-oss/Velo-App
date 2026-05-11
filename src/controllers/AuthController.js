import {API_BASE} from '../config/ApiConfig';

export class AuthContoller {
  async loginUser(email, password) {
    console.log(email, password, 'passssword');
    const newdata = new FormData();
    newdata.append('email', email);
    newdata.append('password', password);
    console.log(API_BASE + '/auth/login', 'API_BASE');
    return fetch(API_BASE + '/auth/login', {
      method: 'POST',
      body: newdata,
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson, 'response');
        return responseJson;
      })
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
  }

  async signUpUser(data) {
    const newdata = new FormData();
    newdata.append('first_name', data.first_name);
    newdata.append('last_name', data.last_name);
    newdata.append('email', data.email);
    newdata.append('password', data.password);
    newdata.append('phone', data.phone);
    newdata.append('dob', data.dob);
    newdata.append('password_confirmation', data.confirmPassword);
    newdata.append('gender', data.gender);
    newdata.append('terms_and_conditions', 1);
    newdata.append('referral_code', '');
    newdata.append('nationality[country]', data?.country?.country)
    newdata.append('nationality[flag]', data?.country?.flag);

    return fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: newdata,
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson, 'response');
        return responseJson;
      })
      .catch(error => {
        console.log('error',error);
        return {success: false, error};
      });
  }

  async forgotPassword(email) {
    const newdata = new FormData();
    newdata.append('email', email);
    return fetch(API_BASE + '/auth/password/reset/request', {
      method: 'POST',
      body: newdata,
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson, 'reee');
        return responseJson;
      })
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
  }

  async resendOtp(email) {
    const newdata = new FormData();
    newdata.append('email', email);
    return fetch(API_BASE + '/auth/resend-otp', {
      method: 'POST',
      body: newdata,
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson, 'reee');
        return responseJson;
      })
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
  }

  async verifyOtp(email, otp) {
    const newdata = new FormData();
    newdata.append('email', email);
    newdata.append('otp', otp);
    return fetch(API_BASE + '/auth/verify-otp', {
      method: 'POST',
      body: newdata,
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson, 'reee');
        return responseJson;
      })
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
  }

  async ResetPassword(data) {
    const newdata = new FormData();
    newdata.append('email', data.email);
    newdata.append('otp', data.otp);
    newdata.append('password', data.password);
    newdata.append('password_confirmation', data.confirmPassword);

    return fetch(API_BASE + '/auth/reset/password', {
      method: 'POST',
      body: newdata,
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson, 'reee');
        return responseJson;
      })
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
  }

  async firebaseTokenUpdate(firebaseToken, token) {
    const newdata = new FormData();
    newdata.append('token', firebaseToken);
    return fetch(API_BASE + '/auth/token/update', {
      method: 'POST',
      body: newdata,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson, 'reee');
        return responseJson;
      })
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
  }

  async getValidationStatus(token) {
    console.log(token,'token')
    return fetch(API_BASE + '/auth/verify-email', {
      method: 'GET',
      headers: {
        // Authorization: 'Bearer ' + token,
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
}
