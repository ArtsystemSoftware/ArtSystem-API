import express from 'express';
import { as_telController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_telController.as_get);
as_router.post('/', as_telController.as_create);
as_router.patch('/', as_telController.as_update);

export default as_router;