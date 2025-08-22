import express from 'express';
import { as_menController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_menController.as_get);
//as_router.patch('/', as_menController.as_update);
//as_router.post('/', as_menController.as_create); 

export default as_router;