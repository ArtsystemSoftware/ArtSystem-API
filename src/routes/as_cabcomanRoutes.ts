import express from 'express';
import { as_cabcomanController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cabcomanController.as_get);
as_router.post('/', as_cabcomanController.as_create);
as_router.patch('/', as_cabcomanController.as_update);
as_router.delete('/', as_cabcomanController.as_delete);

export default as_router;