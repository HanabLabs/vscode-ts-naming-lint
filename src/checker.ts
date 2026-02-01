import * as ts from "typescript";
import { checkNamingConvention, getExample } from "./rules";

export interface Violation {
  name: string;
  line: number;
  character: number;
  endCharacter: number;
  kind: "constant" | "function";
  rule: string;
}

interface CheckOptions {
  constantCase: string;
  functionCase: string;
}

function isPrimitiveLiteral(node: ts.Expression): boolean {
  if (ts.isNumericLiteral(node) || ts.isStringLiteral(node)) {
    return true;
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
    return true;
  }
  // Negative numbers: -1, -3.14
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    return ts.isNumericLiteral(node.operand);
  }
  return false;
}

function hasAsConst(node: ts.VariableDeclaration): boolean {
  if (!node.initializer) {
    return false;
  }
  if (ts.isAsExpression(node.initializer)) {
    const typeNode = node.initializer.type;
    return ts.isTypeReferenceNode(typeNode) && typeNode.typeName.getText() === "const";
  }
  return false;
}

function isFunctionLike(node: ts.Expression): boolean {
  return ts.isArrowFunction(node) || ts.isFunctionExpression(node);
}

export function checkFile(sourceText: string, fileName: string, options: CheckOptions): Violation[] {
  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
  const violations: Violation[] = [];

  function visit(node: ts.Node) {
    // Skip nodes inside class declarations
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
      return;
    }
    // Skip enum and interface declarations
    if (ts.isEnumDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      return;
    }

    // Function declarations
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      if (!checkNamingConvention(name, options.functionCase)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
        violations.push({
          name,
          line,
          character,
          endCharacter: character + name.length,
          kind: "function",
          rule: options.functionCase,
        });
      }
      // Still visit children (nested functions)
      ts.forEachChild(node, visit);
      return;
    }

    // Variable declarations (const)
    if (ts.isVariableStatement(node)) {
      const declList = node.declarationList;
      if (declList.flags & ts.NodeFlags.Const) {
        for (const decl of declList.declarations) {
          // Skip destructuring patterns
          if (!ts.isIdentifier(decl.name)) {
            continue;
          }
          const name = decl.name.text;
          if (!decl.initializer) {
            continue;
          }

          // Skip as const assertions
          if (hasAsConst(decl)) {
            continue;
          }

          const init = decl.initializer;

          // Arrow function or function expression → function name check
          if (isFunctionLike(init)) {
            if (!checkNamingConvention(name, options.functionCase)) {
              const { line, character } = sourceFile.getLineAndCharacterOfPosition(decl.name.getStart());
              violations.push({
                name,
                line,
                character,
                endCharacter: character + name.length,
                kind: "function",
                rule: options.functionCase,
              });
            }
            continue;
          }

          // Primitive literal → constant name check
          if (isPrimitiveLiteral(init)) {
            if (!checkNamingConvention(name, options.constantCase)) {
              const { line, character } = sourceFile.getLineAndCharacterOfPosition(decl.name.getStart());
              violations.push({
                name,
                line,
                character,
                endCharacter: character + name.length,
                kind: "constant",
                rule: options.constantCase,
              });
            }
            continue;
          }

          // Arrays, objects, template literals, etc. → skip
        }
      }
      // Don't recurse into variable statement children further
      return;
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);
  return violations;
}

export function formatMessage(violation: Violation): string {
  const kindLabel = violation.kind === "constant" ? "定数名" : "関数名";
  const example = getExample(violation.rule);
  return `${kindLabel} "${violation.name}" は ${violation.rule} に従っていません（例: ${example}）`;
}
