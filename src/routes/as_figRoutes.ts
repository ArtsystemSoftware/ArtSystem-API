import express from 'express';
import { as_figController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_figController.as_get);
as_router.post('/', as_figController.as_create);
as_router.patch('/', as_figController.as_update);

export default as_router;