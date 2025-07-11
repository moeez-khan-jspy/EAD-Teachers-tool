import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Assuming your constants are set up correctly
// import { API_ENDPOINTS, POST_CONFIG } from '../const_api';
import './Terms.css';

import { API_ENDPOINTS, POST_CONFIG } from '../const_api';

// Register Font for PDF (No changes needed here)
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

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#000000' },
  section: { margin: 10 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 30, color: '#1a2a4d' },
  content: { fontSize: 12, lineHeight: 1.5, textAlign: 'justify' }
});

// PDF Document Component (No changes needed here)
const PDFDocument = ({ data }) => {
  const sourcesText = data.terms[0]?.sources?.length > 0
    ? `\n\nSources:\n${data.terms[0].sources.map((source, index) => `${index + 1}. ${source}`).join('\n')}`
    : '';

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.title}>{data.title}</Text>
          <Text style={pdfStyles.content}>
            {data.terms[0]?.content?.replace(/<[^>]*>/g, '') || ''}
            {sourcesText}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const Terms = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [termPlan, setTermPlan] = useState({
    response: '',
    sources: []
  });
  const [showResultPopup, setShowResultPopup] = useState(false);
  
  // Form states
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [query, setQuery] = useState('');
  
  // API Key Modal states
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  
  useEffect(() => {
    const shouldShowModal = localStorage.getItem('showApiKeyModal') === 'true';
    const hasApiKey = localStorage.getItem('groqApiKey');
    
    if (shouldShowModal && !hasApiKey) {
      setShowApiKeyModal(true);
      localStorage.removeItem('showApiKeyModal');
    }
  }, []);
  
  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    setApiKeyError('');
    if (!apiKey.trim()) {
      setApiKeyError('Please enter your GROQ API key');
      return;
    }
    setApiKeyLoading(true);
    setTimeout(() => {
      localStorage.setItem('groqApiKey', apiKey.trim());
      setApiKeyLoading(false);
      setShowApiKeyModal(false);
    }, 800);
  };
  
  const handleSkipApiKey = () => {
    setShowApiKeyModal(false);
  };

  const curriculumOptions = [
    { id: 'ontario', name: 'Ontario Curriculum' },
    { id: 'british_columbia', name: 'British Columbia Curriculum' }
    
  ];

  const subjectOptions = [
    { id: 'english', name: 'English' },
    { id: 'maths', name: 'Mathematics' },
    { id: 'science', name: 'Science' }
  
  ];

  const gradeOptions = [2, 3, 4, 5];

  const handleGeneratePlan = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setTermPlan({ response: '', sources: [] });
    try {
      const payload = {
        curriculum: selectedCurriculum,
        subject: selectedSubject,
        grade: String(selectedGrade),
        query: query,
        top_k: 5
      };
      console.log('Sending payload:', payload);
      const response = await fetch(API_ENDPOINTS.TERMS_PLAN, {
        ...POST_CONFIG,
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      if (data && typeof data.response === 'string' && Array.isArray(data.sources)) {
        console.log('Processed data:', {
          response: data.response,
          sources: data.sources,
          collection_used: data.collection_used || ''
        });
        setTermPlan({
          response: data.response,
          sources: data.sources,
          collection_used: data.collection_used || ''
        });
        setPdfData({
          title: `${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} - Grade ${selectedGrade}`,
          terms: [{ content: data.response, sources: data.sources }]
        });
        setShowResultPopup(true);
      } else {
        setError('No data returned from backend.');
        console.error('Unexpected API response shape:', data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch data from backend.');
      console.error('API request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {showApiKeyModal && (
        <div className="popup-overlay">
          <div className="popup-content api-key-modal">
            <h2 className="popup-title">API Key Required</h2>
            <p className="popup-description">Please enter your GROQ API key to proceed.</p>
            <form onSubmit={handleApiKeySubmit} className="api-key-form">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="form-input"
              />
              {apiKeyError && <p className="error-message">{apiKeyError}</p>}
              <div className="button-group">
                <button type="button" onClick={handleSkipApiKey} className="btn btn-secondary">
                  Skip For Now
                </button>
                <button type="submit" disabled={apiKeyLoading} className="btn btn-primary">
                  {apiKeyLoading ? 'Validating...' : 'Save Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showResultPopup && (
        <div className="popup-overlay">
          <div className="popup-content result-popup">
            <div className="popup-header">
              <h2 className="popup-title">Generated Curriculum Plan</h2>
              <button className="close-popup" onClick={() => setShowResultPopup(false)}>
                ×
              </button>
            </div>
            <div className="popup-body">
                <div className="pdf-download-wrapper">
                  {pdfData && (
                    <PDFDownloadLink
                      document={<PDFDocument data={pdfData} />}
                      fileName="curriculum_plan.pdf"
                      className="btn btn-secondary"
                    >
                      {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
                    </PDFDownloadLink>
                  )}
                </div>
              
              <div className="scroll-container">
                {termPlan.response ? (
                  <>
                    {termPlan.collection_used && (
                      <div className="collection-used-info">
                        <strong>Collection Used:</strong> {termPlan.collection_used}
                      </div>
                    )}
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {termPlan.response}
                      </ReactMarkdown>
                    </div>
                    {termPlan.sources && termPlan.sources.length > 0 && (
                      <div className="sources-container">
                        <h3>Sources</h3>
                        <ul>
                          {termPlan.sources.map((source, index) => (
                            <li key={index}>
                              <span>{typeof source === 'object' && source !== null ? source.text : String(source)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Generating your plan...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="generator-container">
        <div className="generator-header">
          <h1>Curriculum Plan AI</h1>
          <p>Instantly generate term plans based on your curriculum needs.</p>
        </div>

        <form onSubmit={handleGeneratePlan} className="generator-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="curriculum">Curriculum</label>
              <select id="curriculum" value={selectedCurriculum} onChange={(e) => setSelectedCurriculum(e.target.value)} required className="form-select">
                <option value="" disabled>Select a curriculum</option>
                {curriculumOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select id="subject" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required className="form-select">
                <option value="" disabled>Select a subject</option>
                {subjectOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="grade">Grade</label>
              <select id="grade" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} required className="form-select">
                <option value="" disabled>Select a grade</option>
                {gradeOptions.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="query">Additional Notes (Optional)</label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Focus on project-based learning, include digital literacy..."
              rows="4"
              className="form-textarea"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Plan'}
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

export default Terms;