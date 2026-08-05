import User from '../models/User.js';
import WalletTransaction from '../models/walletTransaction.js';
import walletApi from '../utils/walletApi.js';
import { generateWalletReference } from '../utils/generateWalletReference.js';


// ─── LOGIN TO WALLET SERVICE ────────────────────────────────────
export const loginWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const { data } = await walletApi.post('/login', {
      email: user.email,
      password: process.env.WALLET_LOGIN_PASSWORD,
    });
console.log(data)
    return res.status(200).json({
      status: true,
      walletToken: data.token,
      wallet: {
        customerCode: user.wallet?.customerCode || null,
        accountNumber: user.wallet?.accountNumber || null,
        accountName: user.wallet?.accountName || null,
        bankName: user.wallet?.bankName || null,
        currency: user.wallet?.currency || 'NGN',
      },
    });
  } catch (error) {
    console.error('Wallet login failed:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      status: false,
      message: error.response?.data?.message || 'Unable to connect to wallet service',
    });
  }
};

// ─── ACCOUNT DETAILS (from DB, no external call needed) ─────────
export const getAccountDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const dedicated = user.walletData?.user?.customer?.dedicated_account;
    console.log(user)
    console.log(dedicated)

    return res.status(200).json({
      status: true,
      account: {
        customerCode: user.walletData?.customer?.customer_code || user.walletData?.user?.customer?.customer_code,
        accountNumber: user.walletData?.dedicated_account?.account_number || dedicated?.account_number,
        accountName: user.walletData?.dedicated_account?.account_name || dedicated?.account_name,
        bankName: user.walletData?.dedicated_account?.bank_name || dedicated?.bank_name,
        currency: user.walletData?.dedicated_account?.currency || dedicated?.currency || 'NGN',
        balance: user.wallet?.balance ?? null,
        balanceLastSyncedAt: user.wallet?.balanceLastSyncedAt || null,
      },
    });
  } catch (error) {
    console.error('Account details fetch failed:', error.message);
    return res.status(500).json({ status: false, message: 'Unable to fetch account details' });
  }
};

// ─── BALANCE ──────────────────────────────────────────────────
export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { data } = await walletApi.get('/check/balance/by/email', {
      params: { email: user.email },
      headers: { Authorization: `Bearer ${req.walletToken}` },
    });

    // Adjust this line once you confirm the exact response shape
    const balance = data?.balance ?? data?.data?.balance ?? 0;

    user.wallet = {
      ...(user.wallet?.toObject ? user.wallet.toObject() : user.wallet || {}),
      balance,
      balanceLastSyncedAt: new Date(),
    };
    await user.save();

    return res.status(200).json({ status: true, balance, raw: data });
  } catch (error) {
    console.error('Balance fetch failed:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      status: false,
      message: error.response?.data?.message || 'Unable to fetch balance',
    });
  }
};

// ─── TRANSFER ─────────────────────────────────────────────────
export const transferFunds = async (req, res) => {
  const { amount, recipient, reason, currency, reference, save_beneficiary, bank_code, bank_name } = req.body;

  if (!amount || !recipient) {
    return res.status(400).json({ status: false, message: 'amount and recipient are required' });
  }
  if (save_beneficiary && (!bank_code || !bank_name)) {
    return res.status(400).json({
      status: false,
      message: 'bank_code and bank_name are required when saving a beneficiary',
    });
  }

  const txReference = reference || generateWalletReference();
  let localTx;

  try {
    localTx = await WalletTransaction.create({
      user: req.user._id,
      type: 'transfer',
      amount,
      currency: currency || 'NGN',
      recipient,
      reason,
      reference: txReference,
      bankCode: bank_code,
      bankName: bank_name,
      savedBeneficiary: !!save_beneficiary,
      status: 'pending',
    });

    const { data } = await walletApi.post(
      '/transfer',
      { amount, recipient, reason, currency: currency || 'NGN', reference: txReference, save_beneficiary, bank_code, bank_name },
      { headers: { Authorization: `Bearer ${req.walletToken}` } }
    );

    localTx.status = 'success';
    localTx.rawResponse = data;
    await localTx.save();

    return res.status(200).json({ status: true, transaction: localTx, raw: data });
  } catch (error) {
    console.error('Transfer failed:', error.response?.data || error.message);
    if (localTx) {
      localTx.status = 'failed';
      localTx.rawResponse = error.response?.data || { message: error.message };
      await localTx.save();
    }
    return res.status(error.response?.status || 500).json({
      status: false,
      message: error.response?.data?.message || 'Transfer failed',
      transaction: localTx,
    });
  }
};

// ─── TRANSFER HISTORY (proxied + synced to our own DB) ───────────
export const getTransferHistory = async (req, res) => {
  const { per_page = 20, page = 1 } = req.query;

  try {
    const { data } = await walletApi.get('/transfer-history', {
      params: { per_page, page },
      headers: { Authorization: `Bearer ${req.walletToken}` },
    });

    const remoteList = data?.data || data?.transfers || [];
    if (Array.isArray(remoteList) && remoteList.length) {
      const ops = remoteList
        .filter((t) => t.reference)
        .map((t) => ({
          updateOne: {
            filter: { reference: t.reference },
            update: {
              $setOnInsert: { user: req.user._id, type: 'transfer', reference: t.reference },
              $set: {
                amount: t.amount,
                currency: t.currency || 'NGN',
                recipient: t.recipient || t.recipient_code,
                reason: t.reason,
                status: t.status || 'success',
                rawResponse: t,
              },
            },
            upsert: true,
          },
        }));
      if (ops.length) await WalletTransaction.bulkWrite(ops);
    }

    return res.status(200).json({ status: true, history: data });
  } catch (error) {
    console.error('Transfer history fetch failed:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      status: false,
      message: error.response?.data?.message || 'Unable to fetch transfer history',
    });
  }
};





































