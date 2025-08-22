import express from 'express';
import { as_pgecfoController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_pgecfoController.as_get);
//as_router.patch('/', as_pgecfoController.as_update);
//as_router.post('/', as_pgecfoController.as_create); 

export default as_router;