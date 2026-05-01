import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:4000/api/problems";

function formatOutput(output) {
  if (!Array.isArray(output)) return String(output);
  if (output.length === 0) return "(no output)";
  return output.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join("\n");
}

function ProblemCard({ problem }) {
  return (
    <article className="card">
      <div className="card-tag">{problem.section}</div>
      <h3>{problem.title}</h3>
      <p className="statement">{problem.statement}</p>

      <div className="subhead">Approach</div>
      <p>{problem.approach || "Approach description unavailable."}</p>

      <div className="subhead">Complete Code</div>
      <pre><code>{problem.code || "Code not found"}</code></pre>

      <div className="grid-2">
        <div>
          <div className="subhead">Sample Input</div>
          <pre><code>{problem.sample?.input || "N/A"}</code></pre>
        </div>
        <div>
          <div className="subhead">Sample Output</div>
          <pre><code>{formatOutput(problem.sample?.output)}</code></pre>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  const filteredProblems = useMemo(() => {
    if (!data?.problems) return [];

    return data.problems.filter((p) => {
      const sectionMatch = selectedSection === "All" || p.section === selectedSection;
      const q = query.trim().toLowerCase();
      const queryMatch =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        p.statement.toLowerCase().includes(q) ||
        (p.approach || "").toLowerCase().includes(q);

      return sectionMatch && queryMatch;
    });
  }, [data, selectedSection, query]);

  if (error) {
    return <main className="app"><div className="error">Failed to load data: {error}</div></main>;
  }

  if (!data) {
    return <main className="app"><div className="loading">Loading DSA problem bank...</div></main>;
  }

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">React + Node.js Interview Library</p>
          <h1>DSA Interview Atlas</h1>
          <p className="muted">
            Full problem statements, solution explanations, complete code, and runnable sample input/output.
          </p>
          <div className="stats">
            <span><strong>{data.totalProblems}</strong> Problems</span>
            <span><strong>{data.sections.length}</strong> Tracks</span>
            <span><strong>{data.sourceFile}</strong></span>
          </div>
        </div>
      </header>

      <section className="controls">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by topic, statement, or approach"
        />

        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
          <option value="All">All Tracks</option>
          {data.sections.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      <section className="list">
        {filteredProblems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </section>
    </main>
  );
}
