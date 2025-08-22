import express from 'express';
import { as_munController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_munController.as_get);
as_router.patch('/', as_munController.as_update);
as_router.post('/', as_munController.as_create); 

export default as_router;