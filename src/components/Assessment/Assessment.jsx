"use client";

import { useState } from "react";
import DownloadModal from "./DownloadModal";
import jsPDF from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import { getGroqModel } from '../cont_model';
import { MCQ_PROMPT, SHORT_ANSWER_PROMPT } from './prompts';
import "./Assessment.css";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Assessment = () => {
  // PDF generation handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth() - 20; // 10 margin each side
    let y = 15;
    doc.setFontSize(18);
    doc.text('Assessment', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    if (mcqs.length > 0) {
      doc.setFontSize(16);
      doc.text('Multiple Choice Questions', 10, y);
      y += 8;
      doc.setFontSize(12);
      mcqs.forEach((mcq, idx) => {
        const questionLines = doc.splitTextToSize(`${idx + 1}. ${mcq.question}`, pageWidth);
        doc.text(questionLines, 10, y);
        y += questionLines.length * 7;
        mcq.options.forEach((opt, i) => {
          const optionLines = doc.splitTextToSize(`   ${String.fromCharCode(65 + i)}) ${opt}`, pageWidth - 4);
          doc.text(optionLines, 14, y);
          y += optionLines.length * 6;
        });
        y += 2;
        if (y > 270) { doc.addPage(); y = 15; }
      });
      y += 4;
    }
    if (shortQuestions.length > 0) {
      doc.setFontSize(16);
      doc.text('Short Answer Questions', 10, y);
      y += 8;
      doc.setFontSize(12);
      shortQuestions.forEach((q, idx) => {
        const questionLines = doc.splitTextToSize(`${idx + 1}. ${q.question}`, pageWidth);
        doc.text(questionLines, 10, y);
        y += questionLines.length * 9;
        if (y > 270) { doc.addPage(); y = 15; }
      });
    }
    doc.save('assessment.pdf');
  };


  const [inputText, setInputText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [shortQuestions, setShortQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});
  const [shortAnswerFeedback, setShortAnswerFeedback] = useState({});
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState(["mcq", "short"]);

  const questionTypeOptions = [
    { id: "mcq", label: "Multiple Choice Questions" },
    { id: "short", label: "Short Answer Questions" },
  ];

  const handleQuestionTypeChange = (type) => {
    setSelectedQuestionTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const extractTextFromPdf = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + " ";
      }

      return fullText.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to read PDF content. Please try a different file.");
    }
  };

  const generateQuestions = async (text) => {
  const model = getGroqModel();
  if (!model) {
    setError("Groq API key not found. Please provide your API key in the settings or header.");
    return { mcqs: [], shortQuestions: [] };
  }
    try {
      let mcqsData = [];
      let shortData = [];

      if (selectedQuestionTypes.includes("mcq")) {
        const mcqPrompt = MCQ_PROMPT(text);
        console.log('Prompt sent to model:', mcqPrompt);

        const response = await model.call([
          { role: 'system', content: mcqPrompt },
          { role: 'user', content: 'Generate MCQs in the specified JSON format.' }
        ]);

        console.log('API response:', response);

        if (typeof response.content !== 'string') {
          throw new Error('Response content is not a string');
        }

        if (!response.content.trim()) {
          throw new Error('Response content is empty');
        }

        // Extract JSON from the response
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No valid JSON array found in the response');
        }

        const jsonStr = jsonMatch[0];
        console.log('Extracted JSON string:', jsonStr);

        try {
          mcqsData = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error('Error parsing MCQ JSON:', parseError);
          throw new Error('Failed to parse MCQ data');
        }

        if (!Array.isArray(mcqsData)) {
          throw new Error('Parsed MCQ data is not an array');
        }
      }

      if (selectedQuestionTypes.includes("short")) {
        const shortPrompt = SHORT_ANSWER_PROMPT(text);

        const shortResponse = await model.call([
          { role: 'system', content: shortPrompt },
          { role: 'user', content: 'Generate short answer questions in the specified JSON format.' }
        ]);

        console.log('Raw short answer response content:', shortResponse.content);

        if (typeof shortResponse.content !== 'string') {
          throw new Error('Short answer response content is not a string');
        }

        if (!shortResponse.content.trim()) {
          throw new Error('Short answer response content is empty');
        }

        // Extract JSON from the response
        const jsonMatch = shortResponse.content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No valid JSON array found in the short answer response');
        }

        const jsonStr = jsonMatch[0];
        console.log('Extracted short answer JSON string:', jsonStr);

        try {
          shortData = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error('Error parsing short answer JSON:', parseError);
          throw new Error('Failed to parse short answer data');
        }

        if (!Array.isArray(shortData)) {
          throw new Error('Parsed short answer data is not an array');
        }
      }

      return { mcqs: mcqsData, shortQuestions: shortData };
    } catch (err) {
      console.error("Error generating questions:", err);
      throw new Error("Failed to generate questions. Please try again.");
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setInputText("");
      setError(null);
    } else if (file) {
      setError("Please select a valid PDF file");
      setPdfFile(null);
    }
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    setPdfFile(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText && !pdfFile) {
      setError("Please enter text or upload a PDF file");
      return;
    }

    setLoading(true);
    setError(null);
    setMcqs([]);
    setShortQuestions([]);
    setSelectedAnswers({});
    setShortAnswers({});
    setShortAnswerFeedback({});

    try {
      let textContent = inputText;

      if (pdfFile) {
        textContent = await extractTextFromPdf(pdfFile);
        if (!textContent.trim()) {
          throw new Error("Could not extract text from PDF. Please try a different file.");
        }
      }

      const { mcqs: generatedMcqs, shortQuestions: generatedShort } = await generateQuestions(textContent);
      setMcqs(generatedMcqs);
      setShortQuestions(generatedShort);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMcqSelect = (questionId, answerIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleShortAnswerChange = (questionId, answer) => {
    setShortAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleShortAnswerSubmit = (question) => {
    const answer = shortAnswers[question.id];
    if (answer && answer.trim()) {
      validateShortAnswer(question.id, answer, question);
    }
  };

  const validateShortAnswer = async (questionId, userAnswer, question) => {
    setShortAnswerFeedback((prev) => ({
      ...prev,
      [questionId]: { loading: true }
    }));
    try {
      const model = getGroqModel();
      if (!model) {
        setShortAnswerFeedback((prev) => ({
          ...prev,
          [questionId]: { error: "Groq API key not found. Please provide your API key in the settings or header." }
        }));
        return;
      }
      // Prepare prompt for AI to check answer accuracy
      const prompt = `Given the following short answer question and a user's answer, provide a remark on accuracy, a score out of 100, and suggestions for improvement.\n\nQuestion: ${question.question}\nCorrect Answer: ${question.answer}\nUser's Answer: ${userAnswer}\n\nReply in JSON format with keys: score (number), feedback (string), keyPointsCovered (array of {point, quality}), keyPointsMissing (array of {point, importance}), misconceptions (array of string), suggestions (array of string).`;
      const response = await model.call([
        { role: 'system', content: prompt },
        { role: 'user', content: 'Evaluate the user answer and provide the JSON as described.' }
      ]);
      let parsed = null;
      if (typeof response.content === 'string') {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (err) {
            // fallback: try eval
            try {
              parsed = eval('(' + jsonMatch[0] + ')');
            } catch (e) {
              parsed = null;
            }
          }
        }
      }
      if (!parsed) {
        setShortAnswerFeedback((prev) => ({
          ...prev,
          [questionId]: { error: "AI response could not be parsed. Please try again." }
        }));
        return;
      }
      // Defensive: ensure all keys exist
      setShortAnswerFeedback((prev) => ({
        ...prev,
        [questionId]: {
          score: parsed.score ?? 0,
          feedback: parsed.feedback ?? '',
          keyPointsCovered: parsed.keyPointsCovered ?? [],
          keyPointsMissing: parsed.keyPointsMissing ?? [],
          misconceptions: parsed.misconceptions ?? [],
          suggestions: parsed.suggestions ?? [],
          error: null
        }
      }));
    } catch (err) {
      setShortAnswerFeedback((prev) => ({
        ...prev,
        [questionId]: { error: "Error validating answer: " + (err.message || err) }
      }));
    }
  };


  const getMcqScore = () => {
    if (!selectedQuestionTypes.includes("mcq") || mcqs.length === 0) return null;

    let correct = 0;
    Object.keys(selectedAnswers).forEach((id) => {
      const question = mcqs.find((q) => q.id === Number(id));
      if (question && selectedAnswers[id] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / mcqs.length) * 100;
  };

  const getShortAnswerScore = () => {
    if (!selectedQuestionTypes.includes("short") || shortQuestions.length === 0) return null;

    let totalScore = 0;
    let answeredQuestions = 0;

    Object.keys(shortAnswerFeedback).forEach((id) => {
      const feedback = shortAnswerFeedback[id];
      if (feedback && !feedback.error && feedback.score) {
        totalScore += feedback.score;
        answeredQuestions++;
      }
    });

    return answeredQuestions > 0 ? totalScore / answeredQuestions : 0;
  };

  const getFinalScore = () => {
    const mcqScore = getMcqScore();
    const shortScore = getShortAnswerScore();

    if (mcqScore === null && shortScore === null) return 0;
    if (mcqScore === null) return shortScore;
    if (shortScore === null) return mcqScore;
    return (mcqScore + shortScore) / 2;
  };

  const isAssessmentComplete = () => {
    if (selectedQuestionTypes.includes("mcq") && Object.keys(selectedAnswers).length !== mcqs.length) {
      return false;
    }
    if (selectedQuestionTypes.includes("short") && Object.keys(shortAnswerFeedback).length !== shortQuestions.length) {
      return false;
    }
    return true;
  };

  return (
    <div className="assessment-container">
      <div className="assessment-content">
        <h1>Assessment Generator</h1>
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="input-options">
              <div className="form-group">
                <label>Question Types</label>
                <div className="question-type-options">
                  {questionTypeOptions.map((option) => (
                    <div key={option.id} className="question-type-option">
                      <input
                        type="checkbox"
                        id={`type-${option.id}`}
                        checked={selectedQuestionTypes.includes(option.id)}
                        onChange={() => handleQuestionTypeChange(option.id)}
                        className="question-type-checkbox"
                      />
                      <label htmlFor={`type-${option.id}`}>{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="text-input">Enter Text Content</label>
                <textarea
                  id="text-input"
                  value={inputText}
                  onChange={handleTextChange}
                  placeholder="Enter the text content here..."
                  rows={6}
                  className="text-input"
                  disabled={pdfFile !== null}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pdf-upload">Or Upload PDF</label>
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="file-input"
                  disabled={inputText.trim() !== ""}
                />
                {pdfFile && <div className="file-info">Selected file: {pdfFile.name}</div>}
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            <button type="submit" className="generate-btn" disabled={(!inputText.trim() && !pdfFile) || loading}>
              {loading ? "Generating Questions..." : "Generate Questions"}
            </button>
          </form>
        </div>

        {mcqs.length > 0 && selectedQuestionTypes.includes("mcq") && (
          <div className="questions-section">
            <h2>Conceptual Multiple Choice Questions</h2>
            <div className="mcqs-container">
              {mcqs.map((mcq, index) => (
                <div key={mcq.id} className="question-card">
                  <h3>Question {index + 1}</h3>
                  <p>{mcq.question}</p>
                  <div className="options">
                    {mcq.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`option ${
                          selectedAnswers[mcq.id] !== undefined
                            ? optionIndex === mcq.correctAnswer
                              ? "correct"
                              : selectedAnswers[mcq.id] === optionIndex
                                ? "incorrect"
                                : ""
                            : ""
                        }`}
                        onClick={() => handleMcqSelect(mcq.id, optionIndex)}
                      >
                        <input
                          type="radio"
                          id={`q${mcq.id}-option${optionIndex}`}
                          name={`question${mcq.id}`}
                          checked={selectedAnswers[mcq.id] === optionIndex}
                          onChange={() => {}}
                        />
                        <label htmlFor={`q${mcq.id}-option${optionIndex}`}>{option}</label>
                      </div>
                    ))}
                  </div>
                  {selectedAnswers[mcq.id] !== undefined && (
                    <div
                      className={`answer-feedback ${
                        selectedAnswers[mcq.id] === mcq.correctAnswer ? "correct" : "incorrect"
                      }`}
                    >
                      {selectedAnswers[mcq.id] === mcq.correctAnswer
                        ? "✓ Correct!"
                        : `✗ Incorrect. The correct answer is: ${mcq.options[mcq.correctAnswer]}`}
                      <div className="explanation">
                        <strong>Explanation:</strong> {mcq.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {shortQuestions.length > 0 && selectedQuestionTypes.includes("short") && (
          <div className="questions-section">
            <h2>Conceptual Short Answer Questions</h2>
            <div className="short-questions-container">
              {shortQuestions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <h3>Question {index + 1}</h3>
                  <p>{question.question}</p>
                  <div className="short-answer">
                    <textarea
                      value={shortAnswers[question.id] || ""}
                      onChange={(e) => handleShortAnswerChange(question.id, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="short-answer-input"
                      disabled={!!shortAnswerFeedback[question.id]?.loading}
                    />
                    <button
                      className="submit-answer-btn"
                      onClick={() => handleShortAnswerSubmit(question)}
                      disabled={!shortAnswers[question.id]?.trim() || !!shortAnswerFeedback[question.id]?.loading}
                    >
                      {shortAnswerFeedback[question.id]?.loading ? 'Checking...' : 'Submit Answer'}
                    </button>
                  </div>
                  {/* Show feedback if available, or loading indicator */}
                  {shortAnswerFeedback[question.id]?.loading && (
                    <div className="short-answer-feedback loading">Checking answer, please wait...</div>
                  )}
                  {shortAnswerFeedback[question.id] && !shortAnswerFeedback[question.id].error && !shortAnswerFeedback[question.id].loading && (
                    <div className="short-answer-feedback">
                      <div className="feedback-score">Score: {shortAnswerFeedback[question.id].score}%</div>
                      <div className="feedback-text">{shortAnswerFeedback[question.id].feedback}</div>
                      <div className="feedback-points">
                        {shortAnswerFeedback[question.id].keyPointsCovered.length > 0 && (
                          <div className="points-covered">
                            <h4>Concepts Well Understood:</h4>
                            <ul>
                              {shortAnswerFeedback[question.id].keyPointsCovered.map((point, i) => (
                                <li key={i}>
                                  <strong>{point.point}</strong>
                                  <p>{point.quality}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {shortAnswerFeedback[question.id].keyPointsMissing.length > 0 && (
                          <div className="points-missing">
                            <h4>Concepts to Review:</h4>
                            <ul>
                              {shortAnswerFeedback[question.id].keyPointsMissing.map((point, i) => (
                                <li key={i}>
                                  <strong>{point.point}</strong>
                                  <p>{point.importance}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {shortAnswerFeedback[question.id].misconceptions.length > 0 && (
                        <div className="misconceptions">
                          <h4>Common Misconceptions Found:</h4>
                          <ul>
                            {shortAnswerFeedback[question.id].misconceptions.map((misc, i) => (
                              <li key={i}>{misc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="suggestions">
                        <h4>Suggestions for Improvement:</h4>
                        <ul>
                          {shortAnswerFeedback[question.id].suggestions.map((sugg, i) => (
                            <li key={i}>{sugg}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {shortAnswerFeedback[question.id]?.error && (
                    <div className="error-message">{shortAnswerFeedback[question.id].error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(mcqs.length > 0 || shortQuestions.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 16 }}>
            <button
              className="generate-btn"
              onClick={() => {
                setMcqs([]);
                setShortQuestions([]);
                setSelectedAnswers({});
                setShortAnswers({});
                setShortAnswerFeedback({});
                setInputText("");
                setPdfFile(null);
              }}
            >
              Try Again
            </button>
            <button
              className="generate-btn"
              style={{ marginLeft: 16 }}
              onClick={handleDownloadPDF}
            >
              Download Assessment
            </button>
          </div>
        )}


      </div>
    </div>
  );
};

export default Assessment;
