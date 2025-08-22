import express from 'express';
import { as_iteController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_iteController.as_get);
as_router.post('/', as_iteController.as_create);
as_router.patch('/', as_iteController.as_update);
as_router.delete('/', as_iteController.as_delete);

export default as_router;