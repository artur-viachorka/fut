export class CustomFutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CustomFutError';
  }
}
