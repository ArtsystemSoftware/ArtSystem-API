import express from 'express';
import { as_iteambController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_iteambController.as_get);
as_router.post('/', as_iteambController.as_create);
as_router.patch('/', as_iteambController.as_update);
as_router.delete('/', as_iteambController.as_delete);

export default as_router;