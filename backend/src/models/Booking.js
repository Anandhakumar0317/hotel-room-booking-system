import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    /*
    ========================================
    BOOKING ID
    ========================================
    Example:
    STY-20260814-4827
    */

    bookingId: {
      type: String,
      unique: true,
      index: true,
    },


    /*
    ========================================
    HOTEL / ROOM / USER
    ========================================
    */

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },


    /*
    ========================================
    STAY DETAILS
    ========================================
    */

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    guests: {
      type: Number,
      default: 1,
      min: 1,
    },


    /*
    ========================================
    BOOKING STATUS
    ========================================
    */

    status: {
      type: String,
      enum: [
        'confirmed',
        'cancelled',
      ],
      default: 'confirmed',
    },


    /*
    ========================================
    PAYMENT
    ========================================
    */

    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'paid',
        'refunded',
      ],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: [
        'online',
        'offline',
      ],
      default: 'online',
    },

    transactionId: {
      type: String,
      default: null,
    },


    /*
    ========================================
    CANCELLATION POLICY
    ========================================
    */

    policyAccepted: {
      type: Boolean,
      default: false,
    },


    /*
    ========================================
    REFUND DETAILS
    ========================================
    */

    refundPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundStatus: {
      type: String,
      enum: [
        'not_applicable',
        'pending',
        'processed',
      ],
      default: 'not_applicable',
    },


    /*
    ========================================
    TOTAL
    ========================================
    */

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

  },
  {
    timestamps: true,
  }
);


/*
========================================
GENERATE USER-FRIENDLY BOOKING ID
========================================

Example:

STY-20260814-4827

STY       = StayEasy
20260814  = Booking date
4827      = Random number
*/

schema.pre('save', async function (next) {

  if (!this.bookingId) {

    let bookingId;

    do {

      const date = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

      const number =
        Math.floor(
          1000 +
          Math.random() * 9000
        );

      bookingId =
        `STY-${date}-${number}`;

    } while (
      await mongoose.models.Booking.exists({
        bookingId,
      })
    );

    this.bookingId = bookingId;
  }

  next();
});


export default mongoose.model(
  'Booking',
  schema
);