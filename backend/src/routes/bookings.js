import { Router } from 'express';

import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

import {
  auth,
  admin,
} from '../middleware.js';

import {
  sendBookingEmail,
  invoicePdf,
} from '../services.js';


const r = Router();


/*
========================================
ONLY CONFIRMED BOOKINGS BLOCK A ROOM
========================================
*/

const overlap = {
  status: 'confirmed',
};


/*
========================================
ADMIN - ALL BOOKINGS
========================================
*/

r.get(
  '/',
  auth,
  admin,
  async (req, res) => {

    try {

      const page = Math.max(
        1,
        Number(req.query.page) || 1
      );

      const limit = Math.min(
        50,
        Math.max(
          1,
          Number(req.query.limit) || 10
        )
      );

      const search = (
        req.query.search || ''
      ).toLowerCase();


      const filter = {};

      if (req.query.status) {
        filter.status =
          req.query.status;
      }


      const data =
        await Booking.find(filter)
          .populate('property user')
          .sort({
            createdAt: -1,
          });


      /*
      ====================================
      SEARCH
      ====================================
      */

      const filtered = search
        ? data.filter((b) => {

            const room =
              b.property?.rooms?.find(
                (r) =>
                  String(r._id) ===
                  String(b.roomId)
              );

            return `
              ${b.bookingId || ''}
              ${b.property?.name || ''}
              ${b.property?.location || ''}
              ${b.user?.name || ''}
              ${b.user?.email || ''}
              ${room?.roomNumber || ''}
              ${room?.type || ''}
              ${b.status || ''}
              ${b.paymentStatus || ''}
              ${b.paymentMethod || ''}
            `
              .toLowerCase()
              .includes(search);

          })
        : data;


      const start =
        (page - 1) * limit;

      const items =
        filtered.slice(
          start,
          start + limit
        );


      res.json({
        items,
        total: filtered.length,
        page,
        limit,
        totalPages:
          Math.max(
            1,
            Math.ceil(
              filtered.length /
              limit
            )
          ),
      });

    } catch (e) {

      res.status(500).json({
        message: e.message,
      });

    }

  }
);


/*
========================================
USER - MY BOOKINGS
========================================
*/

r.get(
  '/mine',
  auth,
  async (req, res) => {

    try {

      const bookings =
        await Booking.find({
          user: req.user.id,
        })
          .populate(
            'property user'
          )
          .sort({
            createdAt: -1,
          });


      res.json(bookings);

    } catch (e) {

      res.status(500).json({
        message: e.message,
      });

    }

  }
);


/*
========================================
CALENDAR
========================================
*/

r.get(
  '/calendar/:propertyId',
  async (req, res) => {

    try {

      const from = new Date(
        req.query.from ||
        Date.now()
      );

      const to = new Date(
        req.query.to ||
        Date.now() +
        90 * 86400000
      );


      const bookings =
        await Booking.find({
          property:
            req.params.propertyId,

          status: 'confirmed',

          checkIn: {
            $lt: to,
          },

          checkOut: {
            $gt: from,
          },

        }).select(
          'bookingId roomId checkIn checkOut'
        );


      res.json(bookings);

    } catch (e) {

      res.status(500).json({
        message: e.message,
      });

    }

  }
);


/*
========================================
CREATE BOOKING
========================================
*/

r.post(
  '/',
  auth,
  async (req, res) => {

    try {

      const {
        property,
        roomId,
        checkIn,
        checkOut,
        guests,
        paymentMethod,
        policyAccepted,
      } = req.body;


      /*
      ====================================
      VALIDATION
      ====================================
      */

      if (
        paymentMethod !== 'online' &&
        paymentMethod !== 'offline'
      ) {

        return res.status(400).json({
          message:
            'Please select a valid payment method.',
        });

      }


      if (
        policyAccepted !== true
      ) {

        return res.status(400).json({
          message:
            'Please accept the Terms and Cancellation Policy.',
        });

      }


      const from =
        new Date(checkIn);

      const to =
        new Date(checkOut);


      if (
        Number.isNaN(
          from.getTime()
        ) ||
        Number.isNaN(
          to.getTime()
        )
      ) {

        return res.status(400).json({
          message:
            'Invalid check-in or check-out date.',
        });

      }


      /*
      ====================================
      CHECK DATE ORDER
      ====================================
      */

      if (!(from < to)) {

        return res.status(400).json({
          message:
            'Check-out must be after check-in.',
        });

      }


      /*
      ====================================
      CHECK PAST DATE
      ====================================
      */

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      if (from < today) {

        return res.status(400).json({
          message:
            'Check-in cannot be in the past.',
        });

      }


      /*
      ====================================
      PROPERTY
      ====================================
      */

      const p =
        await Property.findById(
          property
        );


      if (!p) {

        return res.status(404).json({
          message:
            'Property not found.',
        });

      }


      /*
      ====================================
      ROOM
      ====================================
      */

      const room =
        p.rooms.id(roomId);


      if (!room) {

        return res.status(404).json({
          message:
            'Room not found.',
        });

      }


      /*
      ====================================
      GUEST CAPACITY
      ====================================
      */

      const guestCount =
        Number(guests) || 1;


      if (
        guestCount < 1
      ) {

        return res.status(400).json({
          message:
            'At least one guest is required.',
        });

      }


      if (
        guestCount >
        room.capacity
      ) {

        return res.status(400).json({
          message:
            `Maximum capacity is ${room.capacity}.`,
        });

      }


      /*
      ====================================
      DOUBLE BOOKING CHECK
      ====================================
      */

      const conflict =
        await Booking.findOne({

          property,

          roomId,

          ...overlap,

          checkIn: {
            $lt: to,
          },

          checkOut: {
            $gt: from,
          },

        });


      if (conflict) {

        return res.status(409).json({
          message:
            'Room is already booked for the selected dates.',
        });

      }


      /*
      ====================================
      CALCULATE NIGHTS
      ====================================
      */

      const nights =
        Math.ceil(
          (
            to.getTime() -
            from.getTime()
          ) /
          86400000
        );


      const totalAmount =
        nights *
        room.price;


      /*
      ====================================
      CREATE BOOKING
      ====================================
      */

      const b =
        await Booking.create({

          property,

          roomId,

          user:
            req.user.id,

          checkIn:

            from,

          checkOut:

            to,

          guests:
            guestCount,

          status:
            'confirmed',

          paymentStatus:
            'pending',

          paymentMethod,

          policyAccepted:

            true,

          totalAmount,

        });


      /*
      ====================================
      POPULATE
      ====================================
      */

      await b.populate([
        'property',
        'user',
      ]);


      res.status(201).json(b);

    } catch (e) {

      console.error(
        'Booking create error:',
        e
      );

      res.status(400).json({
        message: e.message,
      });

    }

  }
);


/*
========================================
PAYMENT
========================================
*/

r.post(
  '/:id/pay',
  auth,
  async (req, res) => {

    try {

      const b =
        await Booking.findById(
          req.params.id
        ).populate([
          'property',
          'user',
        ]);


      if (!b) {

        return res.status(404).json({
          message:
            'Booking not found.',
        });

      }


      /*
      ====================================
      OWNER CHECK
      ====================================
      */

      if (
        req.user.role !== 'admin' &&
        String(
          b.user._id
        ) !== req.user.id
      ) {

        return res.status(403).json({
          message:
            'Not allowed.',
        });

      }


      /*
      ====================================
      CANCELLED CHECK
      ====================================
      */

      if (
        b.status ===
        'cancelled'
      ) {

        return res.status(400).json({
          message:
            'Cancelled booking cannot be paid.',
        });

      }


      /*
      ====================================
      ALREADY PAID
      ====================================
      */

      if (
        b.paymentStatus ===
        'paid'
      ) {

        return res.status(400).json({
          message:
            'Booking is already paid.',
        });

      }


      /*
      ====================================
      PAYMENT METHOD
      ====================================
      */

      const method =
        req.body.method ||
        b.paymentMethod;


      if (
        method !== 'online' &&
        method !== 'offline'
      ) {

        return res.status(400).json({
          message:
            'Invalid payment method.',
        });

      }


      /*
      ====================================
      ONLINE PAYMENT
      ====================================
      */

      if (
        method === 'online'
      ) {

        b.paymentMethod =
          'online';

        b.paymentStatus =
          'paid';

        b.transactionId =
          req.body.transactionId ||
          `DEMO-${Date.now()}`;

      }


      /*
      ====================================
      OFFLINE PAYMENT
      ====================================
      */

      if (
        method === 'offline'
      ) {

        b.paymentMethod =
          'offline';

        b.paymentStatus =
          'pending';

      }


      await b.save();


      /*
      ====================================
      EMAIL ONLY AFTER ONLINE PAYMENT
      ====================================
      */

      if (
        method === 'online'
      ) {

        try {

          await sendBookingEmail(
            b
          );

        } catch (e) {

          console.error(
            'Email failed:',
            e.message
          );

        }

      }


      res.json(b);

    } catch (e) {

      res.status(400).json({
        message: e.message,
      });

    }

  }
);


/*
========================================
INVOICE
========================================
*/

r.get(
  '/:id/invoice',
  auth,
  async (req, res) => {

    try {

      const b =
        await Booking.findById(
          req.params.id
        ).populate([
          'property',
          'user',
        ]);


      if (!b) {

        return res.status(404).json({
          message:
            'Booking not found.',
        });

      }


      /*
      ====================================
      OWNER CHECK
      ====================================
      */

      if (
        req.user.role !== 'admin' &&
        String(
          b.user._id
        ) !== req.user.id
      ) {

        return res.status(403).json({
          message:
            'Not allowed.',
        });

      }


      invoicePdf(
        b,
        res
      );

    } catch (e) {

      res.status(500).json({
        message: e.message,
      });

    }

  }
);


/*
========================================
CANCEL BOOKING
========================================

Refund policy:

0 - 2 hours   = 100%
2 - 4 hours   = 50%
4 - 6 hours   = 25%
6+ hours      = 0%

IMPORTANT:
Refund applies only if payment
was already made.
========================================
*/

r.patch(
  '/:id/cancel',
  auth,
  async (req, res) => {

    try {

      const b =
        await Booking.findById(
          req.params.id
        );


      if (!b) {

        return res.status(404).json({
          message:
            'Booking not found.',
        });

      }


      /*
      ====================================
      OWNER CHECK
      ====================================
      */

      if (
        req.user.role !== 'admin' &&
        String(b.user) !== req.user.id
      ) {

        return res.status(403).json({
          message:
            'Not allowed.',
        });

      }


      /*
      ====================================
      ALREADY CANCELLED
      ====================================
      */

      if (
        b.status ===
        'cancelled'
      ) {

        return res.status(400).json({
          message:
            'Booking is already cancelled.',
        });

      }


      /*
      ====================================
      CALCULATE HOURS SINCE BOOKING
      ====================================
      */

      const now =
        new Date();

      const createdAt =
        new Date(
          b.createdAt
        );


      const hoursSinceBooking =
        (
          now.getTime() -
          createdAt.getTime()
        ) /
        3600000;


      /*
      ====================================
      REFUND %
      ====================================
      */

      let refundPercentage =
        0;


      if (
        hoursSinceBooking <= 2
      ) {

        refundPercentage =
          100;

      } else if (
        hoursSinceBooking <= 4
      ) {

        refundPercentage =
          50;

      } else if (
        hoursSinceBooking <= 6
      ) {

        refundPercentage =
          25;

      } else {

        refundPercentage =
          0;

      }


      /*
      ====================================
      REFUND AMOUNT
      ====================================
      */

      let refundAmount = 0;

      let refundStatus =
        'not_applicable';


      if (
        b.paymentStatus ===
        'paid'
      ) {

        refundAmount =
          Number(
            (
              b.totalAmount *
              refundPercentage /
              100
            ).toFixed(2)
          );


        if (
          refundAmount > 0
        ) {

          refundStatus =
            'pending';

          b.paymentStatus =
            'paid';

        } else {

          refundStatus =
            'not_applicable';

        }

      }


      /*
      ====================================
      SAVE CANCELLATION
      ====================================
      */

      b.status =
        'cancelled';

      b.refundPercentage =
        refundPercentage;

      b.refundAmount =
        refundAmount;

      b.refundStatus =
        refundStatus;


      /*
      Offline booking:
      No payment was made,
      therefore no refund.
      */

      if (
        b.paymentStatus ===
        'pending'
      ) {

        b.refundPercentage =
          0;

        b.refundAmount =
          0;

        b.refundStatus =
          'not_applicable';

      }


      await b.save();


      res.json({

        message:
          'Booking cancelled successfully.',

        bookingId:
          b.bookingId,

        status:
          b.status,

        paymentStatus:
          b.paymentStatus,

        refundPercentage:
          b.refundPercentage,

        refundAmount:
          b.refundAmount,

        refundStatus:
          b.refundStatus,

      });

    } catch (e) {

      console.error(
        'Cancellation error:',
        e
      );

      res.status(400).json({
        message: e.message,
      });

    }

  }
);


/*
========================================
ADMIN - APPROVE REFUND
========================================
*/

r.patch(
  '/:id/refund',
  auth,
  admin,
  async (req, res) => {

    try {

      const b =
        await Booking.findById(
          req.params.id
        );

      if (!b) {

        return res.status(404).json({
          message:
            'Booking not found.',
        });

      }

      if (
        b.status !==
        'cancelled'
      ) {

        return res.status(400).json({
          message:
            'Only cancelled bookings can be refunded.',
        });

      }

      if (
        Number(
          b.refundAmount || 0
        ) <= 0
      ) {

        return res.status(400).json({
          message:
            'No refund amount available.',
        });

      }

      if (
        b.refundStatus ===
        'processed'
      ) {

        return res.status(400).json({
          message:
            'Refund is already processed.',
        });

      }

      b.refundStatus =
        'processed';

      await b.save();

      res.json({

        message:
          'Refund approved successfully.',

        bookingId:
          b.bookingId,

        refundPercentage:
          b.refundPercentage,

        refundAmount:
          b.refundAmount,

        refundStatus:
          b.refundStatus,

      });

    } catch (e) {

      console.error(
        'Refund approval error:',
        e
      );

      res.status(400).json({
        message:
          e.message,
      });

    }

  }
);


export default r;
