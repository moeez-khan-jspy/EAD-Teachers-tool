import React, { useState, useCallback, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { modelConfig, updateApiKey } from '../cont_model';
import { SYSTEM_PROMPT, generateUserPrompt } from './prompts';
import './TeacherAssistant.css';

const TeacherAssistant = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  
  // State to control the results popup
  const [showResultPopup, setShowResultPopup] = useState(false);

  // Check if API key exists when component loads
  useEffect(() => {
    const apiKey = localStorage.getItem('groqApiKey');
    if (!apiKey || apiKey.trim() === '') {
      localStorage.setItem('showApiKeyModal', 'true');
    } else {
      updateApiKey(apiKey);
    }
  }, []);

  // Cleanup speech synthesis on unmount or when popup closes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis && isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, [isSpeaking, showResultPopup]);

  const handleSpeak = useCallback(() => {
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    if (answer && synth) {
      const plainText = new DOMParser().parseFromString(answer, 'text/html').body.textContent || '';
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError('Speech synthesis failed.');
      };
      synth.speak(utterance);
      setIsSpeaking(true);
    }
  }, [answer, isSpeaking]);

  const handleVoiceInput = () => {
    setIsVoiceInput(true);
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setIsVoiceInput(false);
    };
    recognition.start();
  };
  
  const generateResponse = async (userPrompt) => {
    const apiKey = localStorage.getItem('groqApiKey');
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is missing');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: modelConfig.temperature
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response');
    }
    return data.choices[0].message.content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCurriculum || !selectedSubject || !selectedGrade) {
      setError('Please select curriculum, subject, and grade before asking a question.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');
    setShowResultPopup(false);

    try {
      const userPrompt = generateUserPrompt(selectedSubject, selectedGrade, selectedCurriculum, question);
      const response = await generateResponse(userPrompt);
      
      if (response) {
        const sanitizedAnswer = DOMPurify.sanitize(response, { USE_PROFILES: { html: true } });
        setAnswer(sanitizedAnswer);
        setShowResultPopup(true);
      } else {
        throw new Error("Received an empty response from the AI.");
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {showResultPopup && (
        <div className="popup-overlay">
          <div className="popup-content result-popup">
            <div className="popup-header">
              <h2 className="popup-title">Assistant's Response</h2>
              <button className="close-popup" onClick={() => setShowResultPopup(false)}>×</button>
            </div>
            <div className="popup-body">
              <div className="action-bar">
                <button onClick={handleSpeak} className="btn btn-secondary">
                  {isSpeaking ? "Stop Speaking" : "Listen to Response"}
                </button>
              </div>
              <div className="scroll-container">
                <div className="answer-content" dangerouslySetInnerHTML={{ __html: answer }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="generator-container">
        <div className="generator-header">
          <h1>Teacher Assistant</h1>
          <p>Get instant help with lesson planning, teaching strategies, and educational resources.</p>
        </div>

        <form onSubmit={handleSubmit} className="generator-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="curriculum">Curriculum</label>
              <select id="curriculum" value={selectedCurriculum} onChange={(e) => setSelectedCurriculum(e.target.value)} required className="form-select">
                <option value="" disabled>Choose Curriculum</option>
                <option value="ontario">Ontario</option>
                <option value="common_core">Common Core</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select id="subject" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required className="form-select">
                <option value="" disabled>Choose Subject</option>
                <option value="math">Mathematics</option>
                <option value="english">English</option>
                <option value="science">Science</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="grade">Grade</label>
              <select id="grade" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} required className="form-select">
                <option value="" disabled>Choose Grade</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="question">Your Question</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., 'Suggest a fun activity to teach fractions...'"
              required
              rows="4"
              className="form-textarea"
              disabled={isVoiceInput}
            />
          </div>
          
          <div className="button-group">
            <button type="button" onClick={handleVoiceInput} className="btn btn-secondary" disabled={loading}>
              {isVoiceInput ? 'Listening...' : 'Ask by Voice'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !question}>
              {loading ? 'Thinking...' : 'Get Answer'}
            </button>
          </div>
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

export default TeacherAssistant;