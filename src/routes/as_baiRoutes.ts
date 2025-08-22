import express from 'express';
import { as_baiController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_baiController.as_get);
as_router.post('/', as_baiController.as_create);
as_router.patch('/', as_baiController.as_update);

export default as_router;