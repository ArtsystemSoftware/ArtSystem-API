import express from 'express';
import { as_venController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_venController.as_get);
as_router.post('/', as_venController.as_create);
as_router.patch('/', as_venController.as_update);

export default as_router;