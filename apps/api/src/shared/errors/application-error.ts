// アプリケーションエラーの統一定義

export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class RepositoryError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "REPOSITORY_ERROR", 500, details);
    this.name = "RepositoryError";
  }
}

export class UseCaseError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "USE_CASE_ERROR", 500, details);
    this.name = "UseCaseError";
  }
}

export class DomainError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "DOMAIN_ERROR", 400, details);
    this.name = "DomainError";
  }
}

// エラー作成ヘルパー関数
export const createValidationError = (field: string, message: string): ValidationError => new ValidationError(`${field}: ${message}`, { field });

export const createRepositoryError = (operation: string, details?: Record<string, unknown>): RepositoryError =>
  new RepositoryError(`Repository operation failed: ${operation}`, details);

export const createUseCaseError = (useCase: string, message: string, details?: Record<string, unknown>): UseCaseError =>
  new UseCaseError(`${useCase}: ${message}`, { useCase, ...details });

export const createDomainError = (domain: string, message: string, details?: Record<string, unknown>): DomainError =>
  new DomainError(`${domain}: ${message}`, { domain, ...details });
