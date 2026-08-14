import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Property from '../models/Property.js';


/*
========================================
DATABASE CONNECTION
========================================
*/

await mongoose.connect(
  process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/hotel_booking'
);


/*
========================================
CLEAR OLD DEMO DATA
========================================
*/

await User.deleteMany({});
await Property.deleteMany({});


/*
========================================
USERS
========================================
*/

await User.create({
  name: 'StayEasy Admin',
  email: 'admin@stayeasy.com',
  passwordHash: await bcrypt.hash(
    'Admin@123',
    10
  ),
  role: 'admin',
});

await User.create({
  name: 'Demo Guest',
  email: 'guest@stayeasy.com',
  passwordHash: await bcrypt.hash(
    'Guest@123',
    10
  ),
  role: 'user',
});


/*
========================================
HOTELS & ROOMS
========================================
*/

await Property.insertMany([

  /*
  ======================================
  1. GRAND CHENNAI HOTEL
  ======================================
  */

  {
    name: 'Grand Chennai Hotel',
    location: 'Chennai',
    description:
      'Modern city hotel near shopping and business districts.',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    ],
    amenities: [
      'Wi-Fi',
      'Pool',
      'Breakfast',
      'Parking',
      'Restaurant',
    ],
    rating: 4.7,

    rooms: [
      {
        roomNumber: '101',
        type: 'Single',
        price: 2200,
        capacity: 1,
        amenities: [
          'Single bed',
          'AC',
          'TV',
          'Wi-Fi',
        ],
      },

      {
        roomNumber: '102',
        type: 'Double',
        price: 3000,
        capacity: 2,
        amenities: [
          'Double bed',
          'AC',
          'TV',
          'Wi-Fi',
        ],
      },

      {
        roomNumber: '103',
        type: 'Deluxe',
        price: 3500,
        capacity: 2,
        amenities: [
          'King bed',
          'AC',
          'TV',
          'Mini Bar',
        ],
      },

      {
        roomNumber: '104',
        type: 'Family',
        price: 5200,
        capacity: 4,
        amenities: [
          '2 beds',
          'AC',
          'TV',
          'Sofa',
        ],
      },

      {
        roomNumber: '105',
        type: 'Suite',
        price: 7000,
        capacity: 4,
        amenities: [
          'King bed',
          'Living room',
          'AC',
          'TV',
          'Mini Bar',
        ],
      },
    ],
  },


  /*
  ======================================
  2. COASTAL RETREAT
  ======================================
  */

  {
    name: 'Coastal Retreat',
    location: 'Visakhapatnam',
    description:
      'Relaxing stay close to the beach with beautiful sea views.',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
    ],
    amenities: [
      'Beach Access',
      'Wi-Fi',
      'Restaurant',
      'Parking',
      'Swimming Pool',
    ],
    rating: 4.6,

    rooms: [
      {
        roomNumber: '201',
        type: 'Single',
        price: 2500,
        capacity: 1,
        amenities: [
          'Single bed',
          'AC',
          'TV',
        ],
      },

      {
        roomNumber: '202',
        type: 'Double',
        price: 3400,
        capacity: 2,
        amenities: [
          'Double bed',
          'AC',
          'TV',
          'Wi-Fi',
        ],
      },

      {
        roomNumber: '203',
        type: 'Deluxe',
        price: 4200,
        capacity: 2,
        amenities: [
          'Sea view',
          'Balcony',
          'AC',
          'TV',
        ],
      },

      {
        roomNumber: '204',
        type: 'Suite',
        price: 6800,
        capacity: 3,
        amenities: [
          'Sea view',
          'Balcony',
          'Living room',
          'AC',
        ],
      },
    ],
  },


  /*
  ======================================
  3. ROYAL HERITAGE
  ======================================
  */

  {
    name: 'Royal Heritage',
    location: 'Hyderabad',
    description:
      'Elegant hotel combining traditional architecture with modern comfort.',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
    ],
    amenities: [
      'Wi-Fi',
      'Restaurant',
      'Parking',
      'Breakfast',
      'Gym',
    ],
    rating: 4.8,

    rooms: [
      {
        roomNumber: '301',
        type: 'Single',
        price: 2400,
        capacity: 1,
        amenities: [
          'Single bed',
          'AC',
          'TV',
        ],
      },

      {
        roomNumber: '302',
        type: 'Double',
        price: 3300,
        capacity: 2,
        amenities: [
          'Double bed',
          'AC',
          'TV',
        ],
      },

      {
        roomNumber: '303',
        type: 'Deluxe',
        price: 4500,
        capacity: 2,
        amenities: [
          'King bed',
          'AC',
          'TV',
          'Mini Bar',
        ],
      },

      {
        roomNumber: '304',
        type: 'Family',
        price: 5600,
        capacity: 4,
        amenities: [
          '2 beds',
          'AC',
          'TV',
          'Sofa',
        ],
      },
    ],
  },


  /*
  ======================================
  4. GREEN VALLEY RESORT
  ======================================
  */

  {
    name: 'Green Valley Resort',
    location: 'Bangalore',
    description:
      'Peaceful resort surrounded by greenery and nature.',
    images: [
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7',
    ],
    amenities: [
      'Garden',
      'Pool',
      'Wi-Fi',
      'Restaurant',
      'Parking',
    ],
    rating: 4.5,

    rooms: [
      {
        roomNumber: '401',
        type: 'Double',
        price: 3200,
        capacity: 2,
        amenities: [
          'Double bed',
          'AC',
          'TV',
        ],
      },

      {
        roomNumber: '402',
        type: 'Deluxe',
        price: 4100,
        capacity: 2,
        amenities: [
          'King bed',
          'Garden view',
          'AC',
          'TV',
        ],
      },

      {
        roomNumber: '403',
        type: 'Family',
        price: 5400,
        capacity: 4,
        amenities: [
          '2 beds',
          'Garden view',
          'AC',
        ],
      },

      {
        roomNumber: '404',
        type: 'Suite',
        price: 7200,
        capacity: 4,
        amenities: [
          'King bed',
          'Living room',
          'Garden view',
          'AC',
        ],
      },
    ],
  },


  /*
  ======================================
  5. CITY LIGHTS HOTEL
  ======================================
  */

  {
    name: 'City Lights Hotel',
    location: 'Coimbatore',
    description:
      'Comfortable business hotel located in the heart of the city.',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427',
    ],
    amenities: [
      'Wi-Fi',
      'Breakfast',
      'Parking',
      'Conference Room',
    ],
    rating: 4.4,

    rooms: [
      {
        roomNumber: '501',
        type: 'Single',
        price: 2000,
        capacity: 1,
        amenities: [
          'Single bed',
          'AC',
          'TV',
        ],
      },

      {
        roomNumber: '502',
        type: 'Double',
        price: 2900,
        capacity: 2,
        amenities: [
          'Double bed',
          'AC',
          'TV',
        ],
      },

      {
        roomNumber: '503',
        type: 'Deluxe',
        price: 3700,
        capacity: 2,
        amenities: [
          'King bed',
          'AC',
          'TV',
          'Work Desk',
        ],
      },
    ],
  },


  /*
  ======================================
  6. PALM BEACH HOTEL
  ======================================
  */

  {
    name: 'Palm Beach Hotel',
    location: 'Goa',
    description:
      'Beachside hotel perfect for leisure and family vacations.',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
    ],
    amenities: [
      'Beach Access',
      'Pool',
      'Restaurant',
      'Bar',
      'Wi-Fi',
    ],
    rating: 4.9,

    rooms: [
      {
        roomNumber: '601',
        type: 'Double',
        price: 4500,
        capacity: 2,
        amenities: [
          'Double bed',
          'AC',
          'Balcony',
        ],
      },

      {
        roomNumber: '602',
        type: 'Deluxe',
        price: 5800,
        capacity: 2,
        amenities: [
          'Sea view',
          'Balcony',
          'King bed',
          'AC',
        ],
      },

      {
        roomNumber: '603',
        type: 'Family',
        price: 7200,
        capacity: 4,
        amenities: [
          'Sea view',
          '2 beds',
          'Balcony',
          'AC',
        ],
      },

      {
        roomNumber: '604',
        type: 'Suite',
        price: 9500,
        capacity: 4,
        amenities: [
          'Sea view',
          'Living room',
          'Balcony',
          'AC',
        ],
      },
    ],
  },


  /*
  ======================================
  7. HILL VIEW INN
  ======================================
  */

  {
    name: 'Hill View Inn',
    location: 'Ooty',
    description:
      'Cozy hill station hotel with beautiful mountain views.',
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
    ],
    amenities: [
      'Mountain View',
      'Restaurant',
      'Wi-Fi',
      'Parking',
      'Breakfast',
    ],
    rating: 4.6,

    rooms: [
      {
        roomNumber: '701',
        type: 'Single',
        price: 2300,
        capacity: 1,
        amenities: [
          'Single bed',
          'Mountain view',
          'AC',
        ],
      },

      {
        roomNumber: '702',
        type: 'Double',
        price: 3200,
        capacity: 2,
        amenities: [
          'Double bed',
          'Mountain view',
          'TV',
        ],
      },

      {
        roomNumber: '703',
        type: 'Deluxe',
        price: 4500,
        capacity: 2,
        amenities: [
          'King bed',
          'Mountain view',
          'Balcony',
        ],
      },

      {
        roomNumber: '704',
        type: 'Family',
        price: 5800,
        capacity: 4,
        amenities: [
          '2 beds',
          'Mountain view',
          'Living area',
        ],
      },
    ],
  },


  /*
  ======================================
  8. METRO GRAND
  ======================================
  */

  {
    name: 'Metro Grand',
    location: 'Mumbai',
    description:
      'Premium city hotel with modern rooms and business facilities.',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
    ],
    amenities: [
      'Wi-Fi',
      'Gym',
      'Restaurant',
      'Parking',
      'Business Center',
    ],
    rating: 4.7,

    rooms: [
      {
        roomNumber: '801',
        type: 'Single',
        price: 2800,
        capacity: 1,
        amenities: [
          'Single bed',
          'AC',
          'TV',
          'Work Desk',
        ],
      },

      {
        roomNumber: '802',
        type: 'Double',
        price: 3900,
        capacity: 2,
        amenities: [
          'Double bed',
          'AC',
          'TV',
          'Work Desk',
        ],
      },

      {
        roomNumber: '803',
        type: 'Deluxe',
        price: 5200,
        capacity: 2,
        amenities: [
          'King bed',
          'AC',
          'TV',
          'Mini Bar',
        ],
      },

      {
        roomNumber: '804',
        type: 'Suite',
        price: 8500,
        capacity: 4,
        amenities: [
          'King bed',
          'Living room',
          'AC',
          'Mini Bar',
          'Work Desk',
        ],
      },
    ],
  },

]);


console.log('');
console.log('========================================');
console.log('      StayEasy Seed Complete');
console.log('========================================');
console.log('');
console.log('Hotels created : 8');
console.log('Rooms created  : 30+');
console.log('');
console.log(
  'Admin Login: admin@stayeasy.com / Admin@123'
);
console.log(
  'Guest Login: guest@stayeasy.com / Guest@123'
);
console.log('');
console.log('========================================');


await mongoose.disconnect();