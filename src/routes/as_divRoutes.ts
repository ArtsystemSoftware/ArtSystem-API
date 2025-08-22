import express from 'express';
import { as_divController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_divController.as_get);
as_router.post('/', as_divController.as_create);
as_router.patch('/', as_divController.as_update);

export default as_router;