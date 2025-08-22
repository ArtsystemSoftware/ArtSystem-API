import express from 'express';
import { as_iteassController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_iteassController.as_get);
as_router.post('/', as_iteassController.as_create);
as_router.patch('/', as_iteassController.as_update);
as_router.delete('/', as_iteassController.as_delete);

export default as_router;