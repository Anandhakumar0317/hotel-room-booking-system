import {useEffect,useState} from 'react';
import {useSelector} from 'react-redux';
import {useSearchParams} from 'react-router-dom';
import {api,downloadFile} from '../api';
import {RootState} from '../store/store';
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
  TextField
} from '@mui/material';

export default function MyBookingsPage(){

  const s=useSelector((x:RootState)=>x.booking);

  const [items,setItems]=useState<any[]>([]);
  const [err,setErr]=useState('');
  const [pay,setPay]=useState<any|null>(null);

  const [params]=useSearchParams();

  useEffect(()=>{
    if(!s.token)return;

    api('/bookings/mine',{},s.token)
      .then(setItems)
      .catch(e=>setErr(e.message));

  },[s.token]);

  useEffect(()=>{

    const id=params.get('pay');

    if(id){

      const b=items.find(x=>x._id===id);

      if(b && b.status!=='cancelled' && b.paymentStatus!=='paid'){
        setPay(b);
      }

    }

  },[items,params]);

  const cancel=async(id:string)=>{

    try{

      await api(
        `/bookings/${id}/cancel`,
        {method:'PATCH'},
        s.token
      );

      const updated=await api(
        '/bookings/mine',
        {},
        s.token
      );

      setItems(updated);

      setPay(null);

    }catch(e:any){

      setErr(e.message);

    }

  };

  const payment=async()=>{

    if(!pay)return;

    if(pay.status==='cancelled'){
      setErr('Cancelled booking cannot be paid.');
      setPay(null);
      return;
    }

    if(pay.paymentStatus==='paid'){
      setPay(null);
      return;
    }

    try{

      await api(
        `/bookings/${pay._id}/pay`,
        {
          method:'POST',
          body:JSON.stringify({
            method:'online',
	     transactionId:`DEMO-${Date.now()}`
          })
        },
        s.token
      );

      setPay(null);

      const updated=await api(
        '/bookings/mine',
        {},
        s.token
      );

      setItems(updated);

    }catch(e:any){

      setErr(e.message);
      setPay(null);

    }

  };

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
          sx={{mb:2}}
          onClose={()=>setErr('')}
        >
          {err}
        </Alert>
      )}

      <Grid container spacing={2}>

        {items.map(b=>(

          <Grid item xs={12} md={6} key={b._id}>

            <Card sx={{borderRadius:3}}>

              <CardContent>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >

                  <Typography variant="h6">
                    {b.property?.name || 'Hotel'}
                  </Typography>

                  <Chip
                    label={
                      b.status==='cancelled'
                        ? 'CANCELLED'
                        : b.paymentStatus==='paid'
                          ? 'PAID'
                          : b.status
                    }
                    color={
                      b.status==='cancelled'
                        ? 'error'
                        : b.paymentStatus==='paid'
                          ? 'success'
                          : 'default'
                    }
                  />

                </Stack>

                <Typography>
                  {b.property?.location || ''} • Room {b.roomId}
                </Typography>

                <Typography>
                  {new Date(b.checkIn).toLocaleDateString()}
                  {' → '}
                  {new Date(b.checkOut).toLocaleDateString()}
                </Typography>

                <Typography sx={{mt:1}}>
                  Guests: {b.guests} • <b>₹{b.totalAmount}</b>
                </Typography>
		{/* REFUND DETAILS */}

{b.status==='cancelled' && b.paymentStatus==='paid' && (

  <Stack
    sx={{mt:2}}
    spacing={0.5}
  >

    <Typography>
      Refund: <b>{b.refundPercentage || 0}%</b>
    </Typography>

    <Typography>
      Refund Amount: <b>₹{b.refundAmount || 0}</b>
    </Typography>

    <Typography>
      Refund Status:{' '}
      <b>
        {b.refundStatus==='pending'
          ? 'Pending'
          : b.refundStatus==='processed'
            ? 'Completed'
            : 'Not Applicable'}
      </b>
    </Typography>

  </Stack>

)}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{mt:2}}
                  flexWrap="wrap"
                >

                  {/* PAYMENT BUTTON */}

                  {b.status==='cancelled' ? (

                    <Button
                      variant="outlined"
                      color="error"
                      disabled
                    >
                      Booking Cancelled
                    </Button>

                  ) : b.paymentStatus==='paid' ? (

                    <Button
                      variant="contained"
                      color="success"
                      disabled
                    >
                      Paid
                    </Button>

                  ) : (

                    <Button
                      variant="contained"
                      onClick={()=>setPay(b)}
                    >
                      Pay Now
                    </Button>

                  )}

                  {/* INVOICE */}

                  <Button
                    onClick={()=>
                      downloadFile(
                        `/bookings/${b._id}/invoice`,
                        s.token!,
                        `stayeasy-${b._id}.pdf`
                      )
                    }
                  >
                    Invoice PDF
                  </Button>

                  {/* CANCEL */}

                  <Button
                    color="error"
                    disabled={
                      b.status==='cancelled'
                    }
                    onClick={()=>cancel(b._id)}
                  >
                    Cancel
                  </Button>

                </Stack>

              </CardContent>

            </Card>

          </Grid>

        ))}

      </Grid>

      {/* PAYMENT DIALOG */}

      <Dialog
        open={!!pay}
        onClose={()=>setPay(null)}
      >

        <DialogTitle>
          Demo Payment
        </DialogTitle>

        <DialogContent>

          <Typography sx={{mb:2}}>
            This demo simulates a card payment.
            No real money is charged.
          </Typography>

          <TextField
            fullWidth
            label="Card number"
            defaultValue="4242 4242 4242 4242"
          />

          <TextField
            fullWidth
            label="Expiry"
            defaultValue="12/30"
            sx={{mt:2}}
          />

        </DialogContent>

        <DialogActions>

          <Button
            onClick={()=>setPay(null)}
          >
            Close
          </Button>

          <Button
            variant="contained"
            onClick={payment}
            disabled={
              !pay ||
              pay.status==='cancelled' ||
              pay.paymentStatus==='paid'
            }
          >
            Pay ₹{pay?.totalAmount}
          </Button>

        </DialogActions>

      </Dialog>

    </>
  );
}
