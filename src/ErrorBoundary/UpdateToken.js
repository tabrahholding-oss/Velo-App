import { API_BASE } from "../config/ApiConfig";

export const UpdateToken = async(token) => {
    return fetch(API_BASE + '/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson, 'updatetoken');
        return responseJson;
      })
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
}