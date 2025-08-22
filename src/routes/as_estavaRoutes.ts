import express from 'express';
import { as_estavaController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_estavaController.as_get);
as_router.patch('/', as_estavaController.as_update);
as_router.post('/', as_estavaController.as_create);

export default as_router;