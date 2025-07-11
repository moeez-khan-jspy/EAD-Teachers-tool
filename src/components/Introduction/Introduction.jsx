import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Introduction.css';

const Introduction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedTerms, setSelectedTerms] = useState('');

  const curriculumOptions = [
    { id: 'ontario', name: 'Ontario Curriculum' },
    { id: 'common-core', name: 'US Common Core Curriculum' },
    { id: 'canadian', name: 'Canadian Curriculum' }
  ];

  const subjectOptions = [
    { id: 'english', name: 'English' },
    { id: 'computer', name: 'Computer' },
    { id: 'science', name: 'Science' }
  ];

  const gradeOptions = [2, 3, 4, 5];
  const termOptions = [2, 3, 4];

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      
      const formData = {
        curriculum: selectedCurriculum,
        subject: selectedSubject,
        grade: selectedGrade.toString(),
        numberOfTerms: parseInt(selectedTerms)
      };

      console.log('Sending data:', formData);

      const response = await fetch('https://apis.earlyagedevelopment.com/api/lesson-terms/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson plan');
      }

      const data = await response.json();
      console.log('Received data:', data);

      // Store the complete response data
      localStorage.setItem('lessonPlanData', JSON.stringify({
        formData,
        termPlan: data
      }));
      
      // Save the selected data to localStorage
      const projectData = {
        curriculum: selectedCurriculum,
        subject: selectedSubject,
        grade: selectedGrade,
        numberOfTerms: selectedTerms
      };
      
      localStorage.setItem('selectedProject', JSON.stringify(projectData));
      
      navigate('/terms');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate lesson plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="introduction">
      <div className="intro-container">
        <div className="intro-content">
          <h1 className="intro-title">Lesson Planning</h1>
          
          <div className="notification-banner">
            <i className="fas fa-info-circle"></i>
            <p>Through this platform you can make lesson plans by your curriculum</p>
            <button className="close-notification">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="main-grid">
            <div className="selection-panel">
              <div className="section-title">
                <h2>Create Your Lesson Plan</h2>
                <div className="title-underline"></div>
                <p className="section-subtitle">Select your preferences to get started</p>
              </div>

              <div className="selection-steps">
                <div className="selection-step">
                  <h3><span>1</span>Select Curriculum</h3>
                  <div className="options-grid">
                    {curriculumOptions.map(curriculum => (
                      <button
                        key={curriculum.id}
                        className={`option-card ${selectedCurriculum === curriculum.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCurriculum(curriculum.id)}
                      >
                        <div className="option-icon">
                          <i className="fas fa-book"></i>
                        </div>
                        <span>{curriculum.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="selection-step">
                  <h3><span>2</span>Select Subject</h3>
                  <div className="options-grid">
                    {subjectOptions.map(subject => (
                      <button
                        key={subject.id}
                        className={`option-card ${selectedSubject === subject.id ? 'selected' : ''}`}
                        onClick={() => setSelectedSubject(subject.id)}
                      >
                        <div className="option-icon">
                          <i className={`fas fa-${subject.id === 'english' ? 'book-open' : 
                                               subject.id === 'computer' ? 'laptop-code' : 
                                               'flask'}`}></i>
                        </div>
                        <span>{subject.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="selection-step">
                  <h3><span>3</span>Select Grade Level</h3>
                  <div className="options-grid">
                    {gradeOptions.map(grade => (
                      <button
                        key={grade}
                        className={`option-card ${selectedGrade === grade ? 'selected' : ''}`}
                        onClick={() => setSelectedGrade(grade)}
                      >
                        <div className="option-icon">
                          <i className="fas fa-graduation-cap"></i>
                        </div>
                        <span>Grade {grade}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="selection-step">
                  <h3><span>4</span>Number of Terms</h3>
                  <div className="options-grid">
                    {termOptions.map(terms => (
                      <button
                        key={terms}
                        className={`option-card ${selectedTerms === terms ? 'selected' : ''}`}
                        onClick={() => setSelectedTerms(terms)}
                      >
                        <div className="option-icon">
                          <i className="fas fa-calendar-alt"></i>
                        </div>
                        <span>{terms} Terms</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="selection-actions">
                <button 
                  className={`generate-button ${
                    selectedCurriculum && selectedSubject && selectedGrade && selectedTerms 
                    ? 'active' 
                    : 'disabled'
                  }`}
                  disabled={!selectedCurriculum || !selectedSubject || !selectedGrade || !selectedTerms || loading}
                  onClick={handleGeneratePlan}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Curriculum Plan
                      <i className="fas fa-arrow-right"></i>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="features-panel">
              <div className="illustration-container">
                <img 
                  src={new URL('../../assets/images/mango.PNG', import.meta.url).href}
                  alt="Curriculum illustration showing teachers and students"
                  className="curriculum-illustration"
                />
              </div>

              <div className="features">
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <i className="fas fa-file-pdf"></i>
                  </div>
                  <h3>Smart PDF Processing</h3>
                  <p>Upload curriculum PDFs and let our AI-powered system organize content intelligently</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <h3>Term Planning</h3>
                  <p>Automatically divide curriculum into balanced terms with smart scheduling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Introduction; 