import express from 'express';
import { as_tsfController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_tsfController.as_get);
// as_router.post('/', as_tsfController.as_create);
// as_router.patch('/', as_tsfController.as_update);

export default as_router;