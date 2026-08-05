import axios from 'axios';

const walletApi = axios.create({
  baseURL: process.env.WALLET_API_BASE_URL || 'https://api-ewallet.eroot.ng/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default walletApi;