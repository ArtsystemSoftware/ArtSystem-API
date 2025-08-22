import express from 'express';
import { as_cabiosController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cabiosController.as_get);
as_router.post('/', as_cabiosController.as_create);
as_router.patch('/', as_cabiosController.as_update);
as_router.delete('/', as_cabiosController.as_delete);

export default as_router;