import express from 'express';
import { as_cabfinController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cabfinController.as_get);
as_router.post('/', as_cabfinController.as_create);
as_router.patch('/', as_cabfinController.as_update);
as_router.delete('/', as_cabfinController.as_delete);

export default as_router;