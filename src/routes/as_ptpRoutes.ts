import express from 'express';
import { as_ptpController } from '@root/controllers';

const as_router = express.Router();
as_router.get('/', as_ptpController.as_get);
as_router.post('/', as_ptpController.as_create);
as_router.patch('/', as_ptpController.as_update);

export default as_router;