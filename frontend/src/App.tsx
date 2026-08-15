import {Link,Routes,Route,useNavigate} from 'react-router-dom';
import {useEffect,useRef} from 'react';import {AppBar,Toolbar,Typography,Button,Container,Box,Stack,Avatar} from '@mui/material';import {useDispatch,useSelector} from 'react-redux';import {RootState,logout,clearGuest} from './store/store';import SearchPage from './pages/SearchPage';import BookingPage from './pages/BookingPage';import AdminPage from './pages/AdminPage';import LoginPage from './pages/LoginPage';import RegisterPage from './pages/RegisterPage';import MyBookingsPage from './pages/MyBookingsPage';import ProfilePage from './pages/ProfilePage';
function Nav(){
const user=useSelector((s:RootState)=>s.booking.user);
const dispatch=useDispatch();
const nav=useNavigate();
const timer=useRef<ReturnType<typeof setTimeout>|null>(null);

useEffect(()=>{
  const timeout=user?.role==='admin'
    ? 10*60*1000
    : user
      ? 15*60*1000
      : 10*60*1000;

  const handleTimeout=()=>{
    if(user){
      dispatch(logout());
      nav('/login');
    }else{
      dispatch(clearGuest());
      nav('/');
    }
  };

  const resetTimer=()=>{
    if(timer.current) clearTimeout(timer.current);
    timer.current=setTimeout(handleTimeout,timeout);
  };

  const events=[
    'mousemove',
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click'
  ];

  events.forEach(event=>{
    window.addEventListener(event,resetTimer);
  });

  resetTimer();

  return ()=>{
    if(timer.current) clearTimeout(timer.current);
    events.forEach(event=>{
      window.removeEventListener(event,resetTimer);
    });
  };
},[user?.role,user,dispatch,nav]);

return <AppBar position="sticky"><Toolbar><Typography variant="h6" sx={{flexGrow:1,fontWeight:800}}>🏨 StayEasy</Typography><Stack direction="row" spacing={1} alignItems="center"><Button color="inherit" component={Link} to="/">Search</Button>{user&&<><Button color="inherit" component={Link} to="/my-bookings">Bookings</Button><Button color="inherit" component={Link} to="/profile">Profile</Button></>}{user?.role==='admin'&&<Button color="inherit" component={Link} to="/admin">Admin</Button>}{user?<Button color="inherit" onClick={()=>{dispatch(logout());nav('/')}}>Logout</Button>:<><Button color="inherit" component={Link} to="/login">Login</Button><Button variant="outlined" color="inherit" component={Link} to="/register">Register</Button></>}{user?.avatar&&<Avatar src={user.avatar} sx={{width:30,height:30}}/>}</Stack></Toolbar></AppBar>}
export default function App(){return <><Nav/><Container maxWidth="lg"><Box sx={{py:4}}><Routes><Route path="/" element={<SearchPage/>}/><Route path="/book" element={<BookingPage/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route path="/my-bookings" element={<MyBookingsPage/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="/admin" element={<AdminPage/>}/></Routes></Box></Container></>}
