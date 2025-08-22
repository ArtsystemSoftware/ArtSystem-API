import express from 'express';
import { as_usulojController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_usulojController.as_get);
//as_router.patch('/', as_usulojController.as_update);
//as_router.post('/', as_usulojController.as_create); 

export default as_router;