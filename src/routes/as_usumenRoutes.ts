import express from 'express';
import { as_usumenController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_usumenController.as_get);
//as_router.patch('/', as_usumenController.as_update);
//as_router.post('/', as_usumenController.as_create); 

export default as_router;