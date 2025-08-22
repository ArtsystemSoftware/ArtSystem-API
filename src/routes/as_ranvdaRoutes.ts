import express from 'express';
import { as_ranvdaController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_ranvdaController.as_get);
//as_router.patch('/', as_ranvdaController.as_update);
//as_router.post('/', as_ranvdaController.as_create); 

export default as_router;