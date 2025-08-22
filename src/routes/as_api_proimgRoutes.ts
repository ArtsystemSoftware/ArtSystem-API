import express from 'express';
import { as_api_proimgController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_api_proimgController.as_get);
// as_router.post('/', as_api_proimgController.as_create);
// as_router.patch('/', as_api_proimgController.as_update);

export default as_router;