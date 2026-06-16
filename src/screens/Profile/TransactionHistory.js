import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import WebView from 'react-native-webview';
import {PageContainer} from '../../components/Container';
import PageLoader from '../../components/PageLoader';
import {UserContext} from '../../../context/UserContext';
import {
  TransactionController,
  extractCurrentPage,
  extractLastPage,
  extractTransactions,
} from '../../controllers/TransactionController';
import {
  downloadInvoice,
  fetchInvoicePdf,
  getInvoicePreviewHtml,
  getInvoiceViewUri,
  viewInvoiceFile,
} from '../../utils/downloadInvoice';
import {useToast} from 'react-native-toast-notifications';
import {SkeltonCard} from '../../components/Skelton';
import {assets} from '../../config/AssetsConfig';

const getTransactionId = item => item?.id;

const getStatusStyle = status => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID' || normalized === 'SUCCESS' || normalized === 'COMPLETED') {
    return styles.statusSuccess;
  }
  if (normalized === 'FAILED' || normalized === 'CANCELLED' || normalized === 'CANCELED') {
    return styles.statusFailed;
  }
  return styles.statusPending;
};

const DetailRow = ({label, value}) => {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const TransactionHistory = ({navigation}) => {
  const {getToken} = useContext(UserContext);
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState({
    visible: false,
    transactionId: null,
    invoiceFile: null,
    loading: false,
  });

  const loadTransactions = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1 && !append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const token = await getToken();
      const instance = new TransactionController();
      const result = await instance.getTransactions(token, pageNum);
      const list = extractTransactions(result);
      const current = extractCurrentPage(result);
      const totalPages = extractLastPage(result);

      setTransactions(prev => (append ? [...prev, ...list] : list));
      setPage(current || pageNum);
      setLastPage(totalPages || 1);
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    },
    [getToken],
  );

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      loadTransactions(1, false);
    });
    return focusHandler;
  }, [navigation, loadTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions(1, false);
  };

  const loadMore = () => {
    if (loadingMore || loading || page >= lastPage) {
      return;
    }
    loadTransactions(page + 1, true);
  };

  const closeInvoiceModal = () => {
    setInvoiceModal({
      visible: false,
      transactionId: null,
      invoiceFile: null,
      loading: false,
    });
    setDownloadingId(null);
  };

  const handleDownloadAndViewInvoice = async transactionId => {
    if (!transactionId) {
      toast.show('Invalid transaction');
      return;
    }

    try {
      setDownloadingId(transactionId);
      setInvoiceModal({
        visible: true,
        transactionId,
        invoiceFile: null,
        loading: true,
      });

      const token = await getToken();
      const invoiceFile = await fetchInvoicePdf(transactionId, token);
      const downloadPath = await downloadInvoice(invoiceFile, {
        openAfterDownload: false,
      });

      setInvoiceModal({
        visible: true,
        transactionId,
        invoiceFile: {
          ...invoiceFile,
          downloadPath,
          viewUri: getInvoiceViewUri(downloadPath),
        },
        loading: false,
      });

      await viewInvoiceFile(downloadPath);
      toast.show('Invoice downloaded successfully');
    } catch (error) {
      console.log('handleDownloadAndViewInvoice error', error);
      toast.show(error?.message || 'Unable to download invoice');
      closeInvoiceModal();
    } finally {
      setDownloadingId(null);
    }
  };

  const renderTransaction = ({item}) => {
    const attrs = item?.attributes || {};
    const transactionId = getTransactionId(item);
    const {
      txn_id: txnId,
      order_id: orderId,
      amount,
      currency = 'QAR',
      status,
      purchase_type: purchaseType,
      transaction_type: transactionType,
      description,
      created_at: createdAt,
      invoice_available: invoiceAvailable,
    } = attrs;

    const formattedDate = createdAt
      ? moment(createdAt, 'YYYY-MM-DD HH:mm:ss').format('DD MMM YYYY, hh:mm A')
      : '-';
    const isDownloading = downloadingId === transactionId;
    const canDownloadInvoice = invoiceAvailable === true;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.amountText}>
            {amount ? `${amount} ${currency}` : '—'}
          </Text>
          {status ? (
            <Text style={[styles.statusText, getStatusStyle(status)]}>
              {String(status).toUpperCase()}
            </Text>
          ) : null}
        </View>

        {description ? (
          <Text style={styles.descriptionText}>{description}</Text>
        ) : null}

        <DetailRow label="Transaction ID" value={txnId} />
        <DetailRow label="Order ID" value={orderId} />
        <DetailRow label="Type" value={transactionType} />
        <DetailRow label="Purchase Type" value={purchaseType} />
        <DetailRow label="Date" value={formattedDate} />

        {canDownloadInvoice ? (
          <TouchableOpacity
            style={[
              styles.downloadBtn,
              isDownloading && styles.downloadBtnDisabled,
            ]}
            disabled={isDownloading}
            onPress={() => handleDownloadAndViewInvoice(transactionId)}>
            {isDownloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.downloadBtnText}>Download Invoice</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.invoiceUnavailable}>
            <Text style={styles.invoiceUnavailableText}>
              Invoice not available
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#161415" size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyBox}>
          <SkeltonCard />
          <SkeltonCard />
          <SkeltonCard />
        </View>
      );
    }
    return <Text style={styles.noData}>No transactions found.</Text>;
  };

  return (
    <>
      <PageLoader loading={loading && transactions.length === 0} />
      <PageContainer>
        <Text style={styles.heading}>Transaction History</Text>

        <FlatList
          data={transactions}
          keyExtractor={(item, index) =>
            String(getTransactionId(item) ?? `transaction-${index}`)
          }
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      </PageContainer>

      <Modal
        visible={invoiceModal.visible}
        animationType="slide"
        onRequestClose={closeInvoiceModal}
        statusBarTranslucent>
        <View style={styles.invoiceModalBox}>
          <View style={styles.invoiceModalHeader}>
            <TouchableOpacity onPress={closeInvoiceModal}>
              <Image source={assets.back} style={styles.invoiceBackIcon} />
            </TouchableOpacity>
            <Text style={styles.invoiceModalTitle}>Invoice</Text>
            <View style={styles.invoiceHeaderSpacer} />
          </View>

          <View style={styles.invoiceWebViewWrap}>
            {invoiceModal.loading ? (
              <View style={styles.invoiceLoadingBox}>
                <ActivityIndicator color="#161415" size="large" />
                <Text style={styles.invoiceLoadingText}>
                  Downloading invoice...
                </Text>
              </View>
            ) : invoiceModal.invoiceFile?.viewUri ? (
              <WebView
                source={{uri: invoiceModal.invoiceFile.viewUri}}
                originWhitelist={['*']}
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                onError={() => {
                  if (invoiceModal.invoiceFile?.downloadPath) {
                    viewInvoiceFile(invoiceModal.invoiceFile.downloadPath);
                  }
                }}
                renderLoading={() => (
                  <View style={styles.invoiceLoadingBox}>
                    <ActivityIndicator color="#161415" size="large" />
                  </View>
                )}
                style={styles.invoiceWebView}
              />
            ) : invoiceModal.invoiceFile?.base64 ? (
              <WebView
                source={{
                  html: getInvoicePreviewHtml(invoiceModal.invoiceFile.base64),
                }}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                style={styles.invoiceWebView}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TransactionHistory;

const styles = StyleSheet.create({
  heading: {
    paddingLeft: 5,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
    marginTop: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 18,
    fontFamily: 'Gotham-Black',
    color: '#161415',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusFailed: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Gotham-Book',
    color: '#777',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
    flex: 1.2,
    textAlign: 'right',
  },
  downloadBtn: {
    backgroundColor: '#161415',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 10,
  },
  downloadBtnDisabled: {
    opacity: 0.7,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
  },
  invoiceUnavailable: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  invoiceUnavailableText: {
    fontSize: 13,
    fontFamily: 'Gotham-Book',
    color: '#777',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyBox: {
    marginTop: 10,
  },
  noData: {
    fontSize: 14,
    fontFamily: 'Gotham-Book',
    textAlign: 'center',
    marginTop: 80,
    color: '#555',
  },
  invoiceModalBox: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
  },
  invoiceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#e8e8e8',
  },
  invoiceBackIcon: {
    width: 16,
    height: 16,
  },
  invoiceModalTitle: {
    fontSize: 16,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  invoiceHeaderSpacer: {
    width: 16,
  },
  invoiceWebViewWrap: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  invoiceWebView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  invoiceLoadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  invoiceLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Gotham-Book',
    color: '#555',
  },
});
