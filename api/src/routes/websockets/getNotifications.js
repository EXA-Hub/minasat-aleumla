// api/src/routes/websockets/getMe.js
import { Router } from 'express';
import { authenticateToken } from '../../utils/authenticateToken.js';

const router = Router();

router.get('/getMe', authenticateToken, (req, res) => {
  res.send(req.user.username);
});

export default router;
