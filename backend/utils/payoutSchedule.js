import cron from 'node-cron';

import { getSettings, runAllPayouts } from './payoutService.js';

// Checks daily at 06:00 Lagos time whether today is a payout day.
export const startPayoutScheduler = () =>
  cron.schedule('0 6 * * *', async () => {
    const s = await getSettings();
    if (!s.autoPayout || s.payoutSchedule === 'manual') return;
    const now = new Date();
    const due = s.payoutSchedule === 'daily' || (s.payoutSchedule === 'weekly' && now.getDay() === s.payoutWeekday)
      || (s.payoutSchedule === 'monthly' && now.getDate() === s.payoutMonthDay);
    if (due) console.log('[payouts]', JSON.stringify(await runAllPayouts({ trigger: 'scheduled' })));
  }, { timezone: 'Africa/Lagos' });