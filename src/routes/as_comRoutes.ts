import express from 'express';
import { as_comController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_comController.as_get);
as_router.patch('/', as_comController.as_update);
as_router.post('/', as_comController.as_create); 

export default as_router;