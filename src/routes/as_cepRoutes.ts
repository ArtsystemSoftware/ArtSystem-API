import express from 'express';
import { as_cepController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cepController.as_get);
as_router.post('/', as_cepController.as_create);
as_router.patch('/', as_cepController.as_update);

export default as_router;