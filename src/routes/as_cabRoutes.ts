import express from 'express';
import { as_cabController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cabController.as_get);
as_router.post('/', as_cabController.as_create);
as_router.patch('/', as_cabController.as_update);
as_router.delete('/', as_cabController.as_delete);

export default as_router;