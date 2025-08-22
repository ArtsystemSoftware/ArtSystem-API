import express from 'express';
import { as_nutController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_nutController.as_get);
as_router.post('/', as_nutController.as_create);
as_router.patch('/', as_nutController.as_update);

export default as_router;