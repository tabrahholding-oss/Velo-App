
import {API_BASE} from '../config/ApiConfig';

export class HappeningContoller {
  async getAllChallenges(token) {
    console.log(token,'token')
    return fetch(API_BASE + '/user/happenings', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson,'responseJson.happ')
        return responseJson;
      })
      .catch(error => {
        console.log(error,'happening');
        return {success: false, error};
      });
  }
  
  async addChallenges(id, token) {
    return fetch(API_BASE + '/user/happenings?id=' + id, {
      method: 'POST',
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

  async getChallenges(id, token) {
    return fetch(API_BASE + '/user/happening/' + id + '/details', {
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

}
