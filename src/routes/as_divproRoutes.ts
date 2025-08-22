import express from 'express';
import { as_divproController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_divproController.as_get);
as_router.post('/', as_divproController.as_create);
as_router.patch('/', as_divproController.as_update);

export default as_router;