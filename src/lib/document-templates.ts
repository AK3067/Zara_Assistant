import type { DocumentTemplate } from '@/types/local-ai';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // ===== EMAIL TEMPLATES =====
  {
    id: 'email-formal',
    type: 'email_formal',
    name: 'Formal Email',
    description: 'Professional business email with proper formatting',
    category: 'business',
    fields: [
      { name: 'recipient_name', type: 'text', label: 'Recipient Name', placeholder: 'Mr./Ms. Smith', required: true },
      { name: 'recipient_email', type: 'email', label: 'Recipient Email', placeholder: 'email@example.com', required: true },
      { name: 'subject', type: 'text', label: 'Subject', placeholder: 'Email subject', required: true },
      { name: 'greeting', type: 'select', label: 'Greeting', required: true, defaultValue: 'Dear', options: [
        { value: 'Dear', label: 'Dear' },
        { value: 'Hello', label: 'Hello' },
        { value: 'Good morning', label: 'Good morning' },
        { value: 'Good afternoon', label: 'Good afternoon' },
      ]},
      { name: 'body', type: 'textarea', label: 'Email Body', placeholder: 'Write your message...', required: true },
      { name: 'closing', type: 'select', label: 'Closing', required: true, defaultValue: 'Best regards', options: [
        { value: 'Best regards', label: 'Best regards' },
        { value: 'Sincerely', label: 'Sincerely' },
        { value: 'Kind regards', label: 'Kind regards' },
        { value: 'Yours faithfully', label: 'Yours faithfully' },
      ]},
      { name: 'sender_name', type: 'text', label: 'Your Name', required: true },
      { name: 'sender_title', type: 'text', label: 'Your Title', required: false },
    ],
  },
  {
    id: 'email-informal',
    type: 'email_informal',
    name: 'Informal Email',
    description: 'Casual email for personal or friendly communication',
    category: 'personal',
    fields: [
      { name: 'recipient_name', type: 'text', label: 'Recipient Name', placeholder: 'Friend\'s name', required: true },
      { name: 'subject', type: 'text', label: 'Subject', placeholder: 'Email subject', required: true },
      { name: 'body', type: 'textarea', label: 'Email Body', placeholder: 'Write your message...', required: true },
      { name: 'closing', type: 'select', label: 'Closing', required: true, defaultValue: 'Best', options: [
        { value: 'Best', label: 'Best' },
        { value: 'Cheers', label: 'Cheers' },
        { value: 'Take care', label: 'Take care' },
        { value: 'Talk soon', label: 'Talk soon' },
      ]},
      { name: 'sender_name', type: 'text', label: 'Your Name', required: true },
    ],
  },

  // ===== LETTER TEMPLATES =====
  {
    id: 'letter-formal',
    type: 'letter_formal',
    name: 'Formal Letter',
    description: 'Official business or formal letter format',
    category: 'business',
    fields: [
      { name: 'sender_name', type: 'text', label: 'Your Name', required: true },
      { name: 'sender_address', type: 'textarea', label: 'Your Address', required: true },
      { name: 'date', type: 'date', label: 'Date', required: true },
      { name: 'recipient_name', type: 'text', label: 'Recipient Name', required: true },
      { name: 'recipient_title', type: 'text', label: 'Recipient Title', required: false },
      { name: 'recipient_address', type: 'textarea', label: 'Recipient Address', required: true },
      { name: 'subject', type: 'text', label: 'Subject', placeholder: 'RE: Subject of letter', required: true },
      { name: 'body', type: 'textarea', label: 'Letter Body', placeholder: 'Write your letter...', required: true },
      { name: 'closing', type: 'select', label: 'Closing', required: true, defaultValue: 'Yours sincerely', options: [
        { value: 'Yours sincerely', label: 'Yours sincerely' },
        { value: 'Yours faithfully', label: 'Yours faithfully' },
        { value: 'Respectfully', label: 'Respectfully' },
      ]},
    ],
  },
  {
    id: 'letter-informal',
    type: 'letter_informal',
    name: 'Personal Letter',
    description: 'Informal letter for personal communication',
    category: 'personal',
    fields: [
      { name: 'sender_name', type: 'text', label: 'Your Name', required: true },
      { name: 'sender_address', type: 'textarea', label: 'Your Address', required: false },
      { name: 'date', type: 'date', label: 'Date', required: true },
      { name: 'recipient_name', type: 'text', label: 'Recipient Name', required: true },
      { name: 'body', type: 'textarea', label: 'Letter Body', placeholder: 'Write your letter...', required: true },
      { name: 'closing', type: 'select', label: 'Closing', required: true, defaultValue: 'With love', options: [
        { value: 'With love', label: 'With love' },
        { value: 'Warm regards', label: 'Warm regards' },
        { value: 'Best wishes', label: 'Best wishes' },
        { value: 'Take care', label: 'Take care' },
      ]},
    ],
  },

  // ===== BUSINESS DOCUMENTS =====
  {
    id: 'resume',
    type: 'resume',
    name: 'Professional Resume',
    description: 'Modern professional resume template',
    category: 'business',
    fields: [
      { name: 'full_name', type: 'text', label: 'Full Name', required: true },
      { name: 'title', type: 'text', label: 'Professional Title', placeholder: 'Software Engineer', required: true },
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'phone', type: 'text', label: 'Phone', required: true },
      { name: 'location', type: 'text', label: 'Location', placeholder: 'City, Country', required: false },
      { name: 'linkedin', type: 'text', label: 'LinkedIn URL', required: false },
      { name: 'summary', type: 'textarea', label: 'Professional Summary', required: true },
      { name: 'experience', type: 'textarea', label: 'Work Experience', placeholder: 'Company, Role, Duration, Description', required: true },
      { name: 'education', type: 'textarea', label: 'Education', placeholder: 'Degree, Institution, Year', required: true },
      { name: 'skills', type: 'text', label: 'Skills', placeholder: 'Comma separated skills', required: true },
    ],
  },
  {
    id: 'cv',
    type: 'cv',
    name: 'Curriculum Vitae',
    description: 'Academic CV for research positions',
    category: 'academic',
    fields: [
      { name: 'full_name', type: 'text', label: 'Full Name', required: true },
      { name: 'title', type: 'text', label: 'Academic Title', required: true },
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'phone', type: 'text', label: 'Phone', required: true },
      { name: 'address', type: 'textarea', label: 'Address', required: false },
      { name: 'research_interests', type: 'text', label: 'Research Interests', required: true },
      { name: 'education', type: 'textarea', label: 'Education', required: true },
      { name: 'publications', type: 'textarea', label: 'Publications', required: false },
      { name: 'experience', type: 'textarea', label: 'Academic Experience', required: true },
      { name: 'awards', type: 'textarea', label: 'Awards & Honors', required: false },
    ],
  },
  {
    id: 'report',
    type: 'report',
    name: 'Business Report',
    description: 'Professional business report with sections',
    category: 'business',
    fields: [
      { name: 'title', type: 'text', label: 'Report Title', required: true },
      { name: 'subtitle', type: 'text', label: 'Subtitle', required: false },
      { name: 'author', type: 'text', label: 'Author', required: true },
      { name: 'date', type: 'date', label: 'Date', required: true },
      { name: 'executive_summary', type: 'textarea', label: 'Executive Summary', required: true },
      { name: 'introduction', type: 'textarea', label: 'Introduction', required: true },
      { name: 'findings', type: 'textarea', label: 'Key Findings', required: true },
      { name: 'recommendations', type: 'textarea', label: 'Recommendations', required: false },
      { name: 'conclusion', type: 'textarea', label: 'Conclusion', required: true },
    ],
  },
  {
    id: 'proposal',
    type: 'proposal',
    name: 'Project Proposal',
    description: 'Business project proposal template',
    category: 'business',
    fields: [
      { name: 'project_title', type: 'text', label: 'Project Title', required: true },
      { name: 'client_name', type: 'text', label: 'Client Name', required: true },
      { name: 'prepared_by', type: 'text', label: 'Prepared By', required: true },
      { name: 'date', type: 'date', label: 'Date', required: true },
      { name: 'executive_summary', type: 'textarea', label: 'Executive Summary', required: true },
      { name: 'objectives', type: 'textarea', label: 'Project Objectives', required: true },
      { name: 'scope', type: 'textarea', label: 'Scope of Work', required: true },
      { name: 'timeline', type: 'textarea', label: 'Timeline', required: true },
      { name: 'budget', type: 'text', label: 'Budget Estimate', required: true },
      { name: 'terms', type: 'textarea', label: 'Terms & Conditions', required: false },
    ],
  },
  {
    id: 'invoice',
    type: 'invoice',
    name: 'Invoice',
    description: 'Professional invoice template',
    category: 'business',
    fields: [
      { name: 'invoice_number', type: 'text', label: 'Invoice Number', required: true },
      { name: 'date', type: 'date', label: 'Invoice Date', required: true },
      { name: 'due_date', type: 'date', label: 'Due Date', required: true },
      { name: 'from_name', type: 'text', label: 'From (Name)', required: true },
      { name: 'from_address', type: 'textarea', label: 'From (Address)', required: true },
      { name: 'to_name', type: 'text', label: 'To (Name)', required: true },
      { name: 'to_address', type: 'textarea', label: 'To (Address)', required: true },
      { name: 'items', type: 'textarea', label: 'Items (Description | Qty | Price)', required: true },
      { name: 'notes', type: 'textarea', label: 'Notes', required: false },
    ],
  },
  {
    id: 'meeting-notes',
    type: 'meeting_notes',
    name: 'Meeting Notes',
    description: 'Structured meeting notes template',
    category: 'business',
    fields: [
      { name: 'meeting_title', type: 'text', label: 'Meeting Title', required: true },
      { name: 'date', type: 'date', label: 'Date', required: true },
      { name: 'time', type: 'text', label: 'Time', placeholder: '10:00 AM - 11:00 AM', required: true },
      { name: 'location', type: 'text', label: 'Location/Link', required: false },
      { name: 'attendees', type: 'text', label: 'Attendees', placeholder: 'Comma separated names', required: true },
      { name: 'agenda', type: 'textarea', label: 'Agenda Items', required: true },
      { name: 'discussion', type: 'textarea', label: 'Discussion Points', required: true },
      { name: 'action_items', type: 'textarea', label: 'Action Items', required: true },
      { name: 'next_meeting', type: 'text', label: 'Next Meeting', required: false },
    ],
  },

  // ===== ACADEMIC =====
  {
    id: 'essay',
    type: 'report',
    name: 'Academic Essay',
    description: 'Academic essay with proper structure',
    category: 'academic',
    fields: [
      { name: 'title', type: 'text', label: 'Essay Title', required: true },
      { name: 'author', type: 'text', label: 'Author', required: true },
      { name: 'course', type: 'text', label: 'Course Name', required: false },
      { name: 'instructor', type: 'text', label: 'Instructor', required: false },
      { name: 'date', type: 'date', label: 'Date', required: true },
      { name: 'introduction', type: 'textarea', label: 'Introduction', required: true },
      { name: 'body', type: 'textarea', label: 'Body Paragraphs', required: true },
      { name: 'conclusion', type: 'textarea', label: 'Conclusion', required: true },
      { name: 'references', type: 'textarea', label: 'References', required: false },
    ],
  },

  // ===== PERSONAL =====
  {
    id: 'cover-letter',
    type: 'letter_formal',
    name: 'Cover Letter',
    description: 'Job application cover letter',
    category: 'business',
    fields: [
      { name: 'sender_name', type: 'text', label: 'Your Name', required: true },
      { name: 'sender_address', type: 'textarea', label: 'Your Address', required: true },
      { name: 'sender_email', type: 'email', label: 'Your Email', required: true },
      { name: 'sender_phone', type: 'text', label: 'Your Phone', required: true },
      { name: 'date', type: 'date', label: 'Date', required: true },
      { name: 'hiring_manager', type: 'text', label: 'Hiring Manager Name', placeholder: 'If known', required: false },
      { name: 'company_name', type: 'text', label: 'Company Name', required: true },
      { name: 'company_address', type: 'textarea', label: 'Company Address', required: false },
      { name: 'position', type: 'text', label: 'Position Applied For', required: true },
      { name: 'body', type: 'textarea', label: 'Cover Letter Body', required: true },
    ],
  },

  // ===== CREATIVE =====
  {
    id: 'story',
    type: 'report',
    name: 'Short Story',
    description: 'Creative writing story template',
    category: 'creative',
    fields: [
      { name: 'title', type: 'text', label: 'Story Title', required: true },
      { name: 'author', type: 'text', label: 'Author', required: true },
      { name: 'genre', type: 'select', label: 'Genre', required: true, options: [
        { value: 'fiction', label: 'Fiction' },
        { value: 'non-fiction', label: 'Non-Fiction' },
        { value: 'fantasy', label: 'Fantasy' },
        { value: 'sci-fi', label: 'Science Fiction' },
        { value: 'romance', label: 'Romance' },
        { value: 'mystery', label: 'Mystery' },
        { value: 'horror', label: 'Horror' },
      ]},
      { name: 'content', type: 'textarea', label: 'Story Content', required: true },
    ],
  },
];

// Helper function to get templates by category
export function getTemplatesByCategory(category: DocumentTemplate['category']): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(t => t.category === category);
}

// Helper function to get template by ID
export function getTemplateById(id: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find(t => t.id === id);
}

// Helper function to get template by type
export function getTemplatesByType(type: DocumentTemplate['type']): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(t => t.type === type);
}
