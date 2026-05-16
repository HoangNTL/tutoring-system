import { Response } from 'express';

export const successResponse = <TData>(
  res: Response,
  data: TData,
  message = 'Success',
  meta: unknown = null,
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const errorResponse = (
  res: Response,
  message = 'Error',
  statusCode = 500,
  errors: unknown = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    meta: null,
  });
};
