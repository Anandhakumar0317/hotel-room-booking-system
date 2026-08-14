import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CardMedia,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  Box,
} from '@mui/material';

import { api } from '../api';
import { RootState } from '../store/store';


export default function BookingPage() {
  const s = useSelector(
    (x: RootState) => x.booking
  );

  const nav = useNavigate();

  const [guests, setGuests] = useState(1);

  const [paymentMethod, setPaymentMethod] =
    useState<'online' | 'offline'>('online');

  const [policyAccepted, setPolicyAccepted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [err, setErr] =
    useState('');


  /*
  ========================================
  CHECK BOOKING DATA
  ========================================
  */

  if (
    !s.user ||
    !s.property ||
    !s.room
  ) {
    return (
      <Alert severity="info">
        Select a room from search first.
      </Alert>
    );
  }


  /*
  ========================================
  CALCULATE NIGHTS & TOTAL
  ========================================
  */

  const nights = Math.max(
    1,
    Math.ceil(
      (
        new Date(s.checkOut!).getTime() -
        new Date(s.checkIn!).getTime()
      ) / 86400000
    )
  );

  const total =
    nights * s.room.price;


  /*
  ========================================
  CREATE BOOKING
  ========================================
  */

  const submit = async () => {
    setErr('');

    /*
      Validate guests
    */

    if (guests < 1) {
      setErr(
        'Please enter at least 1 guest.'
      );
      return;
    }

    if (
      guests > s.room.capacity
    ) {
      setErr(
        `Maximum ${s.room.capacity} guests allowed for this room.`
      );
      return;
    }


    /*
      Validate cancellation policy
    */

    if (!policyAccepted) {
      setErr(
        'Please accept the Terms and Cancellation Policy before booking.'
      );
      return;
    }


    setLoading(true);


    try {
      const b = await api(
        '/bookings',
        {
          method: 'POST',

          body: JSON.stringify({
            property: s.property._id,

            roomId: s.room._id,

            checkIn: s.checkIn,

            checkOut: s.checkOut,

            guests,

            paymentMethod,

            policyAccepted,
          }),
        },
        s.token
      );


      /*
      ====================================
      AFTER BOOKING
      ====================================
      */

      if (
        paymentMethod === 'online'
      ) {
        /*
          Online payment

          Send user to My Bookings
          with payment parameter.
        */

        nav(
          `/my-bookings?pay=${b._id}`
        );
      } else {
        /*
          Offline payment

          Booking is already confirmed.
          Payment remains pending.
        */

        nav(
          `/my-bookings?booking=${b._id}`
        );
      }

    } catch (e: any) {
      setErr(
        e.message ||
        'Unable to create booking.'
      );
    } finally {
      setLoading(false);
    }
  };


  /*
  ========================================
  UI
  ========================================
  */

  return (
    <Paper
      sx={{
        p: 3,
        maxWidth: 700,
        mx: 'auto',
        borderRadius: 3,
      }}
    >

      {/* HOTEL / ROOM IMAGE */}

      <CardMedia
        component="img"
        height="240"
        image={
          s.room.images?.[0] ||
          s.property.images?.[0]
        }
        sx={{
          borderRadius: 2,
          objectFit: 'cover',
        }}
      />


      {/* HOTEL NAME */}

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ mt: 2 }}
      >
        {s.property.name}
      </Typography>


      {/* LOCATION / ROOM */}

      <Typography color="text.secondary">
        {s.property.location}
        {' • '}
        {s.room.type}
        {' • '}
        Room {s.room.roomNumber}
      </Typography>


      <Divider sx={{ my: 2 }} />


      <Stack spacing={2}>

        {/* STAY */}

        <Typography>
          Stay:{' '}
          <b>{s.checkIn}</b>
          {' → '}
          <b>{s.checkOut}</b>

          {' '}
          (
          {nights}
          {' '}
          night
          {nights > 1 ? 's' : ''}
          )
        </Typography>


        {/* GUESTS */}

        <TextField
          type="number"
          label="Guests"
          value={guests}
          onChange={(e) =>
            setGuests(
              Math.max(
                1,
                Number(
                  e.target.value
                )
              )
            )
          }
          inputProps={{
            min: 1,
            max: s.room.capacity,
          }}
          helperText={`Maximum ${s.room.capacity} guests`}
        />


        {/* PRICE */}

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Room price
          </Typography>

          <Typography>
            ₹{s.room.price} × {nights}{' '}
            night
            {nights > 1 ? 's' : ''}
          </Typography>

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ mt: 1 }}
          >
            Total: ₹{total}
          </Typography>
        </Box>


        <Divider />


        {/* PAYMENT METHOD */}

        <FormControl>

          <FormLabel
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            Select Payment Method
          </FormLabel>

          <RadioGroup
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as
                  | 'online'
                  | 'offline'
              )
            }
          >

            <FormControlLabel
              value="online"
              control={<Radio />}
              label={
                <Box>
                  <Typography fontWeight={600}>
                    Online Payment
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Pay securely online after
                    booking.
                  </Typography>
                </Box>
              }
            />


            <FormControlLabel
              value="offline"
              control={<Radio />}
              label={
                <Box>
                  <Typography fontWeight={600}>
                    Offline Payment
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Pay at the hotel.
                    Booking will remain payment
                    pending.
                  </Typography>
                </Box>
              }
            />

          </RadioGroup>

        </FormControl>


        <Divider />


        {/* CANCELLATION POLICY */}

        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >

          <Typography
            fontWeight={700}
            sx={{ mb: 1 }}
          >
            Cancellation Policy
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            • Within 2 hours: 100% refund
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            • 2–4 hours: 50% refund
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            • 4–6 hours: 25% refund
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            • After 6 hours: No refund
          </Typography>

        </Box>


        {/* POLICY ACCEPTANCE */}

        <FormControlLabel
          control={
            <Checkbox
              checked={policyAccepted}
              onChange={(e) =>
                setPolicyAccepted(
                  e.target.checked
                )
              }
            />
          }
          label={
            <Typography variant="body2">
              I agree to the Terms and
              Cancellation Policy.
            </Typography>
          }
        />


        {/* ERROR */}

        {err && (
          <Alert severity="error">
            {err}
          </Alert>
        )}


        {/* BOOK BUTTON */}

        <Button
          variant="contained"
          size="large"
          onClick={submit}
          disabled={
            loading ||
            !policyAccepted
          }
        >

          {loading
            ? 'Creating booking...'
            : paymentMethod === 'online'
              ? 'Confirm & Continue to Payment'
              : 'Confirm Booking – Pay at Hotel'}

        </Button>

      </Stack>

    </Paper>
  );
}