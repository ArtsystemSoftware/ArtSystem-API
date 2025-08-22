import express from 'express';
import { as_cencliController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cencliController.as_get);
as_router.post('/', as_cencliController.as_create);
as_router.patch('/', as_cencliController.as_update);

export default as_router;