import dotenv from 'dotenv';
import { get } from 'env-var';

dotenv.config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});
