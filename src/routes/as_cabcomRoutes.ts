import express from 'express';
import { as_cabcomController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cabcomController.as_get);
as_router.post('/', as_cabcomController.as_create);
as_router.patch('/', as_cabcomController.as_update);
as_router.delete('/', as_cabcomController.as_delete);

export default as_router;