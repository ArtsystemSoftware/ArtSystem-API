import express from 'express';
import { as_entController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_entController.as_get);
as_router.patch('/', as_entController.as_update);
as_router.post('/', as_entController.as_create);

export default as_router;