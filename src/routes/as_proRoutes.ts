import express from 'express';
import { as_proController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_proController.as_get);
as_router.post('/', as_proController.as_create);
as_router.patch('/', as_proController.as_update);

export default as_router;