import Member from '../models/Member.js';
import Notification from '../models/Notification.js';

/**
 * Calculates status and remaining days based on joining and expiry dates
 * @param {Date|String} expiryDate 
 * @returns {Object} { status, remainingDays }
 */
export const calculateStatusAndDays = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  
  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return { status: 'Expired', remainingDays: 0 };
  } else if (diffDays <= 7) {
    return { status: 'Expiring Soon', remainingDays: diffDays };
  } else {
    return { status: 'Active', remainingDays: diffDays };
  }
};

/**
 * Sweeps all members and updates their statuses, generating notifications if required
 */
export const checkAndUpdateAllMemberships = async () => {
  try {
    const members = await Member.find().populate('plan');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const member of members) {
      const { status: newStatus, remainingDays } = calculateStatusAndDays(member.expiryDate);
      
      const oldStatus = member.status;
      
      // Update member status if changed
      if (oldStatus !== newStatus) {
        member.status = newStatus;
        await member.save();
        
        // Check if we need to issue a notification
        if (newStatus === 'Expired' && oldStatus !== 'Expired') {
          // Check if notification already exists
          const exists = await Notification.findOne({
            member: member._id,
            type: 'Expired'
          });
          if (!exists) {
            await Notification.create({
              type: 'Expired',
              member: member._id,
              title: '🔴 Membership Expired',
              message: `Membership for ${member.fullName} (ID: ${member.memberId}) has expired on ${new Date(member.expiryDate).toLocaleDateString()}. Pending amount: $${member.feesPending}.`
            });
          }
        } else if (newStatus === 'Expiring Soon' && oldStatus === 'Active') {
          const exists = await Notification.findOne({
            member: member._id,
            type: 'Expiring Soon'
          });
          if (!exists) {
            await Notification.create({
              type: 'Expiring Soon',
              member: member._id,
              title: '⚠️ Membership Expiring Soon',
              message: `Membership for ${member.fullName} (ID: ${member.memberId}) expires in ${remainingDays} days on ${new Date(member.expiryDate).toLocaleDateString()}.`
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during membership sweep:', error.message);
  }
};
