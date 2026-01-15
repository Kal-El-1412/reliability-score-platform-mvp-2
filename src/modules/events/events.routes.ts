import { Router } from 'express';
import { EventsController } from './events.controller';
import { validate } from '../../middleware/validate';
import { createEventSchema } from './events.validation';
import { authenticate } from '../../middleware/auth';

const router = Router();
const eventsController = new EventsController();

router.post('/', authenticate, validate(createEventSchema), eventsController.createEvent);

export default router;
