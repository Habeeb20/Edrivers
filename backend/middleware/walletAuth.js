export const requireWalletToken = (req, res, next) => {
  const token = req.headers['x-wallet-token'];
  if (!token) {
    return res.status(401).json({
      status: false,
      code: 'WALLET_TOKEN_MISSING',
      message: 'Wallet session expired. Please reconnect your wallet.',
    });
  }
  req.walletToken = token;
  next();
};