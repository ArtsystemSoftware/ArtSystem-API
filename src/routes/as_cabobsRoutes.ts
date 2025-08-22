import express from 'express';
import { as_cabobsController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cabobsController.as_get);
as_router.post('/', as_cabobsController.as_create);
as_router.patch('/', as_cabobsController.as_update);
as_router.delete('/', as_cabobsController.as_delete);

export default as_router;