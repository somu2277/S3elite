const cron = require('node-cron');
const Student = require('../models/Student');

const startPaymentReminderJobs = () => {
  // Run every day at 09:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON JOB] Running automated rent reminder & overdue checker...');
    try {
      const students = await Student.find().populate('user');
      const now = new Date();

      students.forEach(async (student) => {
        if (student.paymentStatus !== 'Paid') {
          const dueDate = new Date(student.rentDueDate);
          const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

          if (diffDays === 3) {
            console.log(`[ALERT] Early reminder sent to ${student.user?.name} (3 days before due date)`);
          } else if (diffDays === 2) {
            console.log(`[ALERT] Follow-up reminder sent to ${student.user?.name} (2 days before due date)`);
          } else if (diffDays === 0) {
            console.log(`[ALERT] Due-date reminder sent to ${student.user?.name}`);
          } else if (diffDays < 0 && student.paymentStatus !== 'Overdue') {
            student.paymentStatus = 'Overdue';
            await student.save();
            console.log(`[OVERDUE ALERT] Marked ${student.user?.name} as Overdue! Owner notified.`);
          }
        }
      });
    } catch (err) {
      console.error('Error running payment reminder job:', err);
    }
  });

  console.log('Automated Payment Reminder Cron Jobs initialized');
};

module.exports = startPaymentReminderJobs;
