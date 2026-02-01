import * as vscode from "vscode";

export interface CheckerConfig {
  constantCase: string;
  functionCase: string;
  severity: vscode.DiagnosticSeverity;
}

function parseSeverity(value: string): vscode.DiagnosticSeverity {
  switch (value) {
    case "Error":
      return vscode.DiagnosticSeverity.Error;
    case "Warning":
      return vscode.DiagnosticSeverity.Warning;
    case "Information":
      return vscode.DiagnosticSeverity.Information;
    case "Hint":
      return vscode.DiagnosticSeverity.Hint;
    default:
      return vscode.DiagnosticSeverity.Warning;
  }
}

export function getConfig(): CheckerConfig {
  const config = vscode.workspace.getConfiguration("namingConventionChecker");
  return {
    constantCase: config.get<string>("constantCase", "UPPER_SNAKE_CASE"),
    functionCase: config.get<string>("functionCase", "camelCase"),
    severity: parseSeverity(config.get<string>("severity", "Warning")),
  };
}
