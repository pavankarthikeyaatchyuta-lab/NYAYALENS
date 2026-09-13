import { DocumentAnalysis, ActionItems } from '@/types';
import { StoredDocument } from '@/lib/store';

export const demoText = `
EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is made and entered into on this 1st day of January 2027, at Bengaluru, Karnataka, by and between:

TechCorp Inc., a company incorporated under the Companies Act, 2013, having its registered office at Cyber Park, Electronic City, Bengaluru, Karnataka (hereinafter referred to as the "Employer" or "Company");

AND

Ravi Sharma, an Indian citizen, currently residing at HSR Layout, Sector 2, Bengaluru, Karnataka (hereinafter referred to as the "Employee").

1. APPOINTMENT AND POSITION
1.1 The Employer agrees to employ the Employee in the position of Senior Software Engineer, and the Employee accepts such employment, subject to the terms and conditions set forth herein.
1.2 The Employee shall commence employment on January 1, 2027 ("Start Date").

2. PROBATION PERIOD
The Employee shall be on probation for a period of three (3) months from the Start Date, ending on April 1, 2027. During the probation period, either party may terminate this Agreement by providing fifteen (15) days' written notice.

3. COMPENSATION AND BENEFITS
3.1 The Employee's Total Cost to Company (CTC) shall be INR 24,00,000 (Twenty-Four Lakhs) per annum, subject to applicable statutory deductions including TDS, PF, and Professional Tax.
3.2 The Employee shall be eligible for an annual performance bonus of up to 10% of the CTC, payable at the sole discretion of the Company.

4. CONFIDENTIALITY
The Employee agrees to keep confidential all proprietary and confidential information of the Company, its clients, and affiliates. The Employee shall not disclose such information to any third party during the term of employment and perpetually thereafter.

5. INTELLECTUAL PROPERTY
All intellectual property created by the Employee during the course of employment, whether during office hours or using Company resources, shall be the exclusive property of the Company. The Employee agrees to assign all rights, title, and interest in such IP to the Company without any additional compensation.

6. NON-COMPETE AND NON-SOLICIT
6.1 During the term of employment and for a period of twelve (12) months following termination, the Employee shall not directly or indirectly engage in or join any business that competes directly with the Company's core software products.
6.2 For a period of twenty-four (24) months post-termination, the Employee shall not solicit any employees, clients, or vendors of the Company.

7. TERMINATION
7.1 Post probation, either party may terminate this Agreement by providing sixty (60) days' written notice or salary in lieu thereof.
7.2 The Company reserves the right to terminate employment immediately and without notice in cases of gross misconduct, fraud, or material breach of this Agreement by the Employee.
7.3 Upon termination, the Employee must promptly return all Company property, including laptops, access cards, and documents.

8. GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by the laws of India. Any disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.

For TechCorp Inc.
Signature: ________________
Name: Aditi Desai
Title: HR Director

Employee
Signature: ________________
Name: Ravi Sharma
`;

export const demoAnalysis: DocumentAnalysis = {
  documentType: 'Employment Agreement',
  title: 'Employment Agreement — TechCorp Inc.',
  parties: [
    { name: 'TechCorp Inc.', role: 'Employer' },
    { name: 'Ravi Sharma', role: 'Employee' }
  ],
  summary: 'A standard employment agreement between TechCorp Inc. and Ravi Sharma for the role of Senior Software Engineer. The contract details compensation, probation terms, confidentiality, intellectual property assignments, and restrictive covenants such as post-employment non-compete and non-solicit clauses. Several terms may warrant closer examination, including post-termination restrictions which can be subject to scrutiny under Section 27 of the Indian Contract Act.',
  complexity: 'moderate',
  attentionAreas: [
    {
      id: 'att-1',
      title: 'Post-Employment Non-Compete Restriction',
      description: 'Section 6.1 restricts joining any competing business for 12 months after termination. In India, post-employment non-compete covenants are often scrutinized under Section 27 of the Indian Contract Act.',
      category: 'restrictions',
      attentionLevel: 'high',
      clauseIds: ['clause-5']
    },
    {
      id: 'att-2',
      title: 'Extended Non-Solicitation Period',
      description: 'The 24-month non-solicitation period in Section 6.2 is significantly longer than typical industry standards of 12 months.',
      category: 'restrictions',
      attentionLevel: 'high',
      clauseIds: ['clause-5']
    },
    {
      id: 'att-3',
      title: 'Immediate Termination for Material Breach',
      description: 'The agreement allows immediate termination without notice for "material breach" without specifying a cure period or defining objective thresholds.',
      category: 'termination',
      attentionLevel: 'medium',
      clauseIds: ['clause-6']
    },
    {
      id: 'att-4',
      title: 'Perpetual Confidentiality Obligation',
      description: 'Confidentiality obligations continue indefinitely without a standard carve-out for publicly available information or a sunset period.',
      category: 'privacy',
      attentionLevel: 'medium',
      clauseIds: ['clause-3']
    }
  ],
  clauses: [
    {
      id: 'clause-1',
      title: 'Probation Period',
      section: 'Section 2',
      page: 1,
      originalText: 'The Employee shall be on probation for a period of three (3) months from the Start Date, ending on April 1, 2027. During the probation period, either party may terminate this Agreement by providing fifteen (15) days\' written notice.',
      simplifiedExplanation: 'You will have a 3-month trial period ending April 1, 2027. During this time, either you or the company can end the employment with 15 days written notice.',
      whyItMayMatter: 'The 15-day notice period allows either party quick exit rights before permanent confirmation.',
      attentionLevel: 'low',
      category: 'obligations',
      questions: ['Does confirmation occur automatically on April 1, 2027, or is formal written confirmation required?']
    },
    {
      id: 'clause-2',
      title: 'Compensation & Bonus Discretion',
      section: 'Section 3',
      page: 1,
      originalText: 'The Employee\'s Total Cost to Company (CTC) shall be INR 24,00,000 (Twenty-Four Lakhs) per annum... The Employee shall be eligible for an annual performance bonus of up to 10% of the CTC, payable at the sole discretion of the Company.',
      simplifiedExplanation: 'Your total annual compensation is INR 24 Lakhs before statutory deductions. A bonus up to 10% may be paid, but it is entirely at the company\'s discretion and not guaranteed.',
      whyItMayMatter: 'Because the bonus is "at sole discretion", it cannot be legally presumed as guaranteed income.',
      attentionLevel: 'low',
      category: 'financial',
      questions: ['What specific performance metrics determine bonus allocation?']
    },
    {
      id: 'clause-3',
      title: 'Perpetual Confidentiality',
      section: 'Section 4',
      page: 1,
      originalText: 'The Employee agrees to keep confidential all proprietary and confidential information of the Company, its clients, and affiliates... perpetually thereafter.',
      simplifiedExplanation: 'You must protect company and client secrets both during and forever after your employment ends.',
      whyItMayMatter: 'Perpetual confidentiality without standard exceptions (e.g. independently developed knowledge or public info) creates ongoing indefinite exposure.',
      attentionLevel: 'medium',
      category: 'privacy',
      questions: ['Are standard exclusions included for information that becomes public knowledge?']
    },
    {
      id: 'clause-4',
      title: 'Intellectual Property Assignment',
      section: 'Section 5',
      page: 1,
      originalText: 'All intellectual property created by the Employee during the course of employment, whether during office hours or using Company resources, shall be the exclusive property of the Company.',
      simplifiedExplanation: 'Any work, invention, or code you create during office hours or with company equipment belongs 100% to TechCorp.',
      whyItMayMatter: 'It is important to confirm that personal weekend projects built without company equipment remain your own property.',
      attentionLevel: 'medium',
      category: 'intellectual-property',
      questions: ['Does this affect open-source contributions or personal side projects done strictly on personal devices outside work hours?']
    },
    {
      id: 'clause-5',
      title: 'Post-Employment Non-Compete',
      section: 'Section 6.1',
      page: 2,
      originalText: 'During the term of employment and for a period of twelve (12) months following termination, the Employee shall not directly or indirectly engage in or join any business that competes directly with the Company\'s core software products.',
      simplifiedExplanation: 'You are barred from working with a direct competitor for 1 year after leaving TechCorp.',
      whyItMayMatter: 'Under Section 27 of the Indian Contract Act, post-termination non-compete covenants are generally void as restraints of trade, though employers frequently include them to discourage departures.',
      attentionLevel: 'high',
      category: 'restrictions',
      questions: [
        'How is a "direct competitor" explicitly defined in terms of markets and technology?',
        'Consider asking a legal professional about the enforceability of post-termination non-compete clauses under Indian jurisdiction.'
      ]
    },
    {
      id: 'clause-6',
      title: 'Termination and Notice Period',
      section: 'Section 7.1 - 7.2',
      page: 2,
      originalText: 'Post probation, either party may terminate this Agreement by providing sixty (60) days\' written notice or salary in lieu thereof. The Company reserves the right to terminate employment immediately and without notice in cases of gross misconduct, fraud, or material breach...',
      simplifiedExplanation: 'After probation, 60 days written notice or pay is required to end employment. However, the company can fire you immediately if they deem a material breach has occurred.',
      whyItMayMatter: '"Material breach" is not defined, which could grant broad discretion for immediate dismissal without cure opportunity.',
      attentionLevel: 'medium',
      category: 'termination',
      questions: ['Is there a written notice and cure period (e.g. 15-30 days) before termination for material breach takes effect?']
    }
  ],
  obligations: [
    {
      id: 'ob-1',
      description: 'Maintain strict confidentiality of proprietary company data indefinitely',
      responsibleParty: 'Employee',
      timing: 'During employment and perpetually post-employment',
      page: 1,
      section: 'Section 4'
    },
    {
      id: 'ob-2',
      description: 'Assign all intellectual property rights created with company resources to Employer',
      responsibleParty: 'Employee',
      timing: 'Upon creation',
      page: 1,
      section: 'Section 5'
    },
    {
      id: 'ob-3',
      description: 'Refrain from joining direct competitors for 12 months post-employment',
      responsibleParty: 'Employee',
      timing: '12 months post-termination',
      page: 2,
      section: 'Section 6.1'
    },
    {
      id: 'ob-4',
      description: 'Provide 60 days written notice or salary in lieu for post-probation resignation',
      responsibleParty: 'Employee',
      timing: 'Upon resignation',
      page: 2,
      section: 'Section 7.1'
    },
    {
      id: 'ob-5',
      description: 'Return all company property, equipment, and access cards upon departure',
      responsibleParty: 'Employee',
      timing: 'Upon termination',
      page: 2,
      section: 'Section 7.3'
    },
    {
      id: 'ob-6',
      description: 'Pay agreed CTC of INR 24,00,000 per annum subject to statutory deductions',
      responsibleParty: 'Employer',
      timing: 'Monthly payroll',
      page: 1,
      section: 'Section 3.1'
    },
    {
      id: 'ob-7',
      description: 'Provide 60 days written notice or salary in lieu for termination without cause',
      responsibleParty: 'Employer',
      timing: 'Upon termination',
      page: 2,
      section: 'Section 7.1'
    }
  ],
  dates: [
    {
      id: 'date-1',
      label: 'Agreement Date / Effective Date',
      date: '01 Jan 2027',
      sourceText: 'made and entered into on this 1st day of January 2027',
      page: 1,
      confidence: 'high'
    },
    {
      id: 'date-2',
      label: 'Employment Start Date',
      date: '01 Jan 2027',
      sourceText: 'shall commence employment on January 1, 2027 ("Start Date")',
      page: 1,
      confidence: 'high'
    },
    {
      id: 'date-3',
      label: 'Probation Completion Date',
      date: '01 Apr 2027',
      sourceText: 'probation for a period of three (3) months from the Start Date, ending on April 1, 2027',
      page: 1,
      confidence: 'high'
    },
    {
      id: 'date-4',
      label: 'Non-Compete Expiration (Estimated)',
      date: '12 months post-exit',
      sourceText: 'period of twelve (12) months following termination',
      page: 2,
      confidence: 'medium'
    }
  ],
  inconsistencies: [
    'The non-compete restriction (Section 6.1) lasts 12 months, while the non-solicitation restriction (Section 6.2) extends to 24 months.',
    'Section 7.2 permits summary dismissal for "material breach" without specifying what acts constitute such breach or providing a remedy period.'
  ],
  questionsForProfessional: [
    'Are post-employment non-compete covenants enforceable under Section 27 of the Indian Contract Act, 1872 for this role?',
    'Could the 24-month non-solicitation duration be negotiated to a more customary 12-month duration?',
    'Should an explicit carve-out be requested in Section 5 for pre-existing intellectual property and personal side projects?',
    'Can a 15-day cure notice requirement be inserted into Section 7.2 before immediate termination for material breach?'
  ],
  nextSteps: [
    'Review the non-compete and non-solicitation durations with a legal advisor or prospective mentor.',
    'Request written clarification on the bonus evaluation criteria before signing.',
    'List any pre-existing personal code repositories to declare as excluded from the IP assignment schedule.',
    'Confirm whether health insurance or medical coverage details are provided in an employee handbook.'
  ]
};

export const demoActions: ActionItems = {
  nextSteps: [
    'Review the 12-month non-compete clause with a legal professional.',
    'Confirm the specific bonus evaluation schedule with HR.',
    'Ensure pre-existing open-source contributions are cataloged before Start Date.',
    'Verify notice period requirements during and after the probation period.'
  ],
  checklist: [
    { id: 'chk-1', text: 'Confirm CTC breakdown (fixed basic salary vs flexible allowances vs PF)', checked: true, category: 'Compensation' },
    { id: 'chk-2', text: 'Clarify whether bonus has guaranteed minimum thresholds or metrics', checked: false, category: 'Compensation' },
    { id: 'chk-3', text: 'Clarify if probation ending on April 1, 2027 requires written confirmation', checked: true, category: 'Probation' },
    { id: 'chk-4', text: 'Document and exclude personal pre-existing side projects from IP schedule', checked: false, category: 'Intellectual Property' },
    { id: 'chk-5', text: 'Discuss non-compete applicability under Indian Contract Act Section 27', checked: false, category: 'Restrictions' },
    { id: 'chk-6', text: 'Request 15-day notice & cure period for alleged material breaches', checked: false, category: 'Termination' }
  ],
  questionsForLawyer: [
    {
      id: 'q-1',
      question: 'Is the 12-month post-employment non-compete clause enforceable under Section 27 of the Indian Contract Act?',
      context: 'Clause 6.1 restricts joining any competing software product firm for 12 months after leaving.',
      relatedClause: 'Section 6.1',
      priority: 'high'
    },
    {
      id: 'q-2',
      question: 'Can the 24-month non-solicitation clause be deemed unreasonable in duration?',
      context: 'Industry standards in tech typically hover between 6 to 12 months.',
      relatedClause: 'Section 6.2',
      priority: 'high'
    },
    {
      id: 'q-3',
      question: 'How can I safeguard personal open-source projects built outside office hours without company hardware?',
      context: 'Clause 5 asserts broad company ownership over IP created during employment.',
      relatedClause: 'Section 5',
      priority: 'medium'
    }
  ],
  lawyerBrief: {
    matter: 'Employment Agreement Review - Senior Software Engineer Position',
    documentType: 'Employment Agreement',
    partiesInvolved: ['TechCorp Inc. (Employer)', 'Ravi Sharma (Prospective Employee)'],
    keyConcerns: [
      'Post-employment 12-month non-compete covenant',
      'Extensive 24-month non-solicitation restriction',
      'Immediate termination without cure period for undefined material breach'
    ],
    relevantClauses: [
      { title: 'Non-Compete', section: 'Section 6.1', page: 2, concern: 'Restraint of trade across competing software businesses for 12 months post exit' },
      { title: 'Non-Solicitation', section: 'Section 6.2', page: 2, concern: '24-month restriction on hiring or working with former colleagues/clients' },
      { title: 'IP Assignment', section: 'Section 5', page: 1, concern: 'Absence of explicit exclusion for personal weekend side projects' }
    ],
    importantDates: [
      { label: 'Start Date', date: '01 Jan 2027' },
      { label: 'End of Probation', date: '01 Apr 2027' }
    ],
    questions: [
      'Is the non-compete restriction enforceable under current Indian labor and contract jurisprudence?',
      'What wording should be proposed to carve out personal side projects from the IP clause?'
    ],
    documentsReviewed: ['Employment_Agreement_Ravi_Sharma.pdf (3 pages)'],
    generatedAt: '2027-01-01T10:00:00.000Z'
  }
};

export function getDemoDocument(): StoredDocument {
  return {
    id: 'demo-doc-1',
    name: 'Employment_Agreement_Ravi_Sharma',
    documentType: 'Employment Agreement',
    fileType: 'pdf',
    content: demoText,
    pages: [
      { pageNumber: 1, text: demoText.slice(0, 1600) },
      { pageNumber: 2, text: demoText.slice(1600, 3200) },
      { pageNumber: 3, text: demoText.slice(3200) }
    ],
    status: 'analyzed',
    pageCount: 3,
    createdAt: '2027-01-01T09:30:00.000Z',
    analyzedAt: '2027-01-01T09:31:15.000Z',
    analysis: demoAnalysis,
    actions: demoActions
  };
}

export function getDemoAnalysis(): DocumentAnalysis {
  return demoAnalysis;
}
