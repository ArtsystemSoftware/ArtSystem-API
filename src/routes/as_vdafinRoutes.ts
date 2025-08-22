import express from 'express';
import { as_vdafinController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_vdafinController.as_get);
//as_router.patch('/', as_vdafinController.as_update);
//as_router.post('/', as_vdafinController.as_create); 

export default as_router;