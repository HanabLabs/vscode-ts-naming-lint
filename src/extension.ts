import * as vscode from "vscode";
import { checkFile, formatMessage } from "./checker";
import { getConfig } from "./config";

let diagnosticCollection: vscode.DiagnosticCollection;

function checkDocument(document: vscode.TextDocument): void {
  if (document.languageId !== "typescript" && document.languageId !== "typescriptreact") {
    return;
  }

  const config = getConfig();
  const violations = checkFile(document.getText(), document.fileName, {
    constantCase: config.constantCase,
    functionCase: config.functionCase,
  });

  const diagnostics: vscode.Diagnostic[] = violations.map((v) => {
    const range = new vscode.Range(v.line, v.character, v.line, v.endCharacter);
    const diagnostic = new vscode.Diagnostic(range, formatMessage(v), config.severity);
    diagnostic.source = "Naming Convention Checker";
    return diagnostic;
  });

  diagnosticCollection.set(document.uri, diagnostics);
}

export function activate(context: vscode.ExtensionContext): void {
  diagnosticCollection = vscode.languages.createDiagnosticCollection("namingConventionChecker");
  context.subscriptions.push(diagnosticCollection);

  // Check on file open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => checkDocument(doc))
  );

  // Check on file save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => checkDocument(doc))
  );

  // Check on active editor change
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        checkDocument(editor.document);
      }
    })
  );

  // Check all currently open documents
  vscode.workspace.textDocuments.forEach((doc) => checkDocument(doc));
}

export function deactivate(): void {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}
