// api/src/routes/websockets/getMe.js

import { Router } from 'express';

const router = Router();

router.get('/getMe', (req, res) => {
  res.send(req.user.username);
});

export default router;
