import {API_BASE} from '../config/ApiConfig';

export class TransactionController {
  async getTransactions(token, page = 1) {
    return fetch(`${API_BASE}/transactions?page=${page}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => responseJson)
      .catch(error => {
        console.log(error);
        return {success: false, error};
      });
  }
}

export const extractTransactions = result => {
  if (Array.isArray(result?.transactions)) {
    return result.transactions;
  }
  return [];
};

export const extractLastPage = result => {
  return (
    result?.pagination?.last_page ??
    1
  );
};

export const extractCurrentPage = result => {
  return (
    result?.pagination?.current_page ??
    1
  );
};
