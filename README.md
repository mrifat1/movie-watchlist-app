# Movie Watchlist React Native App

A full-featured React Native mobile application for managing your movie watchlist. Built with Expo, TypeScript, and designed to integrate with your Prisma-based backend.

## Features

✨ **Authentication**
- User registration and login
- Secure token-based authentication
- Persistent login sessions

🎬 **Movie Management**
- Browse all movies
- Search movies by title
- Add new movies with details (title, year, genres, runtime, poster)
- View movie details

📝 **Watchlist Features**
- Add movies to your personal watchlist
- Filter by status (Planned, Watching, Completed, Dropped)
- Rate movies (1-10 scale)
- Add personal notes
- Update watchlist status
- Remove items from watchlist

👤 **User Profile**
- View account information
- Logout functionality
- Settings menu (ready for expansion)

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **Axios** for API calls
- **AsyncStorage** for local data persistence
- **Expo Vector Icons** for UI icons

## Prerequisites

Before you begin, ensure you have:

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Your backend API running

## Installation

1. **Clone or extract the project**

2. **Install dependencies**
```bash
cd movie-watchlist-app
npm install
```

3. **Configure your API**

Edit `src/api/config.ts` and update the API_URL:

```typescript
const API_URL = 'http://your-backend-url:3000/api';
// For local development:
// iOS Simulator: http://localhost:3000/api
// Android Emulator: http://10.0.2.2:3000/api
// Physical device: http://YOUR_COMPUTER_IP:3000/api
```

## Running the App

### Start the development server
```bash
npm start
```

### Run on iOS (Mac only)
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

### Run on Web
```bash
npm run web
```

## Backend Integration

This app is designed to work with your Prisma schema. You'll need to create the following API endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

**Request/Response formats:**

```typescript
// Register Request
{
  name: string;
  email: string;
  password: string;
}

// Login Request
{
  email: string;
  password: string;
}

// Auth Response
{
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  token: string;
}
```

### Movie Endpoints
- `GET /api/movies?search=query` - Get all movies (with optional search)
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create movie
- `PUT /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Delete movie

**Movie Request Format:**
```typescript
{
  title: string;
  overview?: string;
  releaseYear: number;
  genres: string[];
  runtime?: number;
  posterUrl?: string;
}
```

### Watchlist Endpoints
- `GET /api/watchlist?status=PLANNED` - Get user's watchlist (with optional status filter)
- `GET /api/watchlist/:id` - Get single watchlist item
- `POST /api/watchlist` - Add to watchlist
- `PUT /api/watchlist/:id` - Update watchlist item
- `DELETE /api/watchlist/:id` - Remove from watchlist

**Watchlist Request Formats:**
```typescript
// Create
{
  movieId: string;
  status?: 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'DROPPED';
  rating?: number; // 1-10
  notes?: string;
}

// Update
{
  status?: 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'DROPPED';
  rating?: number; // 1-10
  notes?: string;
}
```

### Authentication Middleware

All protected endpoints should verify the JWT token from the `Authorization` header:
```
Authorization: Bearer <token>
```

## Project Structure

```
movie-watchlist-app/
├── src/
│   ├── api/              # API service layer
│   │   ├── config.ts     # Axios configuration
│   │   ├── auth.ts       # Authentication API
│   │   ├── movies.ts     # Movies API
│   │   └── watchlist.ts  # Watchlist API
│   ├── components/       # Reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── MovieCard.tsx
│   │   └── WatchlistCard.tsx
│   ├── context/          # React Context
│   │   └── AuthContext.tsx
│   ├── navigation/       # Navigation setup
│   │   └── index.tsx
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── MoviesScreen.tsx
│   │   ├── WatchlistScreen.tsx
│   │   ├── AddMovieScreen.tsx
│   │   ├── WatchlistDetailScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── types/            # TypeScript types
│       └── index.ts
├── App.tsx               # Root component
├── app.json             # Expo configuration
├── package.json
└── tsconfig.json
```

## Key Features Explained

### Authentication Flow
1. User registers or logs in
2. JWT token is stored in AsyncStorage
3. Token is automatically attached to all API requests
4. User remains logged in until they logout

### Watchlist Status Flow
- **Planned**: Movies you want to watch
- **Watching**: Currently watching
- **Completed**: Finished watching (can add rating)
- **Dropped**: Stopped watching

### Movie Search
- Real-time search in the Movies tab
- Search by movie title
- Results update as you type

## Customization

### Change Theme Colors
Edit the color values in each screen's StyleSheet:
```typescript
const styles = StyleSheet.create({
  primary: {
    backgroundColor: '#007AFF', // Change this
  },
});
```

### Add More Genres
Edit `src/screens/AddMovieScreen.tsx`:
```typescript
const GENRE_OPTIONS = [
  'Action', 'Adventure', // Add more genres here
];
```

### Modify Rating Scale
Currently set to 1-10, but you can change in:
- `src/screens/WatchlistDetailScreen.tsx`
- Update validation logic

## Troubleshooting

### Network Errors
- Make sure your backend is running
- Check API_URL configuration
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, use your computer's IP address

### Module Not Found
```bash
npm install
cd ios && pod install && cd .. # iOS only
```

### Port Already in Use
```bash
lsof -ti:19000 | xargs kill -9
```

## Development Tips

1. **Hot Reload**: Press `r` in the terminal to reload
2. **Debug Menu**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
3. **Console Logs**: Use `console.log()` - visible in terminal
4. **Network Inspector**: Enable in Debug Menu

## Building for Production

### iOS (requires Mac)
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Next Steps

Consider adding:
- Image picker for movie posters
- Social features (share watchlists)
- Movie recommendations
- Statistics dashboard
- Dark mode support
- Push notifications
- Offline mode

## Support

For issues or questions:
1. Check the console for error messages
2. Verify your backend API is working
3. Check network connectivity
4. Review the API endpoint formats above

## License

MIT License - Feel free to use this for your projects!
