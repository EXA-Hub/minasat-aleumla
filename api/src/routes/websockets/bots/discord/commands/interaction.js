// api/src/routes/websockets/bots/discord/commands/interaction.js
import { Router } from 'express';

const router = Router();

// discord Interactions Endpoint URL
router.get('/interactions', (req, res) => {
  res.status(200).json({
    type: 1, // 1 for an application command
  });
});

export default router;
