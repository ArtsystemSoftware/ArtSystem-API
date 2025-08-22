import express from 'express';
import { as_iteentController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_iteentController.as_get);
as_router.post('/', as_iteentController.as_create);
as_router.patch('/', as_iteentController.as_update);
as_router.delete('/', as_iteentController.as_delete);

export default as_router;