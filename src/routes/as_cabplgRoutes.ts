import express from 'express';
import { as_cabplgController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_cabplgController.as_get);
as_router.post('/', as_cabplgController.as_create);
as_router.patch('/', as_cabplgController.as_update);
as_router.delete('/', as_cabplgController.as_delete);

export default as_router;