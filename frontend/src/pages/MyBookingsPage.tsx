import {
  useEffect,
  useState,
} from 'react';

import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import {
  api,
  downloadFile,
} from '../api';

import { RootState } from '../store/store';

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Box,
} from '@mui/material';


export default function MyBookingsPage() {
  const s = useSelector(
    (x: RootState) => x.booking
  );

  const [items, setItems] =
    useState<any[]>([]);

  const [err, setErr] =
    useState('');

  const [pay, setPay] =
    useState<any | null>(null);

  const [cancelBooking, setCancelBooking] =
    useState<any | null>(null);

  const [cancelling, setCancelling] =
    useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [params] =
    useSearchParams();


  /*
  ========================================
  LOAD BOOKINGS
  ========================================
  */

  const loadBookings = async () => {
    try {
      setErr('');

      const data = await api(
        '/bookings/mine',
        {},
        s.token
      );

      setItems(data);
    } catch (e: any) {
      setErr(
        e.message ||
        'Unable to load bookings.'
      );
    }
  };


  useEffect(() => {
    if (s.token) {
      loadBookings();
    }
  }, [s.token]);


  /*
  ========================================
  OPEN PAYMENT FROM URL
  ========================================
  */

  useEffect(() => {
    const id = params.get('pay');

    if (!id || items.length === 0) {
      return;
    }

    const booking = items.find(
      (x) => x._id === id
    );

    if (
      booking &&
      booking.paymentMethod === 'online' &&
      booking.paymentStatus !== 'paid' &&
      booking.status !== 'cancelled'
    ) {
      setPay(booking);
    }
  }, [items, params]);


  /*
  ========================================
  ROOM DETAILS
  ========================================
  */

  const getRoom = (booking: any) => {
    return booking.property?.rooms?.find(
      (room: any) =>
        String(room._id) ===
        String(booking.roomId)
    );
  };


  /*
  ========================================
  CANCEL BOOKING
  ========================================
  */

  const cancel = async () => {
    if (!cancelBooking) {
      return;
    }

    try {
      setCancelling(true);
      setErr('');

      const result = await api(
        `/bookings/${cancelBooking._id}/cancel`,
        {
          method: 'PATCH',
        },
        s.token
      );

      /*
        Show cancellation result
        temporarily in console.
      */

      console.log(
        'Cancellation result:',
        result
      );

      setCancelBooking(null);

      await loadBookings();

    } catch (e: any) {
      setErr(
        e.message ||
        'Unable to cancel booking.'
      );
    } finally {
      setCancelling(false);
    }
  };


  /*
  ========================================
  ONLINE PAYMENT
  ========================================
  */

  const payment = async () => {
    if (!pay) {
      return;
    }

    try {
      setPaymentLoading(true);
      setErr('');

      await api(
        `/bookings/${pay._id}/pay`,
        {
          method: 'POST',

          body: JSON.stringify({
            method: 'online',
            transactionId:
              `DEMO-${Date.now()}`,
          }),
        },
        s.token
      );

      setPay(null);

      await loadBookings();

    } catch (e: any) {
      setErr(
        e.message ||
        'Payment failed.'
      );
    } finally {
      setPaymentLoading(false);
    }
  };


  /*
  ========================================
  STATUS COLOR
  ========================================
  */

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'success';

      case 'pending':
        return 'warning';

      case 'cancelled':
        return 'error';

      case 'checked_in':
        return 'info';

      case 'checked_out':
        return 'secondary';

      default:
        return 'default';
    }
  };


  /*
  ========================================
  PAYMENT STATUS COLOR
  ========================================
  */

  const getPaymentColor = (
    status: string
  ) => {
    switch (status) {
      case 'paid':
        return 'success';

      case 'refunded':
      case 'partially_refunded':
        return 'info';

      case 'pending':
        return 'warning';

      case 'failed':
        return 'error';

      default:
        return 'default';
    }
  };


  /*
  ========================================
  PAGE
  ========================================
  */

  return (
    <>
      <Typography
        variant="h4"
        fontWeight={800}
        gutterBottom
      >
        My Bookings
      </Typography>


      {err && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {err}
        </Alert>
      )}


      {items.length === 0 && !err && (
        <Alert severity="info">
          You don't have any bookings yet.
        </Alert>
      )}


      <Grid
        container
        spacing={2}
      >

        {items.map((b) => {
          const room = getRoom(b);

          const bookingId =
            b.bookingId || b._id;

          const canPay =
            b.paymentMethod === 'online' &&
            b.paymentStatus !== 'paid' &&
            b.status !== 'cancelled';

          const canCancel =
            b.status !== 'cancelled' &&
            b.status !== 'completed' &&
            b.status !== 'checked_out';


          return (
            <Grid
              item
              xs={12}
              md={6}
              key={b._id}
            >

              <Card
                sx={{
                  borderRadius: 3,
                  height: '100%',
                }}
              >

                <CardContent>

                  {/* HOTEL + STATUS */}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >

                    <Box>

                      <Typography
                        variant="h6"
                        fontWeight={700}
                      >
                        {b.property?.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Booking ID
                      </Typography>

                      <Typography
                        fontWeight={700}
                        sx={{
                          letterSpacing: 0.5,
                        }}
                      >
                        {bookingId}
                      </Typography>

                    </Box>


                    <Chip
                      label={
                        String(
                          b.status
                        ).replace(
                          /_/g,
                          ' '
                        )
                      }
                      color={
                        getStatusColor(
                          b.status
                        ) as any
                      }
                      size="small"
                    />

                  </Stack>


                  <Divider
                    sx={{ my: 1.5 }}
                  />


                  {/* HOTEL DETAILS */}

                  <Typography>
                    {b.property?.location}
                  </Typography>


                  <Typography>
                    Room{' '}
                    <b>
                      {room?.roomNumber ||
                        b.roomId}
                    </b>

                    {room?.type
                      ? ` • ${room.type}`
                      : ''}
                  </Typography>


                  {/* DATES */}

                  <Typography
                    sx={{ mt: 1 }}
                  >
                    {new Date(
                      b.checkIn
                    ).toLocaleDateString()}

                    {' → '}

                    {new Date(
                      b.checkOut
                    ).toLocaleDateString()}
                  </Typography>


                  {/* GUESTS */}

                  <Typography
                    sx={{ mt: 1 }}
                  >
                    Guests: {b.guests}
                  </Typography>


                  {/* AMOUNT */}

                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ mt: 1 }}
                  >
                    ₹
                    {Number(
                      b.totalAmount || 0
                    ).toFixed(2)}
                  </Typography>


                  <Divider
                    sx={{ my: 1.5 }}
                  />


                  {/* PAYMENT */}

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >

                    <Chip
                      size="small"
                      label={`Payment: ${
                        b.paymentMethod ===
                        'offline'
                          ? 'Offline'
                          : 'Online'
                      }`}
                    />

                    <Chip
                      size="small"
                      label={`Status: ${
                        String(
                          b.paymentStatus ||
                            'pending'
                        ).replace(
                          /_/g,
                          ' '
                        )
                      }`}
                      color={
                        getPaymentColor(
                          b.paymentStatus
                        ) as any
                      }
                    />

                  </Stack>


                  {/* REFUND INFORMATION */}

                  {b.status ===
                    'cancelled' &&
                    Number(
                      b.refundAmount || 0
                    ) > 0 && (
                      <Alert
                        severity="info"
                        sx={{ mt: 2 }}
                      >
                        <Typography
                          fontWeight={700}
                        >
                          Refund Information
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          Refund:{' '}
                          {
                            b.refundPercentage
                          }%
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          Refund Amount: ₹
                          {Number(
                            b.refundAmount
                          ).toFixed(2)}
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          Status:{' '}
                          {String(
                            b.refundStatus ||
                              'pending'
                          ).replace(
                            /_/g,
                            ' '
                          )}
                        </Typography>
                      </Alert>
                    )}


                  {b.status ===
                    'cancelled' &&
                    Number(
                      b.refundAmount || 0
                    ) === 0 && (
                      <Alert
                        severity="warning"
                        sx={{ mt: 2 }}
                      >
                        No refund is applicable
                        for this cancellation.
                      </Alert>
                    )}


                  {/* ACTION BUTTONS */}

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 2 }}
                    flexWrap="wrap"
                    useFlexGap
                  >

                    {/* ONLINE PAYMENT */}

                    {canPay && (
                      <Button
                        variant="contained"
                        onClick={() =>
                          setPay(b)
                        }
                      >
                        Pay Now
                      </Button>
                    )}


                    {/* OFFLINE PAYMENT MESSAGE */}

                    {b.paymentMethod ===
                      'offline' &&
                      b.paymentStatus ===
                        'pending' &&
                      b.status !==
                        'cancelled' && (
                        <Chip
                          label="Pay at Hotel"
                          color="warning"
                        />
                      )}


                    {/* INVOICE */}

                    <Button
                      variant="outlined"
                      onClick={() =>
                        downloadFile(
                          `/bookings/${b._id}/invoice`,
                          s.token!,
                          `stayeasy-${bookingId}.pdf`
                        )
                      }
                    >
                      Invoice PDF
                    </Button>


                    {/* CANCEL */}

                    {canCancel && (
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() =>
                          setCancelBooking(
                            b
                          )
                        }
                      >
                        Cancel
                      </Button>
                    )}

                  </Stack>

                </CardContent>

              </Card>

            </Grid>
          );
        })}

      </Grid>


      {/* ====================================
          ONLINE PAYMENT DIALOG
      ==================================== */}

      <Dialog
        open={!!pay}
        onClose={() =>
          paymentLoading
            ? null
            : setPay(null)
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Online Payment
        </DialogTitle>


        <DialogContent>

          <Alert
            severity="info"
            sx={{ mb: 2 }}
          >
            This is a demo payment.
            No real money will be charged.
          </Alert>


          <Typography
            sx={{ mb: 2 }}
          >
            Booking ID:{' '}
            <b>
              {pay?.bookingId ||
                pay?._id}
            </b>
          </Typography>


          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ mb: 2 }}
          >
            Amount: ₹
            {Number(
              pay?.totalAmount || 0
            ).toFixed(2)}
          </Typography>


          <TextField
            fullWidth
            label="Card Number"
            defaultValue="4242 4242 4242 4242"
          />


          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 2 }}
          >

            <TextField
              fullWidth
              label="Expiry"
              defaultValue="12/30"
            />

            <TextField
              fullWidth
              label="CVV"
              defaultValue="123"
            />

          </Stack>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setPay(null)
            }
            disabled={paymentLoading}
          >
            Close
          </Button>


          <Button
            variant="contained"
            onClick={payment}
            disabled={paymentLoading}
          >
            {paymentLoading
              ? 'Processing...'
              : `Pay ₹${Number(
                  pay?.totalAmount || 0
                ).toFixed(2)}`}
          </Button>

        </DialogActions>

      </Dialog>


      {/* ====================================
          CANCEL CONFIRMATION
      ==================================== */}

      <Dialog
        open={!!cancelBooking}
        onClose={() =>
          cancelling
            ? null
            : setCancelBooking(null)
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Cancel Booking?
        </DialogTitle>


        <DialogContent>

          <Typography
            sx={{ mb: 2 }}
          >
            Are you sure you want to cancel
            this booking?
          </Typography>


          <Typography
            variant="body2"
            sx={{ mb: 2 }}
          >
            Booking ID:{' '}
            <b>
              {cancelBooking?.bookingId ||
                cancelBooking?._id}
            </b>
          </Typography>


          <Alert severity="warning">

            <Typography
              variant="body2"
            >
              Your refund will be calculated
              according to the cancellation
              policy.

              <br />

              Within 2 hours: 100% refund

              <br />

              2–4 hours: 50% refund

              <br />

              4–6 hours: 25% refund

              <br />

              After 6 hours: No refund

            </Typography>

          </Alert>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setCancelBooking(null)
            }
            disabled={cancelling}
          >
            Keep Booking
          </Button>


          <Button
            color="error"
            variant="contained"
            onClick={cancel}
            disabled={cancelling}
          >
            {cancelling
              ? 'Cancelling...'
              : 'Yes, Cancel Booking'}
          </Button>

        </DialogActions>

      </Dialog>

    </>
  );
}