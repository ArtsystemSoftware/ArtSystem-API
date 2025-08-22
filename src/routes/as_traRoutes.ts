import express from 'express';
import { as_traController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_traController.as_get);
as_router.post('/', as_traController.as_create);
as_router.patch('/', as_traController.as_update);

export default as_router;