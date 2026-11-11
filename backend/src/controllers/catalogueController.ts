import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ProductService } from '../services/productService.js';
import { EmailService } from '../services/emailService.js';
import type { EmailSender } from '../services/emailService.js';

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().max(1000).optional(),
  productId: z.number().int().positive(),
});

export class CatalogueController {
  constructor(
    private readonly products = new ProductService(),
    private readonly email: EmailSender = new EmailService(),
  ) {}

  featured = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.products.featured());
    } catch (error) {
      next(error);
    }
  };

  categories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.products.categories());
    } catch (error) {
      next(error);
    }
  };

  category = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawName = req.params.name;
      const categoryName = Array.isArray(rawName) ? rawName[0] : rawName;
      if (!categoryName) {
        res.status(400).json({ error: 'Invalid category name.' });
        return;
      }
      res.json(await this.products.byCategory(categoryName));
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const term = String(req.query.q ?? '').trim();
      if (!term) {
        res.status(400).json({ error: 'Enter a search term.' });
        return;
      }
      if (term.length > 100) {
        res.status(400).json({ error: 'Search terms must be 100 characters or fewer.' });
        return;
      }
      res.json(await this.products.search(term));
    } catch (error) {
      next(error);
    }
  };

  product = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ error: 'Invalid product ID.' });
        return;
      }
      res.json(await this.products.getById(id));
    } catch (error) {
      next(error);
    }
  };

  enquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = enquirySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Please check the enquiry details and try again.',
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const product = await this.products.getById(parsed.data.productId);
      await this.email.send(parsed.data, product);
      res.status(202).json({ message: 'Thank you. Your enquiry has been submitted.' });
    } catch (error) {
      next(error);
    }
  };
}
