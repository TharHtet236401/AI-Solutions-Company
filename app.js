import express from 'express';
import path from 'path';

const app = express();

// Configure static file serving
app.use('/css', express.static(path.join(process.cwd(), 'public/css')));
app.use('/js', express.static(path.join(process.cwd(), 'public/js')));
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// ... rest of your app configuration ... 

// Add this if not already present
app.use('/admin', adminRoutes); 