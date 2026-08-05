import User from "../models/User.js";
export const POINTS_TO_NAIRA_RATE = 1; // 1 point = ₦1
// export const MIN_REDEEMABLE_POINTS = 30; // ₦1,000 minimum
export const MIN_REDEEMABLE_POINTS = 1000; // ₦1,000 minimum

export const LOYALTY_ACTION_LABELS = {
  // hire_completed: 'Hire Completed',
  // completed_hire_as_provider: 'Completed Job as Provider',
  // completed_hire_as_client: 'Completed Job as Client',
  // user_registration: 'Account Registration',
  // referral: 'Referral Bonus',
  referral_signup: 'Referral Signup',
  // job_referral: 'Job Referral',
};

export const LOYALTY_ACTION_POINTS = {
  referral_signup: 20,
  // job_referral: 10,
};




export const awardPoints = async (userId, amount, type, hireId = null) => {
  if (!userId || !amount || amount <= 0) return;

  await User.findByIdAndUpdate(userId, {
    $inc: { referralPoints: amount },
    $push: {
      loyaltyTransactions: {
        type,
        amount,
        ...(hireId ? { hireId } : {}),
      },
    },
  });
};