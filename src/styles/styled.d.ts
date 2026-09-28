import "styled-components";
import type { AppTheme } from "@/styles/theme";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: AppTheme["colors"];
    fontWeights: AppTheme["fontWeights"];
  }
}
