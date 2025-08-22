import express from 'express';
import { as_cliproController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cliproController.as_get);
as_router.patch('/', as_cliproController.as_update);
as_router.post('/', as_cliproController.as_create); 

export default as_router;