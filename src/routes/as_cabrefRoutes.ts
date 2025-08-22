import express from 'express';
import { as_cabrefController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cabrefController.as_get);
as_router.post('/', as_cabrefController.as_create);
as_router.patch('/', as_cabrefController.as_update);
as_router.delete('/', as_cabrefController.as_delete);

export default as_router;