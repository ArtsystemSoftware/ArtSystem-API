import express from 'express';
import { as_cliController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cliController.as_get);
as_router.patch('/', as_cliController.as_update);
as_router.post('/', as_cliController.as_create); 

export default as_router;