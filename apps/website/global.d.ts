import { HSStaticMethods } from "flyonui/flyonui";

declare global {
  interface Window {
    HSStaticMethods: typeof HSStaticMethods;
  }
}

export { };
