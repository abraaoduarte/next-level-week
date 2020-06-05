import express from 'express';
import PointControllers from '../controllers/PointControllers';
import ItemController from '../controllers/ItemControllers';
import multer from 'multer';
import multerConfig from '../config/multer';
import { celebrate, Joi } from 'celebrate';

const pointControllers = new PointControllers();
const itemController = new ItemController();

const routes = express.Router();
const upload = multer(multerConfig);

routes.get('/items', itemController.index)
routes.post(
  '/points',
  upload.single('image'),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    })
  }, {
    abortEarly: false,
  }),
  pointControllers.create
)
routes.get('/points', pointControllers.index)
routes.get('/points/:id', pointControllers.show)

export default routes;