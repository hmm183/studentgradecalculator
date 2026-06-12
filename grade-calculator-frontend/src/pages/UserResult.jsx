import { useState, useEffect } from "react";
import axios from "../api/axios";
import NoData from "./NoData";

function UserResult() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchUserResults();
  }, []);

  const fetchUserResults = async () => {
    try {
      const res = await axios.get("/marks/user-results");
      setResults(res.data);
    } catch (err) {
      alert("Error fetching results");
    }
  };

  const groupedResults = Array.isArray(results) ? results.reduce((acc, result) => {
    const key = `${result.courseCode}-${result.slot}`;
    if (!acc[key]) {
      acc[key] = {
        courseCode: result.courseCode,
        courseName: result.courseName,
        slot: result.slot,
        faculty: result.faculty,
        gradeRanges: result.gradeRanges,
        entries: [],
      };
    }
    acc[key].entries.push(result);
    return acc;
  }, {}) : {};

  if (results.message || Object.keys(groupedResults).length === 0) {
    return <NoData message={results.message} />;
  }

  return (
    <div className="tangy-wrapper">
      <div className="tangy-container">
        <h2 className="section-title">YOUR REPORT CARD</h2>
        <div className="results-stack">
          {Object.keys(groupedResults).map((key) => {
            const group = groupedResults[key];
            return (
              <div key={key} className="retro-card result-panel">
                <div className="card-header-strip color-dark">
                  {group.courseName} <span className="slot-pill">{group.slot}</span>
                </div>
                <div className="card-body">
                  <p className="faculty-label">👨‍🏫 {group.faculty}</p>

                  <table className="retro-table mini-table">
                    <thead>
                      <tr>
                        <th>Total Score</th>
                        <th>Grade Received</th>
                        <th>No. of students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((r, index) => (
                        <tr key={index}>
                          <td>{r.pending ? (r.total ? r.total.toFixed(2) : "Result is pending") : r.total.toFixed(2)}</td>
                          <td>{r.pending ? "Result is pending(min 7 students needed)" : <span className="retro-badge lg">{r.grade}</span>}</td>
                          <td>{r.userCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {group.entries.some(r => r.userCount < 25) && (
                    <div className="retro-warning-banner" style={{ marginTop: "1.5rem", marginBottom: "0rem" }}>
                      ⚠️ Warning: If the strength is less than 25, the grade calculation is not accurate.
                    </div>
                  )}

                  {group.gradeRanges && Object.keys(group.gradeRanges).length > 0 && (
                    <div className="grade-key-section">
                      <h4>Grading Key</h4>
                      <div className="key-grid">
                        {Object.entries(group.gradeRanges).map(([grade, range]) => (
                          <div key={grade} className="key-item">
                            <span className="key-grade">{grade}</span>
                            <span className="key-range">{range}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UserResult;