import { onUpdatedAST } from "./extension";
import { AST_NODE_TYPES } from "@typescript-eslint/typescript-estree";
import { DeclObj, ScopeObj, parseClosed } from "./parseClosed";
import * as vscode from "vscode";


const variableDeclaration = ({});
const variableDeclarationUnused = ({ backgroundColor: `hsla(320, 75, 40, 0)` });
const variableDeclarationHasCloses = ({
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});
const variableDeclarationHasCloses0 = ({
    before: {
        contentText: " ",
        backgroundColor: "hsla(280, 75%, 40%, 1)",
        width: "10px",
        height: "10px",
        margin: "0px 2px 0px 2px",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});
const variableDeclarationHasCloses1 = ({
    before: {
        contentText: " ",
        backgroundColor: "hsla(60, 75%, 40%, 1)",
        width: "10px",
        height: "10px",
        margin: "0px 2px 0px 2px",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});
const variableDeclarationHasCloses2 = ({
    before: {
        contentText: " ",
        backgroundColor: "hsla(200, 75%, 40%, 1)",
        width: "10px",
        height: "10px",
        margin: "0px 2px 0px 2px",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});
const variableDeclarationHasCloses3 = ({
    before: {
        contentText: " ",
        backgroundColor: "hsla(0, 75%, 40%, 1)",
        width: "10px",
        height: "10px",
        margin: "0px 2px 0px 2px",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});
const variableDeclarationHasCloses4 = ({
    before: {
        contentText: " ",
        backgroundColor: "hsla(0, 75%, 40%, 1)",
        width: "10px",
        height: "10px",
        margin: "0px 2px 0px 2px",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});

// Order is order of matching precedence
const variableUsedGlobal = ({
    border: "1px solid hsla(0, 0%, 70%, 0.4)",
    color: "hsla(0, 0%, 80%, 1)",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});
const variableUsedSameScope = ({});
const variableUsedFunctionScope = ({});
const variableUsedRootScope = ({
    border: "1px transparent",
    outline: "1px solid hsla(280, 75%, 40%, 0.6)",
    //backgroundColor: "blue",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});
const variableUsedOtherScope0 = ({
    border: "2px solid hsla(280, 75%, 40%, 0.4)",
    backgroundColor: "hsla(280, 75%, 40%, 0.3)",
    color: "hsla(280, 75%, 80%, 1)",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});
const variableUsedOtherScope1 = ({
    border: "2px solid hsla(60, 75%, 40%, 0.4)",
    backgroundColor: "hsla(60, 75%, 40%, 0.3)",
    color: "hsla(60, 75%, 80%, 1)",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});
const variableUsedOtherScope2 = ({
    border: "2px solid hsla(200, 75%, 40%, 0.4)",
    backgroundColor: "hsla(200, 75%, 40%, 0.3)",
    color: "hsla(200, 75%, 80%, 1)",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});
const variableUsedOtherScope3 = ({
    border: "2px solid hsla(0, 75%, 40%, 0.4)",
    backgroundColor: "hsla(0, 75%, 40%, 0.3)",
    color: "hsla(0, 75%, 80%, 1)",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});
const variableUsedOtherScope4 = ({
    border: "2px solid hsla(0, 75%, 40%, 1)",
    backgroundColor: "hsla(0, 75%, 40%, 0.6)",
    color: "hsla(0, 75%, 50%, 1)",
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});


function getVariableUsedOtherScope(index: number) {
    if (index === 0) return variableUsedOtherScope0;
    if (index === 1) return variableUsedOtherScope1;
    if (index === 2) return variableUsedOtherScope2;
    if (index === 3) return variableUsedOtherScope3;
    return variableUsedOtherScope4;
}

function getCloseColoring(index: number) {
    if (index === 0) return variableDeclarationHasCloses0;
    if (index === 1) return variableDeclarationHasCloses1;
    if (index === 2) return variableDeclarationHasCloses2;
    if (index === 3) return variableDeclarationHasCloses3;
    return variableDeclarationHasCloses4;
}




onUpdatedAST(({ setDecoration, traverse, doc, ast }) => {

    function onDeclare(obj: DeclObj, scope: ScopeObj) {
        declarations.set(obj, new Set());
    }
    function onAccess(
        declScope: ScopeObj | undefined,
        varName: string,
        varPos: number,
        curScope: ScopeObj,
        curFncScope: ScopeObj,
        declObj: DeclObj | undefined,
    ): void {
        let range = new vscode.Range(doc.positionAt(varPos), doc.positionAt(varPos + varName.length));

        if (!declScope) {
            setDecoration({
                range,
                hoverMessage: `Closed variable from global scope`,
                ...variableUsedGlobal
            });
            return;
        }
        if (!declObj) {
            throw new Error(`not declObj passed while there was a declScope passed. This is unexpected`);
        }

        let declFncScope = declScope.type === "brace" && declScope.parentFncScope || declScope;

        // Ugh, the root function/brace scopes means it might not be the same scope object. But... if the
        //	pos start is the same, it has to be the same scope... right?
        if (declScope.posStart === curScope.posStart) {
            setDecoration({
                range,
                hoverMessage: `Closed variable from same scope`,
                ...variableUsedSameScope
            });
            return;
        } else if (declFncScope === curFncScope) {
            setDecoration({
                range,
                hoverMessage: `Closed variable from function scope`,
                ...variableUsedFunctionScope
            });
            return;
        } else if (declScope.parentScope === undefined) {
            setDecoration({
                range,
                hoverMessage: `Closed variable from module scope`,
                ...variableUsedRootScope
            });
            return;
        } else {
            let scopeName = declScope.scopeName;

            let functionScope = curScope.type === "function" ? curScope : curScope.parentFncScope;

            if (!functionScope) {
                throw new Error(`Internal error, if the declaration for this variable is in a function, but we are the module scope... how does that even work?`);
            }

            let curInFncScope = closedFromParent.get(functionScope);
            if (!curInFncScope) {
                curInFncScope = new Map();
                closedFromParent.set(functionScope, curInFncScope);
            }
            // I've given up on naming at this point
            let curInFncScope2 = curInFncScope.get(declFncScope);
            if (!curInFncScope2) {
                curInFncScope2 = [];
                curInFncScope.set(declFncScope, curInFncScope2);
            }
            curInFncScope2.push({ range, scopeName, decl: declObj });

            //let declScopeStart = declScope.declNode?.loc.start;
            //addDecoration(variableUsedOtherScope, varFixedRange, `Closed variable from parent scope "${scopeName}" ${declScopeStart?.line}:${declScopeStart?.column}`);
            return;
        }
    }

    // key is current function scope
    let closedFromParent: Map<ScopeObj,
        // key is declFncScope
        Map<ScopeObj, {
            range: vscode.Range;
            scopeName: string;
            decl: DeclObj;
        }[]>
    > = new Map();

    // Set of child scope close colorings
    let declarations: Map<DeclObj, Set<number>> = new Map();

    parseClosed(doc.getText(), ast, onDeclare, onAccess);

    for (let [functionScope, declScopes] of closedFromParent) {
        let declScopesSorted = Array.from(declScopes.entries()).sort((b, a) => a[0].posStart - b[0].posStart);
        for (let i = 0; i < declScopesSorted.length; i++) {
            let [declScope, vars] = declScopesSorted[i];
            for (let { range, scopeName, decl } of vars) {
                let declScopeStart = declScope.posLineCol;

                setDecoration({
                    range,
                    hoverMessage: `Closed variable from parent scope "${scopeName}", ${i + 1}/${declScopesSorted.length} scopes closed. Scope declared at ${declScopeStart.line}:${declScopeStart.column}`,
                    ...getVariableUsedOtherScope(i),
                });

                let declScopeColorings = declarations.get(decl);
                if (!declScopeColorings) {
                    throw new Error(`Impossible, declaration not found`);
                }
                declScopeColorings.add(i);
            }
        }
    }

    for (let [obj, closedColorings] of declarations) {
        // Anything before the start of the document is an implicit declaration (this, arguments, etc)
        if (obj.varPos < 0) continue;

        let countUsed = obj.uses.size;

        let range = new vscode.Range(doc.positionAt(obj.varPos), doc.positionAt(obj.varPos + obj.varName.length));

        if (closedColorings.size > 0) {
            let closedColoringsSorted = Array.from(closedColorings.values()).sort((b, a) => a - b);
            setDecoration({
                range,
                hoverMessage: `Declaration closed upon. Total uses (including non-closes), are: ${countUsed} times.`,
                ...variableDeclarationHasCloses
            })
            for (let closeColoring of closedColoringsSorted) {
                setDecoration({
                    range,
                    ...getCloseColoring(closeColoring)
                });
            }
        }
        else if (countUsed === 0) {
            setDecoration({
                range,
                hoverMessage: `Unused declaration`,
                ...variableDeclarationUnused
            });
        } else {
            setDecoration({
                range,
                hoverMessage: `Declaration used ${countUsed} times`,
                ...variableDeclaration
            });
        }
    }


    traverse({
        enter: node => {
            if (node.type === AST_NODE_TYPES.AwaitExpression) {
                setDecoration({ node, backgroundColor: "blue" });
            }
        }
    });
});