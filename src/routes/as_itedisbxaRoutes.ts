import express from 'express';
import { as_itedisbxaController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_itedisbxaController.as_get);
as_router.post('/', as_itedisbxaController.as_create);
as_router.patch('/', as_itedisbxaController.as_update);
as_router.delete('/', as_itedisbxaController.as_delete);

export default as_router;