import express from 'express';
import { as_cencomController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cencomController.as_get);
as_router.post('/', as_cencomController.as_create);
as_router.patch('/', as_cencomController.as_update);

export default as_router;