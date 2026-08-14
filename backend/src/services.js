import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';


/*
========================================
BOOKING CONFIRMATION EMAIL
========================================
*/

export async function sendBookingEmail(booking) {

  const to = booking.user?.email;

  if (!to) return;


  const text = `
StayEasy Booking Confirmation

Booking ID: ${booking.bookingId || booking._id}

Hotel: ${booking.property?.name || '-'}

Location: ${booking.property?.location || '-'}

Room: ${booking.roomId || '-'}

Check-in:
${new Date(booking.checkIn).toDateString()}

Check-out:
${new Date(booking.checkOut).toDateString()}

Guests: ${booking.guests}

Payment Method:
${booking.paymentMethod || '-'}

Payment Status:
${booking.paymentStatus || '-'}

Total Amount:
₹${booking.totalAmount}

Thank you for booking with StayEasy.
`;


  /*
  ========================================
  DEMO EMAIL
  ========================================
  */

  if (!process.env.SMTP_HOST) {

    console.log(
      '[EMAIL DEMO]',
      to,
      text
    );

    return;
  }


  /*
  ========================================
  SMTP
  ========================================
  */

  const transporter =
    nodemailer.createTransport({

      host:
        process.env.SMTP_HOST,

      port:
        Number(
          process.env.SMTP_PORT || 587
        ),

      secure:
        Number(
          process.env.SMTP_PORT
        ) === 465,

      auth: {

        user:
          process.env.SMTP_USER,

        pass:
          process.env.SMTP_PASS,

      },

    });


  await transporter.sendMail({

    from:
      process.env.MAIL_FROM ||
      'StayEasy <no-reply@example.com>',

    to,

    subject:
      `StayEasy Booking Confirmation - ${
        booking.bookingId ||
        booking._id
      }`,

    text,

  });

}


/*
========================================
ATTRACTIVE INVOICE PDF
========================================
*/

export function invoicePdf(
  booking,
  res
) {

  const doc =
    new PDFDocument({

      margin: 50,

      size: 'A4',

    });


  /*
  ========================================
  PDF RESPONSE
  ========================================
  */

  res.setHeader(
    'Content-Type',
    'application/pdf'
  );


  res.setHeader(
    'Content-Disposition',
    `attachment; filename="stayeasy-${
      booking.bookingId ||
      booking._id
    }.pdf"`
  );


  doc.pipe(res);


  /*
  ========================================
  HEADER
  ========================================
  */

  doc
    .fontSize(28)
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
      'Hotel Booking & Reservation',
      {
        align: 'center',
      }
    );


  doc.moveDown(1);


  /*
  ========================================
  INVOICE TITLE
  ========================================
  */

  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(
      'BOOKING INVOICE',
      {
        align: 'center',
      }
    );


  doc.moveDown(1);


  /*
  ========================================
  BOOKING INFORMATION
  ========================================
  */

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(
      `Booking ID: ${
        booking.bookingId ||
        booking._id
      }`
    );


  doc
    .fontSize(10)
    .font('Helvetica')
    .text(
      `Invoice Date: ${
        new Date().toLocaleDateString(
          'en-IN'
        )
      }`
    );


  doc.moveDown(1);


  /*
  ========================================
  HOTEL DETAILS
  ========================================
  */

  doc
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(
      'HOTEL DETAILS'
    );


  doc.moveDown(0.4);


  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      `Hotel: ${
        booking.property?.name ||
        '-'
      }`
    );


  doc.text(
    `Location: ${
      booking.property?.location ||
      '-'
    }`
  );


  doc.moveDown(1);


  /*
  ========================================
  GUEST DETAILS
  ========================================
  */

  doc
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(
      'GUEST DETAILS'
    );


  doc.moveDown(0.4);


  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      `Guest Name: ${
        booking.user?.name ||
        '-'
      }`
    );


  doc.text(
    `Email: ${
      booking.user?.email ||
      '-'
    }`
  );


  doc.moveDown(1);


  /*
  ========================================
  STAY DETAILS
  ========================================
  */

  doc
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(
      'STAY DETAILS'
    );


  doc.moveDown(0.4);


  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      `Room ID: ${
        booking.roomId ||
        '-'
      }`
    );


  doc.text(
    `Check-in: ${
      new Date(
        booking.checkIn
      ).toLocaleDateString(
        'en-IN'
      )
    }`
  );


  doc.text(
    `Check-out: ${
      new Date(
        booking.checkOut
      ).toLocaleDateString(
        'en-IN'
      )
    }`
  );


  doc.text(
    `Guests: ${
      booking.guests ||
      1
    }`
  );


  /*
  ========================================
  PAYMENT DETAILS
  ========================================
  */

  doc.moveDown(1);


  doc
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(
      'PAYMENT DETAILS'
    );


  doc.moveDown(0.4);


  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      `Payment Method: ${
        booking.paymentMethod ||
        '-'
      }`
    );


  doc.text(
    `Payment Status: ${
      booking.paymentStatus ||
      '-'
    }`
  );


  if (booking.transactionId) {

    doc.text(
      `Transaction ID: ${
        booking.transactionId
      }`
    );

  }


  /*
  ========================================
  TOTAL AMOUNT
  ========================================
  */

  doc.moveDown(1);


  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(
      `TOTAL AMOUNT: ₹${
        booking.totalAmount
      }`
    );


  /*
  ========================================
  CANCELLATION / REFUND
  ========================================
  */

  if (
    booking.status ===
    'cancelled'
  ) {

    doc.moveDown(1);


    doc
      .fontSize(15)
      .font('Helvetica-Bold')
      .text(
        'CANCELLATION / REFUND'
      );


    doc.moveDown(0.4);


    doc
      .fontSize(11)
      .font('Helvetica')
      .text(
        'Booking Status: Cancelled'
      );


    doc.text(
      `Refund Percentage: ${
        booking.refundPercentage ||
        0
      }%`
    );


    doc.text(
      `Refund Amount: ₹${
        booking.refundAmount ||
        0
      }`
    );


    doc.text(
      `Refund Status: ${
        booking.refundStatus ||
        'not_applicable'
      }`
    );

  }


  /*
  ========================================
  FOOTER
  ========================================
  */

  doc.moveDown(2);


  doc
    .fontSize(10)
    .font('Helvetica')
    .text(
      'Thank you for choosing StayEasy.',
      {
        align: 'center',
      }
    );


  doc.text(
    'We hope you have a pleasant stay!',
    {
      align: 'center',
    }
  );


  doc.moveDown(1);


  doc
    .fontSize(8)
    .text(
      'This is a system-generated invoice.',
      {
        align: 'center',
      }
    );


  /*
  ========================================
  END PDF
  ========================================
  */

  doc.end();

}