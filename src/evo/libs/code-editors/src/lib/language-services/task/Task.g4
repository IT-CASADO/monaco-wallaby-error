grammar Task;

taskExpressions: (addExpression)* (completeExpression)*;

addExpression: ADD TASK STRING;
completeExpression: COMPLETE TASK STRING;

ADD: 'ADD';
TASK: 'TASK';
COMPLETE: 'COMPLETE';
STRING: '"' ~ ["]* '"';
EOL: [\r\n]+ -> skip;
WS: [ \t] -> skip;
