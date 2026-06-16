import {Platform, PermissionsAndroid} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {API_BASE} from '../config/ApiConfig';

export const getInvoiceUrl = transactionId =>
  `${API_BASE}/transactions/${transactionId}/invoice`;

export const getInvoiceHeaders = token => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/pdf',
});

const getFileNameFromDisposition = (disposition, transactionId) => {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || `invoice-${transactionId}.pdf`;
};

const blobToBase64 = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const requestAndroidStoragePermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version >= 33) {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const fetchInvoicePdf = async (transactionId, token) => {
  const url = getInvoiceUrl(transactionId);

  const response = await fetch(url, {
    method: 'GET',
    headers: getInvoiceHeaders(token),
  });

  console.log('Invoice API response ->', {
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type'),
    disposition: response.headers.get('content-disposition'),
    url: response.url,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText?.slice(0, 160) || `Invoice request failed (${response.status})`,
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const fileName = getFileNameFromDisposition(
    response.headers.get('content-disposition'),
    transactionId,
  );

  const blob = await response.blob();
  console.log('Invoice PDF blob ->', {
    size: blob.size,
    type: blob.type || contentType,
    fileName,
  });

  const base64 = await blobToBase64(blob);
  const cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;
  await ReactNativeBlobUtil.fs.writeFile(cachePath, base64, 'base64');

  return {
    path: cachePath,
    fileName,
    base64,
    url,
  };
};

export const getInvoicePreviewHtml = base64 =>
  `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background: #f5f5f5; }
      embed { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
  </body>
</html>`;

export const downloadInvoice = async (
  invoiceFile,
  {openAfterDownload = true} = {},
) => {
  const hasPermission = await requestAndroidStoragePermission();
  if (!hasPermission) {
    throw new Error('Storage permission is required to download invoice');
  }

  const {path, fileName} = invoiceFile;
  const downloadPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;

  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (!exists) {
    throw new Error('Invoice file not found');
  }

  await ReactNativeBlobUtil.fs.cp(path, downloadPath);

  if (openAfterDownload) {
    await viewInvoiceFile(downloadPath);
  }

  return downloadPath;
};

export const viewInvoiceFile = async filePath => {
  if (Platform.OS === 'android') {
    await ReactNativeBlobUtil.android.actionViewIntent(
      filePath,
      'application/pdf',
    );
  } else {
    await ReactNativeBlobUtil.ios.openDocument(filePath);
  }
};

export const getInvoiceViewUri = filePath =>
  Platform.OS === 'android' ? `file://${filePath}` : filePath;

// Backward-compatible helpers
export const fetchInvoice = fetchInvoicePdf;
