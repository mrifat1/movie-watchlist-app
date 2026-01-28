# Backend API Implementation Guide

This document provides examples of how to implement the backend API endpoints that the React Native app expects.

## Setup

```bash
npm install express @prisma/client bcrypt jsonwebtoken
npm install -D @types/express @types/bcrypt @types/jsonwebtoken
```

## Example Express + Prisma Backend

### 1. Auth Routes (`routes/auth.ts`)

```typescript
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

### 2. Auth Middleware (`middleware/auth.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### 3. Movies Routes (`routes/movies.ts`)

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Get all movies (with optional search)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { search } = req.query;

    const movies = await prisma.movie.findMany({
      where: search
        ? {
            title: {
              contains: search as string,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single movie
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: req.params.id },
    });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create movie
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body;

    const movie = await prisma.movie.create({
      data: {
        title,
        overview,
        releaseYear: parseInt(releaseYear),
        genres,
        runtime: runtime ? parseInt(runtime) : null,
        posterUrl,
        createdBy: req.userId!,
      },
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update movie
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: req.params.id },
    });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (movie.createdBy !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.movie.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete movie
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: req.params.id },
    });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (movie.createdBy !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.movie.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

### 4. Watchlist Routes (`routes/watchlist.ts`)

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get user's watchlist
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;

    const watchlist = await prisma.watchlistItem.findMany({
      where: {
        userId: req.userId!,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        movie: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single watchlist item
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const item = await prisma.watchlistItem.findUnique({
      where: { id: req.params.id },
      include: { movie: true },
    });

    if (!item || item.userId !== req.userId) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to watchlist
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { movieId, status, rating, notes } = req.body;

    // Check if already in watchlist
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_movieId: {
          userId: req.userId!,
          movieId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Already in watchlist' });
    }

    const item = await prisma.watchlistItem.create({
      data: {
        userId: req.userId!,
        movieId,
        status: status || 'PLANNED',
        rating: rating ? parseInt(rating) : null,
        notes,
      },
      include: { movie: true },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update watchlist item
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const item = await prisma.watchlistItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item || item.userId !== req.userId) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const updated = await prisma.watchlistItem.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updatedAt: new Date(),
      },
      include: { movie: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from watchlist
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const item = await prisma.watchlistItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item || item.userId !== req.userId) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await prisma.watchlistItem.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

### 5. Main Server (`server.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import movieRoutes from './routes/movies';
import watchlistRoutes from './routes/watchlist';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Environment Variables (`.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/moviedb"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3000
```

## Testing the API

Use these curl commands to test:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get movies (with token)
curl http://localhost:3000/api/movies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Add movie
curl -X POST http://localhost:3000/api/movies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","releaseYear":2010,"genres":["Sci-Fi","Thriller"]}'

# Get watchlist
curl http://localhost:3000/api/watchlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Notes

- Remember to add proper validation using libraries like `joi` or `zod`
- Add rate limiting for production
- Use environment variables for all secrets
- Consider adding request logging (morgan)
- Add proper error handling middleware
- Set up database migrations with Prisma
