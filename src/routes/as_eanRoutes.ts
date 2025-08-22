import express from 'express';
import { as_eanController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_eanController.as_get);
as_router.post('/', as_eanController.as_create);
as_router.patch('/', as_eanController.as_update);

export default as_router;