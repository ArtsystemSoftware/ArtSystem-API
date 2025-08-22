import express from 'express';
import { as_refController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_refController.as_get);
as_router.post('/', as_refController.as_create);
as_router.patch('/', as_refController.as_update);

export default as_router;