import express from 'express';
import { as_incController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_incController.as_get);
as_router.post('/', as_incController.as_create);
as_router.patch('/', as_incController.as_update);

export default as_router;