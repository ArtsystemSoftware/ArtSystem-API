import express from 'express';
import { as_clicarController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_clicarController.as_get);
as_router.patch('/', as_clicarController.as_update);
as_router.post('/', as_clicarController.as_create); 

export default as_router;