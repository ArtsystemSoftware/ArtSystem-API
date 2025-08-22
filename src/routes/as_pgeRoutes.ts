import express from 'express';
import { as_pgeController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_pgeController.as_get);
//as_router.patch('/', as_pgeController.as_update);
//as_router.post('/', as_pgeController.as_create); 

export default as_router;