import { api } from '../api/api.js';
import { addMonths, format, isBefore, startOfMonth } from 'date-fns';

// Payment service to handle payment logic and due date calculations

export const paymentService = {
  // Calculate next due date based on payment duration
  calculateNextDueDate: (currentDueDate, months) => {
    const baseDate = currentDueDate ? new Date(currentDueDate) : new Date();
    return addMonths(baseDate, months);
  },

  // Get pending members (members whose due date has passed)
  getPendingMembers: async () => {
    try {
      const members = await api.getMembers();
      const today = new Date();
      const currentMonthStart = startOfMonth(today);
      
      return members
        .filter(member => member.isActive && !member.isDiscontinued)
        .map(member => {
          const dueDate = member.lastPaymentDate 
            ? new Date(member.lastPaymentDate)
            : new Date(member.joinDate);
          
          const nextDueDate = member.nextDueDate 
            ? new Date(member.nextDueDate)
            : paymentService.calculateNextDueDate(dueDate, 1);
          
          // Member is pending if their due date is before or in the current month
          const isPending = isBefore(nextDueDate, currentMonthStart) || 
                           format(nextDueDate, 'yyyy-MM') === format(currentMonthStart, 'yyyy-MM');
          
          // Calculate days overdue (negative means not yet due)
          const daysOverdue = Math.floor((today - nextDueDate) / (1000 * 60 * 60 * 24));
          
          return {
            ...member,
            nextDueDate: nextDueDate.toISOString(),
            isPending,
            daysOverdue: isPending ? Math.max(0, daysOverdue) : 0,
          };
        })
        .filter(member => member.isPending)
        .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
    } catch (error) {
      console.error('Error fetching pending members:', error);
      return [];
    }
  },

  // Process payment for a member
  processPayment: async (uniqueId, months, amountPaid, customPaymentDate = null, paymentMethod = 'cash') => {
    try {
      // Use custom payment date if provided, otherwise use today
      const paymentDate = customPaymentDate ? new Date(customPaymentDate) : new Date();
      const paymentMonthStart = startOfMonth(paymentDate);
      
      // Calculate new due date from the payment month start
      const newDueDate = addMonths(paymentMonthStart, months);
      
      // Create payment via API
      const payment = await api.createPayment({
        uniqueId,
        amount: amountPaid,
        months,
        paymentMethod,
        paymentDate: paymentDate.toISOString(),
        nextDueDate: newDueDate.toISOString(),
      });

      return payment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error(error.message || 'Payment processing failed');
    }
  },

  // Get payment history for a member
  getPaymentHistory: async (uniqueId) => {
    try {
      const payments = await api.getMemberPayments(uniqueId);
      return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  },
};
