import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { CatalogueController } from '../controllers/catalogueController.js';

export function createCatalogueRouter(controller = new CatalogueController()): Router {
  const router = Router();
  const enquiryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many enquiries from this connection. Please try again later.' },
  });

  router.get('/products/featured', controller.featured);
  router.get('/categories', controller.categories);
  router.get('/categories/:name/products', controller.category);
  router.get('/products/search', controller.search);
  router.get('/products/:id', controller.product);
  router.post('/enquiries', enquiryLimiter, controller.enquiry);

  return router;
}
