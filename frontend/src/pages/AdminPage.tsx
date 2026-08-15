import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { api, downloadFile } from '../api';

import {
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  TextField,
  Box,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
} from '@mui/material';


export default function AdminPage() {

  const s = useSelector(
    (x: RootState) => x.booking
  );


  /*
  ========================================
  STATE
  ========================================
  */

  const [stats, setStats] =
    useState<any>({});

  const [bookings, setBookings] =
    useState<any[]>([]);

  const [total, setTotal] =
    useState(0);

  const [page, setPage] =
    useState(0);

  const [search, setSearch] =
    useState('');

  const [props, setProps] =
    useState<any[]>([]);

  const [open, setOpen] =
    useState(false);

  const [edit, setEdit] =
    useState<any | null>(null);

  const [msg, setMsg] =
    useState('');

  const [refundBooking, setRefundBooking] =
    useState<any | null>(null);

  const [reportSearched, setReportSearched] =
    useState(false);

  const [reportCount, setReportCount] =
    useState(0);

  const [reportLoading, setReportLoading] =
    useState(false);

  const [reportFilter, setReportFilter] =
    useState({
      from: '',
      to: '',
      status: 'all',
      paymentStatus: 'all',
      paymentMethod: 'all',
      refundStatus: 'all',
      hotel: 'all',
      location: 'all',
      search: '',
    });


  const searchReport = async () => {

    setReportLoading(true);
    setReportSearched(false);
    setReportCount(0);

    try {

      const q =
        new URLSearchParams(
          reportFilter
        ).toString();

      const result = await api(
        `/admin/reports/bookings?${q}`,
        {},
        s.token
      );

      const count =
        result.bookings?.length || 0;

      setReportCount(count);
      setReportSearched(true);

      if (count === 0) {
        setMsg('No bookings found for the selected report filters.');
      } else {
        setMsg('');
      }

    } catch (e: any) {

      setMsg(
        e.message ||
        'Unable to search report.'
      );

    } finally {

      setReportLoading(false);

    }

  };


  /*
  ========================================
  EMPTY PROPERTY
  ========================================
  */

  const blank = {
    name: '',
    location: '',
    description: '',
    images: '',
    amenities: '',
    rooms: [],
  };


  const [form, setForm] =
    useState<any>(blank);


  /*
  ========================================
  LOAD ADMIN DATA
  ========================================
  */

  const load = async () => {

    const st = await api(
      '/admin/stats',
      {},
      s.token
    );

    setStats(st);


    const b = await api(
      `/bookings?page=${page + 1}&limit=8&search=${encodeURIComponent(search)}`,
      {},
      s.token
    );

    setBookings(
      b.items || []
    );

    setTotal(
      b.total || 0
    );


    const properties = await api(
      '/properties',
      {},
      s.token
    );

    setProps(
      properties || []
    );
  };


  useEffect(() => {

    load().catch(
      (e) =>
        setMsg(
          e.message ||
          'Unable to load admin data.'
        )
    );

  }, [page, search]);


  /*
  ========================================
  ROOM DETAILS
  ========================================
  */

  const getRoom = (
    booking: any
  ) => {

    return booking.property?.rooms?.find(
      (room: any) =>
        String(room._id) ===
        String(booking.roomId)
    );
  };


  /*
  ========================================
  STATUS COLOR
  ========================================
  */

  const statusColor = (
    status: string
  ) => {

    switch (status) {

      case 'confirmed':
        return 'success';

      case 'cancelled':
        return 'error';

      case 'pending':
        return 'warning';

      default:
        return 'default';
    }
  };


  const paymentColor = (
    status: string
  ) => {

    switch (status) {

      case 'paid':
        return 'success';

      case 'refunded':
        return 'info';

      case 'pending':
        return 'warning';

      default:
        return 'default';
    }
  };


  /*
  ========================================
  SAVE PROPERTY
  ========================================
  */

  const save = async () => {

    try {

      const body = {
        ...form,

        images:
          typeof form.images === 'string'
            ? form.images
                .split(',')
                .map(
                  (x: string) =>
                    x.trim()
                )
                .filter(Boolean)
            : form.images,

        amenities:
          typeof form.amenities === 'string'
            ? form.amenities
                .split(',')
                .map(
                  (x: string) =>
                    x.trim()
                )
                .filter(Boolean)
            : form.amenities,
      };


      if (edit) {

        await api(
          `/properties/${edit._id}`,
          {
            method: 'PUT',
            body: JSON.stringify(body),
          },
          s.token
        );

      } else {

        await api(
          '/properties',
          {
            method: 'POST',
            body: JSON.stringify(body),
          },
          s.token
        );

      }


      setOpen(false);
      setEdit(null);
      setForm(blank);

      await load();

    } catch (e: any) {

      setMsg(
        e.message ||
        'Unable to save property.'
      );
    }
  };


  /*
  ========================================
  DELETE PROPERTY
  ========================================
  */

  const del = async (
    id: string
  ) => {

    if (
      !confirm(
        'Delete this property?'
      )
    ) {
      return;
    }


    try {

      await api(
        `/properties/${id}`,
        {
          method: 'DELETE',
        },
        s.token
      );

      await load();

    } catch (e: any) {

      setMsg(
        e.message ||
        'Unable to delete property.'
      );
    }
  };


  /*
  ========================================
  EDIT PROPERTY
  ========================================
  */

  const openEdit = (
    property: any
  ) => {

    setEdit(property);

    setForm({
      ...property,

      images:
        (
          property.images ||
          []
        ).join(','),

      amenities:
        (
          property.amenities ||
          []
        ).join(','),
    });

    setOpen(true);
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
        Admin Dashboard
      </Typography>


      {msg && (
        <Alert
          sx={{ mb: 2 }}
          severity="error"
          onClose={() =>
            setMsg('')
          }
        >
          {msg}
        </Alert>
      )}


      {/* ==================================
          STATISTICS
      ================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >

        {[
          [
            'Properties',
            stats.properties || 0,
          ],

          [
            'Users',
            stats.users || 0,
          ],

          [
            'Confirmed',
            stats.confirmed || 0,
          ],

          [
            'Cancelled',
            stats.cancelled || 0,
          ],

          [
            'Paid Revenue',
            `₹${stats.revenue || 0}`,
          ],

        ].map(
          ([a, b]) => (

            <Grid
              item
              xs={6}
              md={2.4}
              key={String(a)}
            >

              <Card
                sx={{
                  height: '100%',
                }}
              >

                <CardContent>

                  <Typography
                    color="text.secondary"
                  >
                    {a}
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                  >
                    {b}
                  </Typography>

                </CardContent>

              </Card>

            </Grid>

          )
        )}

      </Grid>


      {/* ==================================
          BOOKINGS
      ================================== */}

      <Paper
        sx={{
          p: 2,
          mb: 3,
        }}
      >

        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={2}
          justifyContent="space-between"
        >

          <TextField
            label="Search bookings"
            value={search}
            onChange={(e) => {

              setPage(0);

              setSearch(
                e.target.value
              );

            }}
          />


          <Button
            variant="contained"
            onClick={() => {

              setEdit(null);

              setForm(blank);

              setOpen(true);

            }}
          >
            + Add Property
          </Button>

        </Stack>


        {/* ==================================
            REPORT FILTERS
        ================================== */}

        <Paper
          variant="outlined"
          sx={{
            mt: 2,
            p: 2,
          }}
        >

          <Typography
            variant="h6"
            fontWeight={700}
            gutterBottom
          >
            Reports & Filters
          </Typography>

          <Grid
            container
            spacing={2}
          >

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={reportFilter.from}
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    from: e.target.value,
                  })
                }
              />
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={reportFilter.to}
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    to: e.target.value,
                  })
                }
              />
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Booking Status"
                value={reportFilter.status}
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    status: e.target.value,
                  })
                }
              >
                <option value="all">
                  All
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

              </TextField>
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Payment Status"
                value={
                  reportFilter.paymentStatus
                }
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    paymentStatus:
                      e.target.value,
                  })
                }
              >
                <option value="all">
                  All
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="refunded">
                  Refunded
                </option>

              </TextField>
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={
                  reportFilter.paymentMethod
                }
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    paymentMethod:
                      e.target.value,
                  })
                }
              >
                <option value="all">
                  All
                </option>

                <option value="online">
                  Online
                </option>

                <option value="offline">
                  Offline
                </option>

              </TextField>
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Refund Status"
                value={
                  reportFilter.refundStatus
                }
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    refundStatus:
                      e.target.value,
                  })
                }
              >
                <option value="all">
                  All
                </option>

                <option value="not_applicable">
                  Not Applicable
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="processed">
                  Completed
                </option>

              </TextField>
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Hotel"
                value={reportFilter.hotel}
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    hotel: e.target.value,
                  })
                }
              >
                <option value="all">
                  All Hotels
                </option>

                {props.map((p) => (
                  <option
                    key={p._id}
                    value={p._id}
                  >
                    {p.name}
                  </option>
                ))}

              </TextField>
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Location"
                value={reportFilter.location}
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    location: e.target.value,
                  })
                }
              >
                <option value="all">
                  All Locations
                </option>

                {[
                  ...new Set(
                    props
                      .map((p) => p.location)
                      .filter(Boolean)
                  ),
                ].map((location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                ))}

              </TextField>
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Report Search"
                placeholder="Booking ID / Guest / Hotel"
                value={reportFilter.search}
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    search: e.target.value,
                  })
                }
              />
            </Grid>


            <Grid item xs={12} sm={6} md={6}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  height: '100%',
                  alignItems: 'center',
                  flexWrap: 'nowrap',
                }}
              >

                <Button
                  variant="contained"
                  color="primary"
                  onClick={searchReport}
                  disabled={reportLoading}
                >
                  {reportLoading
                    ? 'Searching...'
                    : 'Search'}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  disabled={!reportSearched || reportCount === 0}
                  onClick={async () => {

                    try {

                      const q =
                        new URLSearchParams(
                          reportFilter
                        ).toString();

                      await downloadFile(
                        `/admin/reports/bookings.pdf?${q}`,
                        s.token!,
                        'stayeasy-booking-report.pdf'
                      );

                    } catch (e: any) {

                      setMsg(
                        e.message ||
                        'Unable to download PDF.'
                      );

                    }

                  }}
                >
                  PDF
                </Button>


                <Button
                  variant="contained"
                  color="success"
                  disabled={!reportSearched || reportCount === 0}
                  onClick={async () => {

                    try {

                      const q =
                        new URLSearchParams(
                          reportFilter
                        ).toString();

                      await downloadFile(
                        `/admin/reports/bookings.xlsx?${q}`,
                        s.token!,
                        'stayeasy-booking-report.xlsx'
                      );

                    } catch (e: any) {

                      setMsg(
                        e.message ||
                        'Unable to download Excel.'
                      );

                    }

                  }}
                >
                  Excel
                </Button>


                <Button
                  variant="outlined"
                  onClick={() => {
                    setReportFilter({
                      from: '',
                      to: '',
                      status: 'all',
                      paymentStatus: 'all',
                      paymentMethod: 'all',
                      refundStatus: 'all',
                      hotel: 'all',
                      location: 'all',
                      search: '',
                    });

                    setReportSearched(false);
                    setReportCount(0);
                    setMsg('');
                  }}
                >
                  Reset
                </Button>

              </Stack>
            </Grid>

          </Grid>

        </Paper>


        <Box
          sx={{
            width: '100%',
            overflowX: 'auto',
          }}
        >

          <Table
            sx={{
              mt: 2,
              minWidth: 1100,
            }}
          >

            <TableHead>

              <TableRow>

                <TableCell>
                  Booking ID
                </TableCell>

                <TableCell>
                  Guest
                </TableCell>

                <TableCell>
                  Hotel / Room
                </TableCell>

                <TableCell>
                  Dates
                </TableCell>

                <TableCell>
                  Booking Status
                </TableCell>

                <TableCell>
                  Payment
                </TableCell>

                <TableCell>
                  Refund
                </TableCell>

                <TableCell>
                  Total
                </TableCell>

              </TableRow>

            </TableHead>


            <TableBody>

              {bookings.map(
                (b) => {

                  const room =
                    getRoom(b);

                  return (

                    <TableRow
                      key={b._id}
                      hover
                    >

                      {/* BOOKING ID */}

                      <TableCell>

                        <Typography
                          fontWeight={700}
                          variant="body2"
                        >
                          {b.bookingId ||
                            b._id}
                        </Typography>

                      </TableCell>


                      {/* GUEST */}

                      <TableCell>

                        <Typography
                          fontWeight={600}
                        >
                          {b.user?.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {b.user?.email}
                        </Typography>

                      </TableCell>


                      {/* HOTEL / ROOM */}

                      <TableCell>

                        <Typography
                          fontWeight={600}
                        >
                          {b.property?.name}
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          {b.property?.location}
                        </Typography>

                        <Typography
                          variant="caption"
                        >
                          Room{' '}
                          {room?.roomNumber ||
                            b.roomId}

                          {room?.type
                            ? ` • ${room.type}`
                            : ''}
                        </Typography>

                      </TableCell>


                      {/* DATES */}

                      <TableCell>

                        <Typography
                          variant="body2"
                        >
                          {new Date(
                            b.checkIn
                          ).toLocaleDateString()}
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          →
                        </Typography>

                        <Typography
                          variant="body2"
                        >
                          {new Date(
                            b.checkOut
                          ).toLocaleDateString()}
                        </Typography>

                      </TableCell>


                      {/* BOOKING STATUS */}

                      <TableCell>

                        <Chip
                          size="small"
                          label={
                            String(
                              b.status
                            ).replace(
                              /_/g,
                              ' '
                            )
                          }
                          color={
                            statusColor(
                              b.status
                            ) as any
                          }
                        />

                      </TableCell>


                      {/* PAYMENT */}

                      <TableCell>

                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {b.paymentMethod ===
                          'offline'
                            ? 'Offline'
                            : 'Online'}
                        </Typography>

                        <Chip
                          size="small"
                          label={
                            String(
                              b.paymentStatus ||
                                'pending'
                            ).replace(
                              /_/g,
                              ' '
                            )
                          }
                          color={
                            paymentColor(
                              b.paymentStatus
                            ) as any
                          }
                        />

                      </TableCell>


                      {/* REFUND */}

                      <TableCell>

                        {Number(
                          b.refundAmount || 0
                        ) > 0 ? (

                          <Stack spacing={0.5}>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              ₹
                              {Number(
                                b.refundAmount
                              ).toFixed(2)}

                              <br />

                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                {b.refundPercentage}%
                              </Typography>

                            </Typography>

                            <Chip
                              size="small"
                              label={
                                b.refundStatus ===
                                'processed'
                                  ? 'Completed'
                                  : 'Pending'
                              }
                              color={
                                b.refundStatus ===
                                'processed'
                                  ? 'success'
                                  : 'warning'
                              }
                            />

                            {b.refundStatus ===
                              'pending' && (

                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => setRefundBooking(b)}
                              >
                                Approve Refund
                              </Button>

                            )}

                          </Stack>

                        ) : (

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            —
                          </Typography>

                        )}

                      </TableCell>


                      {/* TOTAL */}

                      <TableCell>

                        <Typography
                          fontWeight={800}
                        >
                          ₹
                          {Number(
                            b.totalAmount ||
                              0
                          ).toFixed(2)}
                        </Typography>

                      </TableCell>

                    </TableRow>

                  );

                }
              )}

            </TableBody>

          </Table>

        </Box>


        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(
            _,
            p
          ) =>
            setPage(p)
          }
          rowsPerPage={8}
          rowsPerPageOptions={[8]}
        />

      </Paper>


      {/* ==================================
          PROPERTIES
      ================================== */}

      <Paper
        sx={{ p: 2 }}
      >

        <Typography
          variant="h6"
          fontWeight={700}
        >
          Properties
        </Typography>


        <Divider
          sx={{ my: 1 }}
        />


        {props.map(
          (p) => (

            <Stack
              key={p._id}
              direction={{
                xs: 'column',
                md: 'row',
              }}
              alignItems="center"
              spacing={2}
              sx={{
                p: 1.5,
                borderBottom:
                  '1px solid #eee',
              }}
            >

              <img
                src={p.images?.[0]}
                width="90"
                height="60"
                style={{
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />


              <Box flex={1}>

                <Typography
                  fontWeight={700}
                >
                  {p.name}
                </Typography>

                <Typography
                  variant="body2"
                >
                  {p.location}
                  {' • '}
                  {p.rooms?.length || 0}
                  {' rooms'}
                </Typography>

              </Box>


              <Button
                onClick={() =>
                  openEdit(p)
                }
              >
                Edit
              </Button>


              <Button
                color="error"
                onClick={() =>
                  del(p._id)
                }
              >
                Delete
              </Button>

            </Stack>

          )
        )}

      </Paper>


      {/* ==================================
          ADD / EDIT PROPERTY
      ================================== */}

      <Dialog
        open={open}
        onClose={() =>
          setOpen(false)
        }
        fullWidth
        maxWidth="md"
      >

        <DialogTitle>

          {edit
            ? 'Edit Property'
            : 'Add Property'}

        </DialogTitle>


        <DialogContent>

          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >

            <TextField
              label="Hotel Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name:
                    e.target.value,
                })
              }
            />


            <TextField
              label="Location"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location:
                    e.target.value,
                })
              }
            />


            <TextField
              label="Description"
              multiline
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />


            <TextField
              label="Image URLs (comma separated)"
              value={form.images}
              onChange={(e) =>
                setForm({
                  ...form,
                  images:
                    e.target.value,
                })
              }
            />


            <TextField
              label="Amenities (comma separated)"
              value={form.amenities}
              onChange={(e) =>
                setForm({
                  ...form,
                  amenities:
                    e.target.value,
                })
              }
            />


            <Typography
              variant="caption"
              color="text.secondary"
            >
              Add room details using JSON.
              Example:
            </Typography>


            <TextField
              multiline
              minRows={8}
              label="Rooms JSON"
              value={JSON.stringify(
                form.rooms || [],
                null,
                2
              )}
              onChange={(e) => {

                try {

                  setForm({
                    ...form,
                    rooms:
                      JSON.parse(
                        e.target.value
                      ),
                  });

                } catch {
                  /*
                    Ignore incomplete JSON
                    while typing.
                  */
                }

              }}
            />

          </Stack>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() => {
              setOpen(false);
              setEdit(null);
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={save}
          >
            Save
          </Button>

        </DialogActions>

      </Dialog>


      {/* REFUND CONFIRMATION */}

      <Dialog
        open={Boolean(refundBooking)}
        onClose={() => setRefundBooking(null)}
      >

        <DialogTitle>
          Approve Refund
        </DialogTitle>


        <DialogContent>

          <Typography>
            Are you sure you want to approve this refund?
          </Typography>


          <Typography sx={{ mt: 2 }}>
            Booking ID:{' '}
            <b>
              {refundBooking?.bookingId ||
                refundBooking?._id}
            </b>
          </Typography>


          <Typography>
            Refund Amount:{' '}
            <b>
              ₹
              {Number(
                refundBooking?.refundAmount || 0
              ).toFixed(2)}
            </b>
          </Typography>


          <Typography>
            Refund:{' '}
            <b>
              {refundBooking?.refundPercentage || 0}%
            </b>
          </Typography>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setRefundBooking(null)
            }
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            color="success"
            onClick={async () => {

              try {

                await api(
                  `/bookings/${refundBooking._id}/refund`,
                  {
                    method: 'PATCH',
                  },
                  s.token
                );

                setRefundBooking(null);

                await load();

              } catch (e: any) {

                setMsg(
                  e.message ||
                  'Unable to process refund.'
                );

              }

            }}
          >
            Confirm Refund
          </Button>

        </DialogActions>

      </Dialog>


    </>
  );
}