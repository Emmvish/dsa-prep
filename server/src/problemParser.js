const fs = require("fs");
const path = require("path");
const vm = require("vm");

function extractBetween(source, startRegex, endRegex) {
  const startMatch = source.match(startRegex);
  if (!startMatch) return "";

  const startIndex = startMatch.index;
  const sub = source.slice(startIndex);
  const endMatch = sub.match(endRegex);
  if (!endMatch) return sub;

  return sub.slice(0, endMatch.index);
}

function getPrimarySymbols(code) {
  const functionNames = [...code.matchAll(/function\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  const classNames = [...code.matchAll(/class\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]);

  if (functionNames.length > 0) {
    return functionNames;
  }

  return classNames;
}

function inferStatement(title) {
  const clean = title.endsWith(".") ? title.slice(0, -1) : title;
  if (clean.toLowerCase().startsWith("given ")) {
    return `${clean}.`;
  }
  return `Given valid input(s), ${clean.charAt(0).toLowerCase()}${clean.slice(1)}.`;
}

function evaluateSnippet(prelude, snippet) {
  const logs = [];
  const context = {
    console: {
      log: (...args) => {
        if (args.length === 1) {
          logs.push(args[0]);
        } else {
          logs.push(args);
        }
      },
    },
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    Date,
    Math,
    Map,
    Set,
    Array,
    Number,
    String,
    Boolean,
    JSON,
  };

  vm.createContext(context);

  try {
    vm.runInContext(prelude, context);
    vm.runInContext(snippet, context);
  } catch (err) {
    return { ok: false, output: `Unable to evaluate sample: ${err.message}` };
  }

  return { ok: true, output: logs };
}

function extractQuickChecks(content) {
  const marker = "// =========================\n// Quick Usage Checks\n// =========================";
  const idx = content.indexOf(marker);
  if (idx === -1) {
    return { prelude: content, quick: "" };
  }

  return {
    prelude: content.slice(0, idx),
    quick: content.slice(idx),
  };
}

function getSpecialSnippet(problemTitle, quickSection) {
  const specialMatchers = [
    {
      key: "Detect cycle in singly linked list",
      regex: /const cycleA[\s\S]*?console\.log\(hasCycle\(cycleA\)\);/,
    },
    {
      key: "Support insert/search by prefix sharing",
      regex: /const trie[\s\S]*?console\.log\(trie\.search\("car"\)\);/,
    },
    {
      key: "Maintain disjoint sets with fast union/find",
      regex: /const uf[\s\S]*?console\.log\(uf\.find\(2\)\);/,
    },
    {
      key: "Tree traversals and common tree utilities",
      regex: /const root[\s\S]*?console\.log\(isBalanced\(root\)\);/,
    },
    {
      key: "Per-key rate limiter with token bucket",
      regex: /const limiter[\s\S]*?console\.log\(limiter\("user-1"\)\);/,
    },
  ];

  const matched = specialMatchers.find((m) => problemTitle.includes(m.key));
  if (!matched) return "";

  const found = quickSection.match(matched.regex);
  return found ? found[0] : "";
}

function fallbackSnippetByProblem(problemTitle) {
  if (problemTitle.includes("Reverse a singly linked list")) {
    return [
      "const ll = new LinkedList();",
      "ll.fromArray([1, 2, 3, 4]);",
      "ll.reverse();",
      "ll.print();",
    ].join("\n");
  }

  if (problemTitle.includes("Reverse nodes in groups of size k")) {
    return [
      "const kll = new LinkedListKGroup();",
      "kll.fromArray([1, 2, 3, 4, 5]);",
      "kll.reverseKGroup(2);",
      "kll.print();",
    ].join("\n");
  }

  if (problemTitle.includes("Check if destination is reachable from source in graph")) {
    return 'console.log(checkAccessiblitiy("A", "D", ["A", "B", "C", "D"], [["A", "B"], ["B", "C"], ["C", "D"]]));';
  }

  return "";
}

function getSampleSnippet(problem, quickSection) {
  const special = getSpecialSnippet(problem.title, quickSection);
  if (special) return special;

  const symbols = problem.symbols || [];
  for (const symbol of symbols) {
    const singleLineRegex = new RegExp(`console\\.log\\(${symbol}\\([^\\n]*\\);`);
    const lineMatch = quickSection.match(singleLineRegex);
    if (lineMatch) return lineMatch[0];
  }

  return fallbackSnippetByProblem(problem.title);
}

function parseProblemsFromSource(sourcePath) {
  const content = fs.readFileSync(sourcePath, "utf8");
  const { prelude, quick } = extractQuickChecks(content);

  const lines = prelude.split("\n");

  let currentSection = "Uncategorized";
  let i = 0;
  const problems = [];

  while (i < lines.length) {
    const line = lines[i].trim();

    const sectionMatch = line.match(/^\/\/\s+(Must Know|Medium|Advanced)\s+-\s+(.+)$/);
    if (sectionMatch) {
      currentSection = `${sectionMatch[1]} - ${sectionMatch[2]}`;
      i++;
      continue;
    }

    const problemMatch = line.match(/^\/\/\s+Problem:\s+(.+)$/);
    if (!problemMatch) {
      i++;
      continue;
    }

    const title = problemMatch[1].trim();
    let steps = "";

    if (i + 1 < lines.length) {
      const stepMatch = lines[i + 1].trim().match(/^\/\/\s+Steps:\s+(.+)$/);
      if (stepMatch) {
        steps = stepMatch[1].trim();
      }
    }

    const codeStart = i + (steps ? 2 : 1);
    let codeEnd = codeStart;

    while (codeEnd < lines.length) {
      const nextTrimmed = lines[codeEnd].trim();
      if (nextTrimmed.match(/^\/\/\s+Problem:\s+/)) break;
      if (nextTrimmed.match(/^\/\/\s+(Must Know|Medium|Advanced)\s+-\s+/)) break;
      codeEnd++;
    }

    const code = lines.slice(codeStart, codeEnd).join("\n").trim();
    const symbols = getPrimarySymbols(code);

    problems.push({
      id: problems.length + 1,
      section: currentSection,
      title,
      statement: inferStatement(title),
      approach: steps,
      code,
      symbols,
    });

    i = codeEnd;
  }

  const enriched = problems.map((problem) => {
    const sampleSnippet = getSampleSnippet(problem, quick);

    if (!sampleSnippet) {
      return {
        ...problem,
        sample: {
          input: "Sample unavailable",
          output: "Add a quick usage check in source to auto-generate output",
        },
      };
    }

    const evalResult = evaluateSnippet(prelude, sampleSnippet);
    const output = evalResult.ok ? evalResult.output : [evalResult.output];

    return {
      ...problem,
      sample: {
        input: sampleSnippet,
        output,
      },
    };
  });

  return {
    sourceFile: path.basename(sourcePath),
    totalProblems: enriched.length,
    sections: [...new Set(enriched.map((p) => p.section))],
    problems: enriched,
  };
}

function getProblems() {
  const sourcePath = path.resolve(__dirname, "../../data/MAIN DSA QUESTIONS.js");
  return parseProblemsFromSource(sourcePath);
}

module.exports = { getProblems };
