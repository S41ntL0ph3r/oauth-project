import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { AppError, ValidationError } from '@/server/errors/app-error';

export function apiResponse<T>(payload: T, status: number = 200) {
  return NextResponse.json(payload, { status });
}

export async function parseJsonBody<T>(request: Request, schema?: ZodSchema<T>): Promise<T> {
  const body = (await request.json()) as T;

  if (!schema) {
    return body;
  }

  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid request body', error.flatten());
    }

    throw error;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return apiResponse(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      error.statusCode,
    );
  }

  if (error instanceof ZodError) {
    return apiResponse(
      {
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: error.flatten(),
      },
      400,
    );
  }

  console.error('Unhandled API error:', error);
  return apiResponse({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' }, 500);
}

export async function withApiHandler<T>(handler: () => Promise<T | NextResponse>) {
  try {
    const result = await handler();
    return result instanceof NextResponse ? result : apiResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
