export class RiskControlError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "RiskControlError";
    this.details = details;
  }
}

export class SessionRequiredError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "SessionRequiredError";
    this.details = details;
  }
}
