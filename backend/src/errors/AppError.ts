export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested product was not found.') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
