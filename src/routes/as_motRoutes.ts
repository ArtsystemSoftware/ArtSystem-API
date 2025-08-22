import express from 'express';
import { as_motController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_motController.as_get);
as_router.patch('/', as_motController.as_update);
as_router.post('/', as_motController.as_create); 

export default as_router;