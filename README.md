# EAD Assessment Tool

A comprehensive educational assessment tool built with React and Vite that helps teachers and students with lesson planning, assessments, and learning assistance.

## Project Structure

```
src/
├── components/
│   ├── Assessment/              # Assessment generation component
│   │   ├── Assessment.jsx      # Main assessment component
│   │   ├── Assessment.css      # Styles for assessment
│   │   └── prompts.jsx         # Assessment-related AI prompts
│   │
│   ├── StudentAssistant/       # Student assistance component
│   │   ├── StudentAssistant.jsx
│   │   ├── StudentAssistant.css
│   │   └── prompts.jsx         # Student-specific AI prompts
│   │
│   ├── TeacherAssistant/       # Teacher assistance component
│   │   ├── TeacherAssistant.jsx
│   │   ├── TeacherAssistant.css
│   │   └── prompts.jsx         # Teacher-specific AI prompts
│   │
│   ├── Terms/                  # Terms and definitions component
│   │   ├── Terms.jsx          # Terms generation and management
│   │   └── Terms.css          # Styles for terms
│   │
│   ├── Lessonplan/            # Lesson planning component
│   │   ├── Lessonplan.jsx
│   │   └── Lessonplan.css
│   │
│   ├── const_api.jsx          # Centralized API configuration
│   └── cont_model.jsx         # AI model configuration
```

## Features

### 1. Assessment Generation
- Generates both MCQs and short answer questions
- Uses AI to create conceptual questions
- Supports PDF file input
- Provides detailed explanations and grading criteria

### 2. Student Assistant
- Interactive Q&A system for students
- Curriculum-specific responses
- Voice input/output support
- HTML-formatted responses for better readability

### 3. Teacher Assistant
- Helps with lesson planning
- Provides teaching strategies
- Suggests educational resources
- Offers differentiation techniques

### 4. Lesson Planning
- Structured lesson plan generation
- Curriculum alignment
- Learning objectives
- Assessment strategies
- Response coming from backend

### 5. Terms Management
- Generates curriculum-specific terms and definitions
- Project-based term organization
- Assessment criteria integration
- PDF export capability
- Interactive term management interface
- Response coming from backend
## Technical Implementation

### 1. API Integration
- Centralized API configuration in `const_api.jsx`
- Base URLs and endpoints management
- Consistent request configurations

### 2. AI Model Integration
- Model configuration in `cont_model.jsx`
- API key management
- Temperature and other model settings

### 3. Prompt Management
Each component has its own `prompts.jsx` file containing:
- System prompts defining AI behavior
- User prompt generators
- HTML formatting instructions
- Component-specific instructions

### 4. Common Features Across Components
- API key validation
- Voice input/output capabilities
- HTML sanitization
- Error handling
- Loading states
- Responsive design

## Usage

### Setting Up
1. Install dependencies: `npm install`
2. Configure API key in browser localStorage
3. Start development server: `npm run dev`

### Using Components

#### Assessment Generation
```javascript
// Generate questions from text or PDF
const Assessment = () => {
  // Select question types (MCQ/Short Answer)
  // Upload PDF or enter text
  // Configure assessment parameters
  // Generate questions
}
```

#### Student Assistant
```javascript
// Get learning assistance
const StudentAssistant = () => {
  // Select curriculum, subject, grade
  // Ask questions via text/voice
  // Get formatted responses
  // Listen to responses
}
```

#### Teacher Assistant
```javascript
// Get teaching assistance
const TeacherAssistant = () => {
  // Select curriculum, subject, grade
  // Ask about teaching strategies
  // Get structured responses
  // Access educational resources
}
```

#### Terms Management
```javascript
// Generate and manage terms
const Terms = () => {
  // Select project and assessment criteria
  // Generate curriculum-specific terms
  // Export terms to PDF
  // Manage term definitions
}
```

## Dependencies
- React + Vite
- PDF.js for PDF processing
- DOMPurify for HTML sanitization
- Speech recognition/synthesis APIs
- Groq API for AI model integration
- @react-pdf/renderer for PDF generation

## Best Practices
1. **API Key Security**
   - Keys stored in localStorage
   - Validation on component mount
   - Secure transmission

2. **Code Organization**
   - Separated concerns (components, styles, prompts)
   - Reusable configurations
   - Consistent formatting

3. **Error Handling**
   - API error management
   - User input validation
   - Graceful fallbacks

4. **Performance**
   - Optimized API calls
   - Efficient PDF processing
   - Response caching where appropriate

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
[Your License Here]
