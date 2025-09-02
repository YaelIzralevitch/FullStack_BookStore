// services/stripe.service.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require("../config/db");

/**
 * get or create stripe customer
 */
async function getOrCreateStripeCustomer(userId, userEmail) {
  try {
    //check if user already has a stripe customer id
    const [rows] = await pool.query(
      'SELECT stripe_customer_id FROM users WHERE id = ?',
      [userId]
    );
    const existingUser = rows[0];


    if (existingUser && existingUser.stripe_customer_id) {
      return existingUser.stripe_customer_id;
    }

    // create new stripe customer
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { user_id: userId.toString() }
    });

    await pool.query(
      'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
      [customer.id, userId]
    );

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * get saved card for user
 */
async function getUserSavedCard(userId) {
  try {
    const [cardData] = await pool.query(`
      SELECT 
        stripe_payment_method_id,
        card_last_four,
        card_brand,
        card_exp_month,
        card_exp_year
      FROM user_credit_cards 
      WHERE user_id = ?
    `, [userId]);

    return cardData.length > 0 ? cardData[0] : null;
  } catch (error) {
    console.error('Error getting saved Stripe card:', error);
    return null;
  }
}

/**
 * save new card for user
 */
async function saveCard(userId, userEmail, paymentMethodId) {
  try {

    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);

    // add payment method to customer in stripe
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId
    });


    // retrieve payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const card = paymentMethod.card;

    await pool.query(`
      INSERT INTO user_credit_cards 
      (user_id, stripe_payment_method_id, 
       card_last_four, card_brand, card_exp_month, card_exp_year)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      stripe_payment_method_id = VALUES(stripe_payment_method_id),
      card_last_four = VALUES(card_last_four),
      card_brand = VALUES(card_brand),
      card_exp_month = VALUES(card_exp_month),
      card_exp_year = VALUES(card_exp_year)
    `, [
      userId,
      paymentMethodId,
      card.last4,
      card.brand,
      card.exp_month,
      card.exp_year
    ]);
  } catch (error) {
    console.error('Error saving Stripe card:', error);
    throw error;
  }
}

/**
 * process payment with stripe
 */
async function processStripePayment(userId, userEmail, amount, paymentData) {
  try {
    const { useSavedCard, saveNewCard, paymentMethodId } = paymentData;

    let finalPaymentMethodId = null;
    let cardSaved = false;

    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);

    if (useSavedCard) {
      // ========== use save card ==========
      const savedCard = await getUserSavedCard(userId);
      
      if (!savedCard) {
        throw new Error('No saved card found for this user');
      }

      finalPaymentMethodId = savedCard.stripe_payment_method_id;

    } else {
      // ========== new card ==========
      if (!paymentMethodId) {
        throw new Error('Payment method ID is required for new card payments');
      }

      finalPaymentMethodId = paymentMethodId;

      // if want to save the new card
      if (saveNewCard) {
        await saveCard(userId, stripeCustomerId, finalPaymentMethodId);
        cardSaved = true;
      }
    }

    // ========== payment ==========
    const paymentIntentData = {
      customer: stripeCustomerId, 
      receipt_email: userEmail,
      amount: Math.round(amount * 100), 
      currency: 'usd',
      payment_method: finalPaymentMethodId,
      confirm: true,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-complete`
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    return {
      success: paymentIntent.status === 'succeeded',
      paymentIntentId: paymentIntent.id,
      cardSaved,
      message: paymentIntent.status === 'succeeded' 
        ? 'Payment processed successfully' 
        : 'Payment failed'
    };

  } catch (error) {
    console.error('Stripe payment processing error:', error);
    
    // handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return {
        success: false,
        message: error.message || 'Your card was declined'
      };
    }

    return {
      success: false,
      message: error.message || 'Payment processing failed'
    };
  }
}

/**
 * delete user's saved card
 */
async function deleteUserCard(userId) {
  try {
    const [cardData] = await pool.query(`
      SELECT stripe_payment_method_id 
      FROM user_credit_cards 
      WHERE user_id = ?
    `, [userId]);

    if (cardData && cardData.stripe_payment_method_id) {
      // detach from stripe customer
      await stripe.paymentMethods.detach(cardData.stripe_payment_method_id);
    }

    // delete from db
    await pool.query('DELETE FROM user_credit_cards WHERE user_id = ?', [userId]);

  } catch (error) {
    console.error('Error deleting Stripe card:', error);
    throw error;
  }
}

module.exports = {
  getUserSavedCard,
  saveCard,
  processStripePayment,
  deleteUserCard
};