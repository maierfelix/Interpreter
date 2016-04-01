import NODE_LIST from "./NodeList";

/**
 * Parse a block
 * @return {Object}
 */
export function parseBlock() {

  if (this.accept("IF") === true) {
    return (this.parseIfStatement());
  }

  if (this.accept("RETURN") === true) {
    return (this.parseReturnStatement());
  }

  if (this.accept("ATSIGN") === true) {
    return (this.parseAsyncStatement());
  }

  if (this.accept("IDENTIFIER") === true) {
    return (this.parseIdentifierRoute());
  }

  if (
    this.accept("NUMBER") === true ||
    this.accept("STRING") === true ||
    this.accept("TRUE") === true ||
    this.accept("FALSE") === true
  ) {
    return (this.parseExpression(0));
  }

  return (null);

}

/**
 * Parse async statement
 * Identifier () | = | ; 
 * @return {Object}
 */
export function parseAsyncStatement() {

  let ast = null;

  this.next();
  ast = new NODE_LIST.AsyncStatement();
  ast.init = this.parseBlock();

  return (ast);

}

/**
 * Parse identifier route
 * Identifier () | = | . | ; 
 * @return {Object}
 */
export function parseIdentifierRoute() {

  let ast = null;

  let tmp = this.parseExpression(0);

  /** Call expression */
  if (this.accept("LPAREN")) {
    ast = this.parseCallExpression();
    ast.callee = tmp;
  }

  /** Assignment expression */
  if (this.accept("ASSIGN")) {
    ast = this.parseAssignmentExpression();
    ast.left = tmp;
  }

  return (ast);

}

/**
 * Parse call expression
 * MemberExpression () ;
 * @return {Object}
 */
export function parseCallExpression() {

  let ast = null;

  ast = new NODE_LIST.CallExpression();
  ast.arguments = this.parseArguments();

  this.next();

  return (ast);

}

/**
 * Parse assignment expression
 * Expression = Expression
 * @return {Object}
 */
export function parseAssignmentExpression() {

  let ast = null;

  ast = new NODE_LIST.AssignmentExpression();
  ast.left = this.parseExpression(0);
  ast.operator = this.node.value;
  this.expect("ASSIGN");
  ast.right = this.parseExpression(0);
  this.next();

  return (ast);

}

/**
 * Parse if statement
 * if ( Expression ) { Body } | { Body }
 * @return {Object}
 */
export function parseIfStatement() {

  let ast = null;

  this.next();

  ast = new NODE_LIST.IfStatement();
  ast.condition = this.parseParentheseExpression();
  ast.consequent = this.parseBraceBody();

  if (this.accept("LBRACE")) {
    ast.alternate = this.parseBraceBody();
  }

  return (ast);

}

/**
 * Parse return statement
 * return ( Expression )
 * @return {Object}
 */
export function parseReturnStatement() {

  let ast = null;

  this.next();
  ast = new NODE_LIST.ReturnStatement();
  ast.value = this.parseParentheseExpression();
  this.next();

  return (ast);

}

/**
 * Parse brace body
 * { Body }
 * @return {Object}
 */
export function parseBraceBody() {

  let ast = null;

  this.expect("LBRACE");
  ast = this.parseBlockStatement();
  this.expect("RBRACE");

  return (ast);

}

/**
 * Parse block statement
 * @return {Object}
 */
export function parseBlockStatement() {

  let ast = new NODE_LIST.BlockStatement();

  for (;true;) {
    if (this.accept("RBRACE") === true) break;
    ast.body.push(this.parseBlock());
  };

  return (ast);

}

/**
 * Parse arguments
 * [ , ]
 * @return {Array}
 */
export function parseArguments() {

  let ast = null;

  let args = [];

  let tmp = null;

  this.expect("LPAREN");

  tmp = this.parseBlock();

  if (tmp !== null) {
    args.push(tmp);
  }

  for (;this.accept("COMMA") === true;) {
    this.next();
    if (this.accept("LPAREN") === true) {
      this.next();
      tmp = this.parseCallExpression();
      if (tmp !== null) {
        args.push(tmp);
      }
    } else {
      tmp = this.parseBlock();
      if (tmp !== null) {
        args.push(tmp);
      }
    }
    if (this.accept("RPAREN") === true) {
      this.next();
      break;
    }
  };

  if (args.length <= 1 && this.accept("RPAREN")) {
    this.next();
  }

  return (args);

}

/**
 * Parse brace body
 * { Body }
 * @return {Object}
 */
export function parseBraceBody() {

  let ast = null;

  this.expect("LBRACE");
  ast = this.parseBlockStatement();
  this.expect("RBRACE");

  return (ast);

}

/**
 * Parse parenthese expression
 * ( Expression )
 */
export function parseParentheseExpression() {

  let ast = null;

  this.expect("LPAREN");
  ast = this.parseExpression(0);
  this.expect("RPAREN");

  return (ast);

}