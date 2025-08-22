import express from 'express';
import { as_venproController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_venproController.as_get);
as_router.post('/', as_venproController.as_create);
as_router.patch('/', as_venproController.as_update);

export default as_router;