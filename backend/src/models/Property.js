import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        'Single',
        'Double',
        'Twin',
        'Deluxe',
        'Suite',
        'Family',
        'Standard',
      ],
      default: 'Standard',
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    capacity: {
      type: Number,
      default: 2,
      min: 1,
    },

    images: {
      type: [String],
      default: [],
    },

    amenities: {
      type: [String],
      default: [],
    },
  },
  {
    _id: true,
  }
);


const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    amenities: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },

    rooms: {
      type: [roomSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model(
  'Property',
  propertySchema
);