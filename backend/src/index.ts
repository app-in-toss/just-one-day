import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { challengeRouter } from './routes/challenge';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/challenge', challengeRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
