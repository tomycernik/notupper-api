import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { envs } from '@config/envs';
import { AppRoutes } from '@infrastructure/routes/router';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', AppRoutes.routes);

app.listen(envs.PORT, () => {
  console.log(`🚀 NotTupper API corriendo en puerto ${envs.PORT}`);
});
