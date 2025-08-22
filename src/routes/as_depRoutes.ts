import express from 'express';
import { as_depController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_depController.as_get);
as_router.post('/', as_depController.as_create);
as_router.patch('/', as_depController.as_update);

export default as_router;