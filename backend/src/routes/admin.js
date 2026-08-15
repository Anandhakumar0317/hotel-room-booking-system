import { Router } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import User from '../models/User.js';

import { auth, admin } from '../middleware.js';

const r = Router();

r.use(auth, admin);


/*
========================================
BUILD REPORT FILTER
========================================
*/

async function getReportBookings(query) {

  const {
    from,
    to,
    status,
    paymentStatus,
    paymentMethod,
    refundStatus,
    hotel,
    location,
    search,
  } = query;


  const filter = {};


  if (status && status !== 'all') {
    filter.status = status;
  }


  if (paymentStatus && paymentStatus !== 'all') {
    filter.paymentStatus = paymentStatus;
  }


  if (paymentMethod && paymentMethod !== 'all') {
    filter.paymentMethod = paymentMethod;
  }


  if (refundStatus && refundStatus !== 'all') {
    filter.refundStatus = refundStatus;
  }


  if (hotel && hotel !== 'all') {
    filter.property = hotel;
  }

  /*
  LOCATION FILTER

  Location belongs to Property, so first find
  matching properties and then filter bookings.
  */

  if (location && location !== 'all') {

    const locationProperties =
      await Property.find({
        location: location,
      }).select('_id').lean();

    filter.property = {
      $in: locationProperties.map(
        (p) => p._id
      ),
    };

  }


  /*
  DATE FILTER

  Booking must fall inside selected period.
  */

  if (from || to) {

    filter.checkIn = {};

    if (from) {
      filter.checkIn.$gte =
        new Date(`${from}T00:00:00`);
    }

    if (to) {
      filter.checkIn.$lte =
        new Date(`${to}T23:59:59.999`);
    }

  }


  let bookings =
    await Booking.find(filter)
      .populate('property', 'name location rooms')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();


  /*
  SEARCH

  Booking ID
  Guest name
  Guest email
  Room ID
  */

  if (search) {

    const term =
      String(search).toLowerCase().trim();

    bookings =
      bookings.filter((b) => {

        const bookingId =
          String(
            b.bookingId || ''
          ).toLowerCase();

        const guestName =
          String(
            b.user?.name || ''
          ).toLowerCase();

        const guestEmail =
          String(
            b.user?.email || ''
          ).toLowerCase();

        const roomId =
          String(
            b.roomId || ''
          ).toLowerCase();

        const hotelName =
          String(
            b.property?.name || ''
          ).toLowerCase();

        const location =
          String(
            b.property?.location || ''
          ).toLowerCase();

        return (
          bookingId.includes(term) ||
          guestName.includes(term) ||
          guestEmail.includes(term) ||
          roomId.includes(term) ||
          hotelName.includes(term) ||
          location.includes(term)
        );

      });

  }


  return bookings;

}


/*
========================================
FORMAT REPORT DATA
========================================
*/

function getReportSummary(bookings) {

  const totalBookings =
    bookings.length;


  const confirmed =
    bookings.filter(
      (b) =>
        b.status === 'confirmed'
    ).length;


  const cancelled =
    bookings.filter(
      (b) =>
        b.status === 'cancelled'
    ).length;


  /*
  GROSS BOOKING AMOUNT

  Total booking value in the selected report.
  */

  const grossBookingAmount =
    bookings.reduce(
      (sum, b) =>
        sum + Number(
          b.totalAmount || 0
        ),
      0
    );


  /*
  PAID REVENUE

  Cancelled bookings are excluded.
  */

  const paidRevenue =
    bookings
      .filter(
        (b) =>
          b.paymentStatus === 'paid' &&
          b.status !== 'cancelled'
      )
      .reduce(
        (sum, b) =>
          sum + Number(
            b.totalAmount || 0
          ),
        0
      );


  const refundPending =
    bookings
      .filter(
        (b) =>
          b.refundStatus === 'pending'
      )
      .reduce(
        (sum, b) =>
          sum + Number(
            b.refundAmount || 0
          ),
        0
      );


  const refundCompleted =
    bookings
      .filter(
        (b) =>
          b.refundStatus === 'processed'
      )
      .reduce(
        (sum, b) =>
          sum + Number(
            b.refundAmount || 0
          ),
        0
      );


  /*
  NET REVENUE

  Paid revenue already excludes cancelled
  bookings, so completed refunds are shown
  separately and are NOT deducted again.
  */

  const netRevenue =
    paidRevenue;


  return {
    totalBookings,
    confirmed,
    cancelled,
    grossBookingAmount,
    paidRevenue,
    refundPending,
    refundCompleted,
    netRevenue,
  };

}


/*
========================================
ADMIN STATS
========================================
*/

r.get(
  '/stats',
  async (req, res) => {

    try {

      const [
        properties,
        users,
        confirmed,
        cancelled,
        revenue,
      ] =
        await Promise.all([

          Property.countDocuments(),

          User.countDocuments(),

          Booking.countDocuments({
            status: 'confirmed',
          }),

          Booking.countDocuments({
            status: 'cancelled',
          }),

          Booking.aggregate([
            {
              $match: {
                paymentStatus: 'paid',
                status: {
                  $ne: 'cancelled',
                },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: '$totalAmount',
                },
              },
            },
          ]),

        ]);


      res.json({

        properties,

        users,

        confirmed,

        cancelled,

        revenue:
          revenue[0]?.total || 0,

      });

    } catch (e) {

      console.error(
        'Admin stats error:',
        e
      );

      res.status(500).json({
        message:
          'Unable to load admin statistics.',
      });

    }

  }
);


/*
========================================
REPORT DATA
========================================
*/

r.get(
  '/reports/bookings',
  async (req, res) => {

    try {

      const bookings =
        await getReportBookings(
          req.query
        );


      const summary =
        getReportSummary(
          bookings
        );


      res.json({
        bookings,
        summary,
      });

    } catch (e) {

      console.error(
        'Report data error:',
        e
      );

      res.status(500).json({
        message:
          'Unable to generate report.',
      });

    }

  }
);


/*
========================================
PDF REPORT
========================================
*/

r.get(
  '/reports/bookings.pdf',
  async (req, res) => {

    try {

      const bookings =
        await getReportBookings(
          req.query
        );


      const summary =
        getReportSummary(
          bookings
        );


      const doc =
        new PDFDocument({
          size: 'A4',
          margin: 40,
        });


      res.setHeader(
        'Content-Type',
        'application/pdf'
      );


      res.setHeader(
        'Content-Disposition',
        'attachment; filename="stayeasy-booking-report.pdf"'
      );


      doc.pipe(res);


      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(
          'StayEasy',
          {
            align: 'center',
          }
        );


      doc
        .fontSize(11)
        .font('Helvetica')
        .text(
          'Booking Report',
          {
            align: 'center',
          }
        );


      doc.moveDown();


      doc
        .fontSize(10)
        .text(
          `Generated: ${
            new Date().toLocaleString('en-IN')
          }`
        );


      if (req.query.from || req.query.to) {

        doc.text(
          `Period: ${
            req.query.from || 'All'
          } → ${
            req.query.to || 'All'
          }`
        );

      }


      doc.moveDown();


      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('SUMMARY');


      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          `Total Bookings: ${summary.totalBookings}`
        )
        .text(
          `Confirmed: ${summary.confirmed}`
        )
        .text(
          `Cancelled: ${summary.cancelled}`
        )
        .text(
          `Gross Booking Amount: ₹${summary.grossBookingAmount.toFixed(2)}`
        )
        .text(
          `Paid Revenue: ₹${summary.paidRevenue.toFixed(2)}`
        )
        .text(
          `Refund Pending: ₹${summary.refundPending.toFixed(2)}`
        )
        .text(
          `Refund Completed: ₹${summary.refundCompleted.toFixed(2)}`
        )
        .text(
          `Net Revenue: ₹${summary.netRevenue.toFixed(2)}`
        );


      doc.moveDown();


      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('BOOKINGS');


      doc.moveDown(0.5);


      bookings.forEach((b, index) => {

        if (
          doc.y >
          740
        ) {
          doc.addPage();
        }


        const room =
          b.property?.rooms?.find(
            (room) =>
              String(room._id) ===
              String(b.roomId)
          );


        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(
            `${index + 1}. ${
              b.bookingId || b._id
            }`
          );


        doc
          .font('Helvetica')
          .text(
            `Guest: ${
              b.user?.name || '-'
            } | Hotel: ${
              b.property?.name || '-'
            }`
          );


        doc.text(
          `Room: ${
            room?.roomNumber ||
            b.roomId ||
            '-'
          } | ${
            new Date(
              b.checkIn
            ).toLocaleDateString('en-IN')
          } → ${
            new Date(
              b.checkOut
            ).toLocaleDateString('en-IN')
          }`
        );


        doc.text(
          `Status: ${
            b.status
          } | Payment: ${
            b.paymentStatus
          } | Method: ${
            b.paymentMethod
          }`
        );


        doc.text(
          `Refund: ${
            b.refundStatus
          } | Amount: ₹${
            Number(
              b.refundAmount || 0
            ).toFixed(2)
          } | Total: ₹${
            Number(
              b.totalAmount || 0
            ).toFixed(2)
          }`
        );


        doc.moveDown(0.7);

      });


      doc.end();

    } catch (e) {

      console.error(
        'PDF report error:',
        e
      );

      res.status(500).json({
        message:
          'Unable to generate PDF report.',
      });

    }

  }
);


/*
========================================
EXCEL REPORT
========================================
*/

r.get(
  '/reports/bookings.xlsx',
  async (req, res) => {

    try {

      const bookings =
        await getReportBookings(
          req.query
        );


      const summary =
        getReportSummary(
          bookings
        );


      const workbook =
        new ExcelJS.Workbook();


      const summarySheet =
        workbook.addWorksheet(
          'Summary'
        );


      summarySheet.columns = [
        {
          header: 'Metric',
          key: 'metric',
          width: 25,
        },
        {
          header: 'Value',
          key: 'value',
          width: 20,
        },
      ];


      summarySheet.addRows([

        {
          metric: 'Total Bookings',
          value:
            summary.totalBookings,
        },

        {
          metric: 'Confirmed',
          value:
            summary.confirmed,
        },

        {
          metric: 'Cancelled',
          value:
            summary.cancelled,
        },

        {
          metric: 'Gross Booking Amount',
          value:
            summary.grossBookingAmount,
        },

        {
          metric: 'Paid Revenue',
          value:
            summary.paidRevenue,
        },

        {
          metric: 'Refund Pending',
          value:
            summary.refundPending,
        },

        {
          metric: 'Refund Completed',
          value:
            summary.refundCompleted,
        },

        {
          metric: 'Net Revenue',
          value:
            summary.netRevenue,
        },

      ]);


      const sheet =
        workbook.addWorksheet(
          'Bookings'
        );


      sheet.columns = [

        {
          header: 'Booking ID',
          key: 'bookingId',
          width: 22,
        },

        {
          header: 'Guest',
          key: 'guest',
          width: 24,
        },

        {
          header: 'Email',
          key: 'email',
          width: 30,
        },

        {
          header: 'Hotel',
          key: 'hotel',
          width: 30,
        },

        {
          header: 'Location',
          key: 'location',
          width: 25,
        },

        {
          header: 'Room',
          key: 'room',
          width: 15,
        },

        {
          header: 'Check-in',
          key: 'checkIn',
          width: 15,
        },

        {
          header: 'Check-out',
          key: 'checkOut',
          width: 15,
        },

        {
          header: 'Guests',
          key: 'guests',
          width: 10,
        },

        {
          header: 'Booking Status',
          key: 'status',
          width: 18,
        },

        {
          header: 'Payment Status',
          key: 'paymentStatus',
          width: 18,
        },

        {
          header: 'Payment Method',
          key: 'paymentMethod',
          width: 18,
        },

        {
          header: 'Refund Status',
          key: 'refundStatus',
          width: 18,
        },

        {
          header: 'Refund %',
          key: 'refundPercentage',
          width: 12,
        },

        {
          header: 'Refund Amount',
          key: 'refundAmount',
          width: 18,
        },

        {
          header: 'Total Amount',
          key: 'totalAmount',
          width: 18,
        },

      ];


      bookings.forEach((b) => {

        const room =
          b.property?.rooms?.find(
            (room) =>
              String(room._id) ===
              String(b.roomId)
          );


        sheet.addRow({

          bookingId:
            b.bookingId ||
            String(b._id),

          guest:
            b.user?.name || '',

          email:
            b.user?.email || '',

          hotel:
            b.property?.name || '',

          location:
            b.property?.location || '',

          room:
            room?.roomNumber ||
            String(b.roomId || ''),

          checkIn:
            new Date(
              b.checkIn
            ).toLocaleDateString('en-IN'),

          checkOut:
            new Date(
              b.checkOut
            ).toLocaleDateString('en-IN'),

          guests:
            b.guests || 1,

          status:
            b.status,

          paymentStatus:
            b.paymentStatus,

          paymentMethod:
            b.paymentMethod,

          refundStatus:
            b.refundStatus,

          refundPercentage:
            b.refundPercentage || 0,

          refundAmount:
            b.refundAmount || 0,

          totalAmount:
            b.totalAmount || 0,

        });

      });


      /*
      HEADER STYLE
      */

      summarySheet.getRow(1).font = {
        bold: true,
      };


      sheet.getRow(1).font = {
        bold: true,
      };


      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );


      res.setHeader(
        'Content-Disposition',
        'attachment; filename="stayeasy-booking-report.xlsx"'
      );


      await workbook.xlsx.write(
        res
      );

      res.end();

    } catch (e) {

      console.error(
        'Excel report error:',
        e
      );

      res.status(500).json({
        message:
          'Unable to generate Excel report.',
      });

    }

  }
);


export default r;
