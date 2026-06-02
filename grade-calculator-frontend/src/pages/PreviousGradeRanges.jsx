import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function PreviousGradeRanges() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("custom");
  const [customCourseCode, setCustomCourseCode] = useState("");
  const [customCourseName, setCustomCourseName] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [allFaculties, setAllFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [facultySearchQuery, setFacultySearchQuery] = useState("");
  const [showFacultySuggestions, setShowFacultySuggestions] = useState(false);
  const [gradeRanges, setGradeRanges] = useState({
    S: "",
    A: "",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
  });
  const [showcase, setShowcase] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchShowcase();
    fetchAllFaculties();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get("/courses");
      setCourses(response.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchAllFaculties = async () => {
    try {
      const response = await API.get("/previous-grade-ranges/all-faculties");
      setAllFaculties(response.data);
    } catch (err) {
      console.error("Error fetching global faculty list:", err);
    }
  };

  const fetchShowcase = async () => {
    try {
      const response = await API.get("/previous-grade-ranges");
      setShowcase(response.data);
    } catch (err) {
      console.error("Error fetching showcase:", err);
    }
  };

  const handleCourseChange = async (e) => {
    const courseCode = e.target.value;
    setSelectedCourse(courseCode);
    setCustomCourseCode("");
    setCustomCourseName("");
    setSelectedFaculty("");
    setFacultySearchQuery("");
    setFaculties([]);

    if (courseCode && courseCode !== "custom") {
      try {
        const res = await API.get(`/slots/${courseCode}`);
        // Extract unique faculties across all slots for this course
        const uniqueFaculties = [];
        res.data.forEach((slot) => {
          slot.faculties.forEach((fac) => {
            if (!uniqueFaculties.includes(fac)) {
              uniqueFaculties.push(fac);
            }
          });
        });
        setFaculties(uniqueFaculties);
      } catch (err) {
        console.error("Error fetching faculties for course:", err);
      }
    }
  };

  const handleGradeChange = (grade, value) => {
    setGradeRanges((prev) => ({
      ...prev,
      [grade]: value,
    }));
  };

  const handleSelectFaculty = (facName) => {
    setFacultySearchQuery(facName);
    setSelectedFaculty(facName);
    setShowFacultySuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const courseCodeToSubmit = selectedCourse === "custom" ? customCourseCode.trim() : selectedCourse;
    let courseNameToSubmit = "";
    if (selectedCourse === "custom") {
      courseNameToSubmit = customCourseName.trim();
    } else {
      const courseObj = courses.find((c) => c.courseCode === selectedCourse);
      courseNameToSubmit = courseObj ? courseObj.courseName : "";
    }

    if (!courseCodeToSubmit) {
      alert("Please select or enter a course code");
      return;
    }
    if (!courseNameToSubmit) {
      alert("Please select or enter a subject name");
      return;
    }
    if (!selectedFaculty.trim()) {
      alert("Please select or enter a faculty");
      return;
    }

    const grades = ["S", "A", "B", "C", "D", "E", "F"];
    for (const g of grades) {
      if (!gradeRanges[g].trim()) {
        alert(`Please fill in the range for Grade ${g}`);
        return;
      }
    }

    setLoading(true);
    try {
      await API.post("/previous-grade-ranges", {
        courseCode: courseCodeToSubmit,
        courseName: courseNameToSubmit,
        facultyName: selectedFaculty,
        gradeRanges,
      });

      alert("Grade ranges uploaded successfully!");
      // Reset form
      setSelectedCourse("custom");
      setCustomCourseCode("");
      setCustomCourseName("");
      setSelectedFaculty("");
      setFacultySearchQuery("");
      setFaculties([]);
      setGradeRanges({ S: "", A: "", B: "", C: "", D: "", E: "", F: "" });
      // Refresh list
      fetchShowcase();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Error uploading grade ranges";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculties = allFaculties.filter((fac) => {
    if (!facultySearchQuery.trim() && faculties.length > 0) {
      return faculties.includes(fac);
    }
    return fac.toLowerCase().includes(facultySearchQuery.toLowerCase());
  }).slice(0, 10);

  return (
    <div className="tangy-wrapper">
      <div className="tangy-container">
        <header className="page-header">
          <h2>Previous <span className="highlight">Grade Ranges</span></h2>
          <button className="btn-retro-secondary" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </header>

        {/* How to Use Notice */}
        <div className="retro-card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-header-strip color-alt">📌 HOW TO USE</div>
          <div className="card-body" style={{ padding: "1.5rem" }}>
            <ol style={{ margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8", fontWeight: "600", fontSize: "0.95rem" }}>
              <li>Search the faculty, enter the subject and course code they used to teach</li>
              <li>This will help you to gauge what is the usual average of their class (Strict, lenient etc)</li>
              <li>The grades vary subject to subject based on paper/subject difficulty but its still helpful</li>
            </ol>
          </div>
        </div>

        {/* Upload Form */}
        <div className="retro-card" style={{ marginBottom: "2.5rem", overflow: "visible" }}>
          <div className="card-header-strip">UPLOAD HISTORICAL GRADE RANGES</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="input-group">
                  <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>Select Course</label>
                  <select
                    className="retro-select"
                    value={selectedCourse}
                    onChange={handleCourseChange}
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.courseCode} value={c.courseCode}>
                        {c.courseName} ({c.courseCode})
                      </option>
                    ))}
                    <option value="custom">-- Type Custom Course Code --</option>
                  </select>
                </div>

                <div className="input-group" style={{ position: "relative" }}>
                  <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>Search/Select Faculty</label>
                  <input
                    type="text"
                    className="retro-input"
                    placeholder="Type faculty name..."
                    value={facultySearchQuery}
                    onChange={(e) => {
                      setFacultySearchQuery(e.target.value);
                      setSelectedFaculty(e.target.value);
                    }}
                    onFocus={() => setShowFacultySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFacultySuggestions(false), 200)}
                  />
                  {showFacultySuggestions && filteredFaculties.length > 0 && (
                    <ul className="suggestions-list">
                      {filteredFaculties.map((fac) => (
                        <li
                          key={fac}
                          onMouseDown={() => handleSelectFaculty(fac)}
                          className="suggestion-item"
                        >
                          {fac}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {selectedCourse === "custom" && (
                <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="input-group">
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>Enter Custom Course Code</label>
                    <input
                      type="text"
                      className="retro-input"
                      placeholder="e.g. CSE1001"
                      value={customCourseCode}
                      onChange={(e) => setCustomCourseCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>Enter Subject Name</label>
                    <input
                      type="text"
                      className="retro-input"
                      placeholder="e.g. Python Programming"
                      value={customCourseName}
                      onChange={(e) => setCustomCourseName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="divider-dashed"></div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "15px" }}>Grade Ranges Details (e.g. "&gt;= 90", "80-89")</h3>

              <div className="grid-3" style={{ gap: "12px", marginBottom: "20px" }}>
                {["S", "A", "B", "C", "D", "E", "F"].map((g) => (
                  <div key={g} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="retro-badge lg" style={{ minWidth: "30px", textAlign: "center" }}>{g}</span>
                    <input
                      type="text"
                      className="retro-input"
                      style={{ margin: 0 }}
                      placeholder="e.g. >= 90"
                      value={gradeRanges[g]}
                      onChange={(e) => handleGradeChange(g, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-retro-primary full-width" disabled={loading}>
                {loading ? "Uploading..." : "Upload Grade Ranges"}
              </button>
            </form>
          </div>
        </div>

        {/* Showcase Section */}
        <div className="retro-card">
          <div className="card-header-strip color-alt">SHOWCASE OF PREVIOUS GRADE RANGES</div>
          <div className="card-body">
            {showcase.length === 0 ? (
              <p style={{ textAlign: "center", fontStyle: "italic", margin: "20px 0" }}>
                No historical grade ranges have been uploaded yet. Be the first to share!
              </p>
            ) : (
              <div className="table-wrapper">
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Subject Name</th>
                      <th>Faculty</th>
                      <th>S</th>
                      <th>A</th>
                      <th>B</th>
                      <th>C</th>
                      <th>D</th>
                      <th>E</th>
                      <th>F</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showcase.map((item) => (
                      <tr key={item._id}>
                        <td><strong>{item.courseCode}</strong></td>
                        <td>{item.courseName}</td>
                        <td>{item.facultyName}</td>
                        <td><span className="highlight-bg" style={{ background: "var(--tangy-orange)", color: "black", fontSize: "0.85rem" }}>{item.gradeRanges?.S}</span></td>
                        <td>{item.gradeRanges?.A}</td>
                        <td>{item.gradeRanges?.B}</td>
                        <td>{item.gradeRanges?.C}</td>
                        <td>{item.gradeRanges?.D}</td>
                        <td>{item.gradeRanges?.E}</td>
                        <td><span className="retro-badge" style={{ background: "var(--alert-red)", fontSize: "0.85rem" }}>{item.gradeRanges?.F}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--pure-white);
          border: var(--border-thick);
          box-shadow: var(--shadow-hard);
          border-radius: var(--radius);
          max-height: 200px;
          overflow-y: auto;
          z-index: 10;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .suggestion-item {
          padding: 10px 12px;
          cursor: pointer;
          font-weight: 500;
          border-bottom: 1px dashed var(--soft-grey);
          color: var(--dark-ink);
          text-align: left;
        }
        .suggestion-item:last-child {
          border-bottom: none;
        }
        .suggestion-item:hover {
          background-color: var(--bg-cream);
        }
      `}</style>
    </div>
  );
}

export default PreviousGradeRanges;
