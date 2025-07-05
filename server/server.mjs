import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { getUser } from './dao-user.mjs';
import { getAssignmentsByStudent, getAssignmentsByTeacher } from './dao-assignment.mjs';

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('/api/login', cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware base

app.use(morgan('dev'));
app.use(express.json());


// Session + Passport
app.use(session({
  secret: 'exam2025',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.authenticate('session'));

// Configura Passport
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, cb) => {
  const user = await getUser(email, password);
  if (!user) return cb(null, false, { message: 'Invalid credentials' });
  return cb(null, user);
}));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// Middleware di protezione
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
};

const isTeacher = (req, res, next) => {
  if (req.user?.role === 'teacher') return next();
  return res.status(403).json({ error: 'Forbidden. Teacher only.' });
};

const isStudent = (req, res, next) => {
  if (req.user?.role === 'student') return next();
  return res.status(403).json({ error: 'Student only.' });
};

// ROUTE: login
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(info);
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(200).json(req.user);
    });
  })(req, res, next);
});

// ROUTE: logout
app.post('/api/logout', (req, res) => {
  req.logout(() => res.end());
});

// ROUTE: current session
app.get('/api/session/current', (req, res) => {
  if (req.isAuthenticated()) res.json(req.user);
  else res.status(401).json({ error: 'Not authenticated' });
});

// Test: to protect routes
app.get('/api/private', isLoggedIn, (req, res) => {
  res.json({ message: 'Authenticated ', user: req.user });
});

// Avvio server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));


app.get('/api/assignments', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const assignments = await getAssignmentsByTeacher(req.user.id);
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error while loading assignments' });
  }
});


app.get('/api/my-assignments', isLoggedIn, isStudent, async (req, res) => {
  try {
    const assignments = await getAssignmentsByStudent(req.user.id);
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error while loading assignments' });
  }
});