// src/components/FilterControls/filterConfig.js

const commonStringOperators = ["=", "contains", "does not contain", "starts with", "ends with"];
const commonNumericOperators = ["=", ">", "<", ">=", "<="];
const commonCategoricalOperators = ["any of", "none of"];
const allCategoricalOperators = ["any of", "none of", "all of"];

export const promptsFilterConfig = [
  { key: "Name", label: "Name", type: "string", operators: commonStringOperators },
  { key: "Version", label: "Version", type: "number", operators: commonNumericOperators },
  { key: "CreatedAt", label: "Created At", type: "date", operators: commonNumericOperators },
  { key: "UpdatedAt", label: "Updated At", type: "date", operators: commonNumericOperators },
  { key: "Type", label: "Type", type: "categorical", operators: commonCategoricalOperators, options: ["chat", "text"] },
  { key: "Labels", label: "Labels", type: "categorical", operators: allCategoricalOperators, options: ["latest", "production"] },
  { key: "Tags", label: "Tags", type: "categorical", operators: allCategoricalOperators, options: [] }, // Tags는 동적으로 가져올 수 있으므로 비워둡니다.
  { key: "Config", label: "Config", type: "string", operators: commonStringOperators, hasMetaKey: true },
];

export const tracingFilterConfig = [
  { key: "ID", label: "ID", type: "string", operators: commonStringOperators },
  { key: "Name", label: "Name", type: "categorical", operators: commonCategoricalOperators, options: [] },
  { key: "Timestamp", label: "Timestamp", type: "date", operators: commonNumericOperators },
  { key: "UserID", label: "User ID", type: "string", operators: commonStringOperators },
  { key: "SessionID", label: "Session ID", type: "string", operators: commonStringOperators },
  { key: "Metadata", label: "Metadata", type: "string", operators: commonStringOperators, hasMetaKey: true },
  { key: "Version", label: "Version", type: "string", operators: commonStringOperators },
  { key: "Release", label: "Release", type: "string", operators: commonStringOperators },
  { key: "Level", label: "Level", type: "categorical", operators: commonCategoricalOperators, options: ["DEBUG", "DEFAULT", "WARNING", "ERROR"] },
  { key: "Tags", label: "Tags", type: "categorical", operators: allCategoricalOperators, options: [] },
  { key: "InputTokens", label: "Input Tokens", type: "number", operators: commonNumericOperators },
  { key: "OutputTokens", label: "Output Tokens", type: "number", operators: commonNumericOperators },
  { key: "TotalTokens", label: "Total Tokens", type: "number", operators: commonNumericOperators },
  { key: "Tokens", label: "Tokens", type: "number", operators: commonNumericOperators },
  { key: "ErrorLevelCount", label: "Error Level Count", type: "number", operators: commonNumericOperators },
  { key: "WarningLevelCount", label: "Warning Level Count", type: "number", operators: commonNumericOperators },
  { key: "DefaultLevelCount", label: "Default Level Count", type: "number", operators: commonNumericOperators },
  { key: "DebugLevelCount", label: "Debug Level Count", type: "number", operators: commonNumericOperators },
  { key: "ScoresNumeric", label: "Scores (numeric)", type: "number", operators: commonNumericOperators, hasMetaKey: true },
  { key: "ScoresCategorical", label: "Scores (categorical)", type: "categorical", operators: commonCategoricalOperators, hasMetaKey: true, options: [] },
  { key: "Latency", label: "Latency (s)", type: "number", operators: commonNumericOperators },
  { key: "InputCost", label: "Input Cost ($)", type: "number", operators: commonNumericOperators },
  { key: "OutputCost", label: "Output Cost ($)", type: "number", operators: commonNumericOperators },
  { key: "TotalCost", label: "Total Cost ($)", type: "number", operators: commonNumericOperators },
];

export const sessionsFilterConfig = [
  { key: "id", label: "ID", type: "string", operators: commonStringOperators },
  { key: "createdAt", label: "Created At", type: "date", operators: commonNumericOperators },
  { key: "projectId", label: "Project ID", type: "string", operators: commonStringOperators },
  { key: "environment", label: "Environment", type: "categorical", operators: commonCategoricalOperators, options: [] }, // 옵션은 동적으로 채울 수 있도록 비워둡니다.
];
