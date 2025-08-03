export class ApiResponse<T> {
  constructor(
    public is_success: boolean,
    public data?: T,
    public message?: string,
    public status?: number
  ) {}
}
