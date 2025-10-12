export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public data?: T,
    public message?: string,
    public statusCode?: number,
    public timestamp?: string,
    public correlationId?: string
  ) {}
}
