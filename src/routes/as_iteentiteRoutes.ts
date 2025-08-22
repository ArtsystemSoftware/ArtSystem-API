import express from 'express';
import { as_iteentiteController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_iteentiteController.as_get);
as_router.post('/', as_iteentiteController.as_create);
as_router.patch('/', as_iteentiteController.as_update);
as_router.delete('/', as_iteentiteController.as_delete);

export default as_router;