import express from 'express';
import { as_itedisController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_itedisController.as_get);
as_router.post('/', as_itedisController.as_create);
as_router.patch('/', as_itedisController.as_update);
as_router.delete('/', as_itedisController.as_delete);

export default as_router;