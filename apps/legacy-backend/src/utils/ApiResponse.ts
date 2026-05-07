import { Response } from 'express';

export class ApiResponse {
  static success(
    res: Response,
    data: any,
    message = 'Success',
    meta: any = null,
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static error(
    res: Response,
    message = 'Error',
    code = 500,
    errors: any = null,
  ) {
    return res.status(code).json({
      success: false,
      message,
      errors,
    });
  }
}
