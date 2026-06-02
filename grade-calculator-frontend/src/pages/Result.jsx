import { useState, useEffect } from "react";
import axios from "../api/axios";
import NoData from "./NoData";

function Result() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [courses, setCourses] = useState([]);
  const [slots, setSlots] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courseMap, setCourseMap] = useState({});

  useEffect(() => {
    fetchAllResults();
  }, []);

  // Remove automatic filtering

  const fetchAllResults = async () => {
    try {
      const res = await axios.get("/marks/all-results");
      if (Array.isArray(res.data)) {
        setResults(res.data);
        // Extract unique values
        const uniqueCourses = [...new Set(res.data.map(r => r.courseName || r.courseCode))];
        const uniqueSlots = [...new Set(res.data.map(r => r.slot))];
        const uniqueFaculties = [...new Set(res.data.map(r => r.faculty))];
        setCourses(uniqueCourses);
        setSlots(uniqueSlots);
        setFaculties(uniqueFaculties);
        // Create course map for code to name
        const map = {};
        res.data.forEach(r => {
          if (r.courseName) map[r.courseCode] = r.courseName;
        });
        setCourseMap(map);
      } else {
        setResults(res.data);
        setCourses([]);
        setSlots([]);
        setFaculties([]);
      }
    } catch (err) {
      alert("Error fetching results");
    }
  };

  const handleCourseChange = (courseName) => {
    setSelectedCourse(courseName);
    setSelectedSlot("");
    setSelectedFaculty("");
    // Filter slots and faculties for the selected course
    const courseCode = Object.keys(courseMap).find(key => courseMap[key] === courseName);
    if (courseCode) {
      const courseResults = results.filter(r => r.courseCode === courseCode);
      const uniqueSlots = [...new Set(courseResults.map(r => r.slot))];
      const uniqueFaculties = [...new Set(courseResults.map(r => r.faculty))];
      setSlots(uniqueSlots);
      setFaculties(uniqueFaculties);
    } else {
      // All courses
      const uniqueSlots = [...new Set(results.map(r => r.slot))];
      const uniqueFaculties = [...new Set(results.map(r => r.faculty))];
      setSlots(uniqueSlots);
      setFaculties(uniqueFaculties);
    }
  };

  const handleSlotChange = (slot) => {
    setSelectedSlot(slot);
    setSelectedFaculty("");
    // Filter faculties for the selected course and slot
    const courseCode = Object.keys(courseMap).find(key => courseMap[key] === selectedCourse);
    if (courseCode) {
      const slotResults = results.filter(r => r.courseCode === courseCode && r.slot === slot);
      const uniqueFaculties = [...new Set(slotResults.map(r => r.faculty))];
      setFaculties(uniqueFaculties);
    }
  };

  const filterResults = () => {
    let filtered = results;
    if (selectedCourse) {
      const courseCode = Object.keys(courseMap).find(key => courseMap[key] === selectedCourse);
      if (courseCode) {
        filtered = filtered.filter(r => r.courseCode === courseCode);
      }
    }
    if (selectedSlot) {
      filtered = filtered.filter(r => r.slot === selectedSlot);
    }
    if (selectedFaculty) {
      filtered = filtered.filter(r => r.faculty === selectedFaculty);
    }
    setFilteredResults(filtered);

    // Calculate summary
    if (filtered.length > 0) {
      const totals = filtered.map(r => r.total);
      const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
      const std = Math.sqrt(totals.reduce((s, x) => s + (x - mean) ** 2, 0) / totals.length);
      const f = Math.ceil(mean - 2 * std);
      const e = Math.ceil(mean - 1.5 * std);
      const d = Math.ceil(mean - std);
      const c = Math.ceil(mean - 0.55 * std);
      const b = Math.ceil(mean + 0.45 * std);
      let threshold = mean + 1.2 * std;
      if (threshold > 100) threshold = 100;
      if (threshold < 81) threshold = 81;
      const sorted = [...totals].sort((a, b) => b - a);
      if (sorted.filter(x => x > threshold).length > 4) {
        threshold = sorted[3];
      }
      const gradeRanges = {
        S: `>= ${Math.ceil(threshold)}`,
        A: `${Math.ceil(b)} - ${Math.ceil(threshold) - 1}`,
        B: `${Math.ceil(c)} - ${Math.ceil(b) - 1}`,
        C: `${Math.ceil(d)} - ${Math.ceil(c) - 1}`,
        D: `${Math.ceil(e)} - ${Math.ceil(d) - 1}`,
        E: `${Math.ceil(f)} - ${Math.ceil(e) - 1}`,
        F: `< ${Math.ceil(f)}`
      };
      setSummary({
        totalStudents: filtered.length,
        faculty: selectedFaculty,
        course: selectedCourse,
        gradeRanges
      });
    } else {
      setSummary(null);
    }
  };

  return (
    <div className="tangy-wrapper">
      <div className="tangy-container">
        <h2 className="section-title">ALL RESULTS</h2>

        <div className="retro-card">
          <div className="card-body">
            <div className="grid-3">
              <div>
                <label>Course:</label>
                <select
                  className="retro-select"
                  value={selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Slot:</label>
                <select
                  className="retro-select"
                  value={selectedSlot}
                  onChange={(e) => handleSlotChange(e.target.value)}
                >
                  <option value="">All Slots</option>
                  {slots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Faculty:</label>
                <select
                  className="retro-select"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                >
                  <option value="">All Faculties</option>
                  {faculties.map(faculty => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-center">
              <button
                className="retro-btn"
                onClick={filterResults}
                disabled={!selectedCourse || !selectedSlot || !selectedFaculty}
              >
                View Results
              </button>
            </div>
            <div className="divider-dashed"></div>
            {results.message ? (
              <p>{results.message}</p>
            ) : (
              <>
                {summary && (
                  <div className="summary-section">
                    <h3>Summary</h3>
                    <p><strong>Total Students:</strong> {summary.totalStudents}</p>
                    <p><strong>Faculty:</strong> {summary.faculty}</p>
                    <p><strong>Course:</strong> {summary.course}</p>
                    <p><strong>Grade Ranges:</strong></p>
                    <ul>
                      {Object.entries(summary.gradeRanges).map(([grade, range]) => (
                        <li key={grade}><strong>{grade}:</strong> {range}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="table-wrapper">
                  <table className="retro-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Slot</th>
                        <th>Faculty</th>
                        <th>Total</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((r) => (
                        <tr key={`${r.email}-${r.courseCode}-${r.slot}`}>
                          <td>{r.email}</td>
                          <td>{r.courseName || r.courseCode}</td>
                          <td>{r.slot}</td>
                          <td>{r.faculty}</td>
                          <td>{r.total}</td>
                          <td><span className="retro-badge">{r.grade}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;