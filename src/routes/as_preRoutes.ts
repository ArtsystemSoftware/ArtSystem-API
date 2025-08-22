import express from 'express';
import { as_preController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_preController.as_get);
as_router.post('/', as_preController.as_create);
as_router.patch('/', as_preController.as_update);

export default as_router;