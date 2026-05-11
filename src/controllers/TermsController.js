import {API_BASE} from '../config/ApiConfig';

export class TermsController {

  async getTermsCondition(token) {
    console.log(token, 'token');
    return fetch(API_BASE + '/cms/terms_and_conditions', {
      method: 'GET',
      headers: {
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