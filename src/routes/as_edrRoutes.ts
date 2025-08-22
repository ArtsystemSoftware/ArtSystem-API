import express from 'express';
import { as_edrController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_edrController.as_get);
as_router.post('/', as_edrController.as_create);
as_router.patch('/', as_edrController.as_update);

export default as_router;