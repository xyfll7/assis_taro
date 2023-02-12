import { ValidationError } from "validate";

declare module "validate" {
  export interface ValidationError extends Error { }
}

