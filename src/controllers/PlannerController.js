import {API_BASE} from '../config/ApiConfig';

export class PlannerContoller {
  async getAllBooking(token) {
    return fetch(API_BASE + '/user/bookings', {
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