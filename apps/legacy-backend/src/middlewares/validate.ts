import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

import { errorResponse } from '@/shared/response';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // validate req.query
    const { error, value } = schema.validate(req.query, {
      abortEarly: false, // return all errors, not just the first one
      stripUnknown: true, // remove unknown keys that are not defined in the schema
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return errorResponse(res, errorMessage, 400);
    }

    Object.assign(req.query, value);
    next();
  };
};
