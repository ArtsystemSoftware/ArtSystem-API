import express from 'express';
import { as_lojController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_lojController.as_get);
as_router.patch('/', as_lojController.as_update);
as_router.post('/', as_lojController.as_create); 

export default as_router;