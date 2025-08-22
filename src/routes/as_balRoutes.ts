import express from 'express';
import { as_balController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_balController.as_get);
as_router.post('/', as_balController.as_create);
as_router.patch('/', as_balController.as_update);

export default as_router;