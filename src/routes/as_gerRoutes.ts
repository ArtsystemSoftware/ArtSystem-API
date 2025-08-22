import express from 'express';
import { as_gerController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_gerController.as_get);
as_router.post('/', as_gerController.as_create);
as_router.patch('/', as_gerController.as_update);

export default as_router;