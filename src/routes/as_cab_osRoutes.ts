import express from 'express';
import { as_cab_osController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cab_osController.as_get);
as_router.post('/', as_cab_osController.as_create);
as_router.patch('/', as_cab_osController.as_update);
as_router.delete('/', as_cab_osController.as_delete);

export default as_router;