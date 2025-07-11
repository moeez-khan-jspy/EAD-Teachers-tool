import { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { API_ENDPOINTS, API_CONFIG } from '../const_api';
import './Lessonplan.css';

// Register Font for PDF
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' },
    {
      src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Reusable PDF Styles
const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#111827', fontSize: 11, lineHeight: 1.5 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 25, color: '#111827', fontWeight: 'bold' },
  planContainer: { marginBottom: 20, borderTop: '1px solid #E5E7EB', paddingTop: 15 },
  planTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#4F46E5' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, marginTop: 5, color: '#374151' },
  listItem: { flexDirection: 'row', marginBottom: 3, paddingLeft: 10 },
  bullet: { width: 15, textAlign: 'left' },
  listItemText: { flex: 1 },
  homeworkText: { fontStyle: 'italic', color: '#6B7280', paddingLeft: 10 },
});

// PDF Document Component
const PDFDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>{data.title}</Text>
      {data.lessonPlans.map((plan, index) => (
        <View key={index} style={pdfStyles.planContainer}>
          <Text style={pdfStyles.planTitle}>
            {plan.title || `Lesson ${index + 1}`}
            {plan.duration ? ` (${plan.duration})` : ''}
          </Text>
          
          {plan.objectives?.length > 0 && (
            <>
              <Text style={pdfStyles.sectionTitle}>Learning Objectives:</Text>
              {plan.objectives.map((obj, i) => (
                <View key={i} style={pdfStyles.listItem}>
                  <Text style={pdfStyles.bullet}>•</Text>
                  <Text style={pdfStyles.listItemText}>{obj}</Text>
                </View>
              ))}
            </>
          )}

          {plan.activities?.length > 0 && (
            <>
              <Text style={pdfStyles.sectionTitle}>Activities:</Text>
              {plan.activities.map((activity, i) => (
                <View key={i} style={pdfStyles.listItem}>
                  <Text style={pdfStyles.bullet}>{i + 1}.</Text>
                  <Text style={pdfStyles.listItemText}>{activity}</Text>
                </View>
              ))}
            </>
          )}

          {plan.homework && (
            <>
              <Text style={pdfStyles.sectionTitle}>Homework:</Text>
              <Text style={pdfStyles.homeworkText}>{plan.homework}</Text>
            </>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

const LessonPlan = () => {
  const [isPdfjsReady, setIsPdfjsReady] = useState(false);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [classDuration, setClassDuration] = useState('45 minutes');
  const [numberOfClasses, setNumberOfClasses] = useState(1);
  const [homeworkPreference, setHomeworkPreference] = useState('moderate');
  const [teachingStyle, setTeachingStyle] = useState('interactive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [title, setTitle] = useState('Generated Lesson Plan');

  // Check if PDF.js is loaded
  useEffect(() => {
    if (window.pdfjsLib) {
      setIsPdfjsReady(true);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const extractTextFromPDF = async (file) => {
    if (!isPdfjsReady) {
      throw new Error("PDF.js library is not ready. Please refresh the page.");
    }
    const { pdfjsLib } = window;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extracted = '';
    const numPagesToExtract = Math.min(10, pdf.numPages);
    for (let i = 1; i <= numPagesToExtract; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      extracted += content.items.map((item) => item.str).join(' ');
    }
    return extracted.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResultPopup(false);

    try {
      if (!pdfFile) throw new Error('Please upload a PDF syllabus file.');
      const syllabusData = await extractTextFromPDF(pdfFile);
      setTitle(`Lesson Plan for ${pdfFile.name.replace(/\.pdf$/, '')}`);

      // Prepare the request payload as per backend schema
      const payload = {
        class_duration: classDuration,
        homework_preference: homeworkPreference,
        num_classes: numberOfClasses,
        syllabus_data: syllabusData,
        teaching_style: teachingStyle
      };

      const response = await axios.post(
        API_ENDPOINTS.LESSON_PLAN,
        payload,
        API_CONFIG
      );
      if (!response.data.success) throw new Error("Failed to generate lesson plan.");
      if (!Array.isArray(response.data.lesson_plans)) throw new Error('Lesson plans not found in response.');

      setLessonPlans(response.data.lesson_plans);
      setShowResultPopup(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {showResultPopup && (
        <div className="popup-overlay">
          <div className="popup-content result-popup">
            <div className="popup-header">
              <h2 className="popup-title">Generated Lesson Plans</h2>
              <button className="close-popup" onClick={() => setShowResultPopup(false)}>×</button>
            </div>
            <div className="popup-body">
              <div className="pdf-download-wrapper">
                <PDFDownloadLink
                  document={<PDFDocument data={{ title, lessonPlans }} />}
                  fileName={`${title.replace(/\s+/g, '_')}.pdf`}
                  className="btn btn-secondary"
                >
                  {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
                </PDFDownloadLink>
              </div>
              <div className="scroll-container">
                {lessonPlans.map((plan, index) => (
                  <div key={index} className="result-card">
                    <div className="card-header">
                      <h3>{plan.title || `Lesson ${index + 1}`}</h3>
                      {plan.duration && <span className="duration-badge">{plan.duration}</span>}
                    </div>
                    <div className="card-body">
                      {plan.objectives?.length > 0 && (
                        <div className="card-section">
                          <h4>Learning Objectives</h4>
                          <ul>{plan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}</ul>
                        </div>
                      )}
                      {plan.activities?.length > 0 && (
                        <div className="card-section">
                          <h4>Activities</h4>
                          <ol>{plan.activities.map((act, i) => <li key={i}>{act}</li>)}</ol>
                        </div>
                      )}
                      {plan.homework && (
                        <div className="card-section">
                          <h4>Homework</h4>
                          <p>{plan.homework}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="generator-container">
        <div className="generator-header">
          <h1>Lesson Plan Generator</h1>
          <p>Upload a syllabus and set your preferences to create detailed lesson plans.</p>
        </div>

        <form onSubmit={handleSubmit} className="generator-form">
          <div className="form-group file-input-wrapper">
            <label htmlFor="pdf-upload">Upload Syllabus (PDF)</label>
            <input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} className="file-input-hidden" disabled={!isPdfjsReady} />
            <label htmlFor="pdf-upload" className={`file-input-label ${!isPdfjsReady ? 'disabled' : ''}`}>
              {isPdfjsReady ? (pdfFile ? pdfFile.name : "Choose a file...") : "PDF library loading..."}
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="numberOfClasses">Number of Classes ({numberOfClasses})</label>
            <input
              id="numberOfClasses"
              type="range"
              min="1"
              max="50"
              value={numberOfClasses}
              onChange={(e) => setNumberOfClasses(parseInt(e.target.value, 10))}
              className="form-range"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="classDuration">Class Duration</label>
              <select id="classDuration" value={classDuration} onChange={(e) => setClassDuration(e.target.value)} className="form-select">
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="60 minutes">60 minutes</option>
                <option value="90 minutes">90 minutes</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="teachingStyle">Teaching Style</label>
              <select id="teachingStyle" value={teachingStyle} onChange={(e) => setTeachingStyle(e.target.value)} className="form-select">
                <option value="interactive">Interactive</option>
                <option value="lecture">Lecture-based</option>
                <option value="project_based">Project-based</option>
                <option value="flipped_classroom">Flipped Classroom</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="homeworkPreference">Homework</label>
              <select id="homeworkPreference" value={homeworkPreference} onChange={(e) => setHomeworkPreference(e.target.value)} className="form-select">
                <option value="none">None</option>
                <option value="minimal">Minimal</option>
                <option value="moderate">Moderate</option>
                <option value="extensive">Extensive</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !pdfFile || !isPdfjsReady}>
            {loading ? 'Generating...' : 'Generate Lesson Plan'}
          </button>
        </form>

        {error && (
          <div className="error-message-inline">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlan;