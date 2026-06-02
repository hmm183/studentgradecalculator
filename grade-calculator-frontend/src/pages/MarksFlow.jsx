import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const decodeToken = (token) => {
  try {
    const base64UrlDecode = (str) => {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) {
        str += '=';
      }
      return atob(str);
    };
    const payload = JSON.parse(base64UrlDecode(token.split(".")[1]));
    return payload;
  } catch (e) {
    return null;
  }
};

function MarksFlow() {
  const [courses, setCourses] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [marks, setMarks] = useState({
    studentEmail: "",
    cat1: "",
    cat2: "",
    internals: "",
    theoryFat: "",
    labInternals: "",
    labFat: "",
    projectMarks: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = token ? decodeToken(token) : null;
  const isAdmin = decoded && decoded.role === "admin";

  useEffect(() => {
    fetchCourses();
    fetchCurrentUser();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get("/courses");
      setCourses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async (courseCode) => {
    try {
      const res = await API.get(`/slots/${courseCode}`);
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await API.get("/user/me");
      setMarks((prevMarks) => ({ ...prevMarks, studentEmail: response.data.email }));
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const handleCourseChange = (e) => {
    const courseCode = e.target.value;
    setSelectedCourse(courseCode);
    setSelectedSlot("");
    setSelectedFaculty("");
    if (courseCode) {
      fetchSlots(courseCode);
    } else {
      setSlots([]);
    }
  };

  const handleSlotChange = (e) => {
    setSelectedSlot(e.target.value);
    setSelectedFaculty("");
  };

  const handleChange = (e) => {
    setMarks({ ...marks, [e.target.name]: e.target.value });
  };

  const validateMarks = () => {
    const course = courses.find((c) => c.courseCode === selectedCourse);
    if (!marks.studentEmail) {
      alert("Enter student email");
      return false;
    }
    if (!marks.cat1 || marks.cat1 < 0 || marks.cat1 > 50) {
      alert("Enter CAT1 marks (0-50)");
      return false;
    }
    if (!marks.cat2 || marks.cat2 < 0 || marks.cat2 > 50) {
      alert("Enter CAT2 marks (0-50)");
      return false;
    }
    if (!marks.internals || marks.internals < 0 || marks.internals > 30) {
      alert("Enter internals marks (0-30)");
      return false;
    }
    if (!marks.theoryFat || marks.theoryFat < 0 || marks.theoryFat > 100) {
      alert("Enter theory FAT marks (0-100)");
      return false;
    }
    if (course.hasLab) {
      if (!marks.labInternals || marks.labInternals < 0 || marks.labInternals > 60) {
        alert("Enter lab internals marks (0-60)");
        return false;
      }
      if (!marks.labFat || marks.labFat < 0 || marks.labFat > 50) {
        alert("Enter lab FAT marks (0-50)");
        return false;
      }
    }
    if (
      course.hasProject &&
      (!marks.projectMarks || marks.projectMarks < 0 || marks.projectMarks > 100)
    ) {
      alert("Enter project marks (0-100)");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateMarks()) return;

    const course = courses.find((c) => c.courseCode === selectedCourse);
    try {
      await API.post("/marks/submit", {
        studentEmail: marks.studentEmail,
        courseCode: course.courseCode,
        slot: selectedSlot,
        faculty: selectedFaculty,
        cat1: Number(marks.cat1),
        cat2: Number(marks.cat2),
        internals: Number(marks.internals),
        theoryFat: Number(marks.theoryFat),
        labInternals: course.hasLab ? Number(marks.labInternals) : undefined,
        labFat: course.hasLab ? Number(marks.labFat) : undefined,
        projectMarks: course.hasProject ? Number(marks.projectMarks) : undefined,
      });
      alert("Marks submitted successfully");
      navigate("/dashboard");
    } catch (err) {
      alert("Cannot Submit marks for any other faculty");
    }
  };

  const course = courses.find((c) => c.courseCode === selectedCourse);

  return (
    <div className="tangy-wrapper">
      <div className="tangy-container">
        <h2 className="section-title">MARKS ENTRY</h2>
        {isAdmin && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button className="btn-retro-secondary" onClick={() => navigate("/admin")}>
              Admin Panel
            </button>
          </div>
        )}
        <div className="retro-card">
          <div className="card-body">
            {/* Selections */}
            <div className="grid-3">
              <div className="input-group">
                <label>Select Course</label>
                <select className="retro-select" value={selectedCourse} onChange={handleCourseChange}>
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.courseCode} value={course.courseCode}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourse && (
                <div className="input-group">
                  <label>Select Slot</label>
                  <select className="retro-select" value={selectedSlot} onChange={handleSlotChange}>
                    <option value="">Select Slot</option>
                    {slots.map((s) => (
                      <option key={s.slotName} value={s.slotName}>
                        {s.slotName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedSlot && (
                <div className="input-group">
                  <label>Select Faculty</label>
                  <select
                    className="retro-select"
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                  >
                    <option value="">Select Faculty</option>
                    {slots
                      .find((s) => s.slotName === selectedSlot)
                      ?.faculties.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {selectedFaculty && (
              <div className="marks-form-area">
                <div className="divider-dashed"></div>
                <h3>Entry For: <span className="highlight-bg">{course?.courseName}</span></h3>
                <p className="student-id-display">STUDENT: {marks.studentEmail}</p>

                <div className="grid-2">
                  <input
                    className="retro-input"
                    name="cat1"
                    type="number"
                    placeholder="CAT 1 (Max 50)"
                    value={marks.cat1}
                    onChange={handleChange}
                  />
                  <input
                    className="retro-input"
                    name="cat2"
                    type="number"
                    placeholder="CAT 2 (Max 50)"
                    value={marks.cat2}
                    onChange={handleChange}
                  />
                  <input
                    className="retro-input"
                    name="internals"
                    type="number"
                    placeholder="Internals (Max 30)"
                    value={marks.internals}
                    onChange={handleChange}
                  />
                  <input
                    className="retro-input"
                    name="theoryFat"
                    type="number"
                    placeholder="Theory FAT (Max 100)"
                    value={marks.theoryFat}
                    onChange={handleChange}
                  />

                  {course?.hasLab && (
                    <>
                      <input
                        className="retro-input"
                        name="labInternals"
                        type="number"
                        placeholder="Lab Internals (Max 60)"
                        value={marks.labInternals}
                        onChange={handleChange}
                      />
                      <input
                        className="retro-input"
                        name="labFat"
                        type="number"
                        placeholder="Lab FAT (Max 50)"
                        value={marks.labFat}
                        onChange={handleChange}
                      />
                    </>
                  )}
                  {course?.hasProject && (
                    <div className="full-width">
                      <input
                        className="retro-input"
                        name="projectMarks"
                        type="number"
                        placeholder="Project Marks (Max 100)"
                        value={marks.projectMarks}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
                <button className="btn-retro-primary full-width" style={{marginTop: "20px"}} onClick={handleSubmit}>
                  SUBMIT MARKS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarksFlow;