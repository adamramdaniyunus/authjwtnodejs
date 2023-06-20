import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './config/Database.js';
import Users from './models/UsersModels.js';
import router from './routes/web.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();


try {
    await db.authenticate();
    console.log('Database Connected');
    // await Users.sync({ alter: true });
    // console.log('Create Models Successfully');
} catch (error) {
    console.log(error);
}


app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
app.use(cookieParser());
app.use(express.json());
app.use(router);


app.listen(process.env.APP_PORT, () => {
    console.log('server Up and Running');
})