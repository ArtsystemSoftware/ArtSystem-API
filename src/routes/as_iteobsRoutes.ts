import express from 'express';
import { as_iteobsController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_iteobsController.as_get);
as_router.post('/', as_iteobsController.as_create);
as_router.patch('/', as_iteobsController.as_update);
as_router.delete('/', as_iteobsController.as_delete);

export default as_router;