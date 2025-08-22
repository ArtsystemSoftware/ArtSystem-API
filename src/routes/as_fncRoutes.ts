import express from 'express';
import { as_fncController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_fncController.as_get);
as_router.patch('/', as_fncController.as_update);
as_router.post('/', as_fncController.as_create); 

export default as_router;