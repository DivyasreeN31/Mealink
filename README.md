# Donation Platform

A full-stack donation platform built with React frontend and Node.js/Express backend with MongoDB database. Users can donate items, browse available donations, and manage their donations and reservations.

## Features

- 🔐 **Authentication**: User registration and login with JWT tokens
- 📱 **Donation Management**: Upload, edit, and delete donation items
- 🗺️ **Location-based Search**: Find items near your location
- 📸 **Image Upload**: Upload images for donation items
- 🔔 **Notifications**: Browser push notifications for new donations
- 📊 **User Dashboard**: Track donations and reservations
- 🎯 **Category Filtering**: Filter by food, clothes, utensils
- 📱 **Responsive Design**: Works on desktop and mobile

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (Icons)
- React Router

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (File uploads)
- bcryptjs (Password hashing)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd donation-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Configuration

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/donation-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Note**: For local development, you can use the default MongoDB URI. For production, use MongoDB Atlas or your preferred MongoDB hosting service.

#### Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
# From the root directory
cd ..
npm install
```

#### Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/notifications` - Update notification preferences

### Items
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/reserve` - Reserve an item
- `POST /api/items/:id/complete` - Mark item as completed

### Users
- `GET /api/users/donations` - Get user's donated items
- `GET /api/users/reservations` - Get user's reserved items
- `GET /api/users/stats` - Get user statistics

## Database Schema

### User Model
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  displayName: String (required),
  phone: String,
  address: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  notificationsEnabled: Boolean,
  notificationDistance: Number,
  role: String (enum: ['user', 'admin']),
  isGuest: Boolean
}
```

### Item Model
```javascript
{
  title: String (required),
  category: String (enum: ['food', 'clothes', 'utensils']),
  description: String (required),
  quantity: Number (required),
  imageUrl: String (required),
  location: {
    latitude: Number (required),
    longitude: Number (required),
    address: String (required)
  },
  contactInfo: {
    email: String,
    phone: String (required)
  },
  providerId: ObjectId (ref: 'User'),
  providerName: String (required),
  status: String (enum: ['available', 'pending', 'completed', 'expired']),
  receiverId: ObjectId (ref: 'User'),
  receiverName: String,
  isVeg: Boolean (food items only),
  expiryDate: Date (food items only),
  condition: String (non-food items only),
  views: Number,
  reservedAt: Date,
  completedAt: Date
}
```

## Features in Detail

### Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Guest mode support

### Donation Management
- Upload items with images
- Category-specific fields (food: expiry date, vegetarian status; others: condition)
- Location-based item discovery
- Real-time status updates

### Search and Filtering
- Text search in title and description
- Category filtering
- Location-based radius search
- Status filtering

### User Dashboard
- View donated items
- View reserved items
- Statistics tracking
- Profile management

### Notifications
- Browser push notifications
- Configurable notification distance
- Notification preferences management

## File Structure

```
donation-platform/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Item.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── items.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── config.env
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── provider/
│   │   ├── receiver/
│   │   └── ...
│   ├── contexts/
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   └── ...
├── package.json
└── README.md
```

## Deployment

### Backend Deployment
1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Deploy to platforms like Heroku, Railway, or DigitalOcean
3. Set environment variables in your hosting platform
4. Ensure the uploads directory is properly configured for file storage

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to platforms like Vercel, Netlify, or GitHub Pages
3. Update the API base URL in `src/services/api.js` to point to your deployed backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 