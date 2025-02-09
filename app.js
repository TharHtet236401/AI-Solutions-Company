import express from 'express';
import path from 'path';

const app = express();

// Configure static file serving
app.use('/css', express.static(path.join(process.cwd(), 'public/css')));
app.use('/js', express.static(path.join(process.cwd(), 'public/js')));
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// ... rest of your app configuration ... 