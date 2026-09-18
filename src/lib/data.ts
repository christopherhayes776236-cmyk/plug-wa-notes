import { Unit } from './types';

export const UNITS: Unit[] = [
  {
    code: 'COMP 102',
    name: 'Discrete Mathematics',
    description: 'Sets, relations, functions, propositional logic, and combinatorics designed for computing systems.',
    lecturer: 'Silas Momanyi',
    products: [
      {
        id: 'comp102-notes',
        type: 'notes',
        name: 'Clean notes PDF',
        description: 'Scanned, typed, clean exam-focused notes.',
        price: 1,
      },
      {
        id: 'comp102-video',
        type: 'video',
        name: 'Explainer video',
        description: 'Concise visual walkthrough of core problem solving.',
        price: 5,
      },
      {
        id: 'comp102-video-slides',
        type: 'videoSlides',
        name: 'Video + slides pack',
        description: 'Full video walkthrough plus slide decks for quick revision.',
        price: 7,
      },
      {
        id: 'comp102-full-pack',
        type: 'fullPack',
        name: 'Complete study pack',
        description: 'All notes, explainer video, slides, and reference diagrams.',
        price: 10,
      },
    ],
  },
  {
    code: 'SOEN 201',
    name: 'Object Oriented Analysis and Design',
    description: 'System modeling, UML diagrams, use case analysis, design patterns, and architectural abstractions.',
    lecturer: 'Catherine Wangari',
    products: [
      {
        id: 'soen201-notes',
        type: 'notes',
        name: 'Clean notes PDF',
        description: 'Scanned, typed, clean exam-focused notes.',
        price: 1,
      },
      {
        id: 'soen201-video',
        type: 'video',
        name: 'Explainer video',
        description: 'Concise visual walkthrough of UML and modeling cases.',
        price: 5,
      },
      {
        id: 'soen201-video-slides',
        type: 'videoSlides',
        name: 'Video + slides pack',
        description: 'Full video walkthrough plus slide decks for quick revision.',
        price: 7,
      },
      {
        id: 'soen201-full-pack',
        type: 'fullPack',
        name: 'Complete study pack',
        description: 'All notes, explainer video, slides, and reference diagrams.',
        price: 10,
      },
    ],
  },
  {
    code: 'SOEN 202',
    name: 'Web Programming I',
    description: 'Modern web architecture, HTML5 semantics, responsive CSS, client-side JavaScript, and HTTP fundamentals.',
    lecturer: 'Silas Momanyi',
    products: [
      {
        id: 'soen202-notes',
        type: 'notes',
        name: 'Clean notes PDF',
        description: 'Scanned, typed, clean exam-focused notes.',
        price: 1,
      },
      {
        id: 'soen202-video',
        type: 'video',
        name: 'Explainer video',
        description: 'Code-along walkthrough of web concepts and exam questions.',
        price: 5,
      },
      {
        id: 'soen202-video-slides',
        type: 'videoSlides',
        name: 'Video + slides pack',
        description: 'Full video walkthrough plus slide decks for quick revision.',
        price: 7,
      },
      {
        id: 'soen202-full-pack',
        type: 'fullPack',
        name: 'Complete study pack',
        description: 'All notes, explainer video, slides, and reference diagrams.',
        price: 10,
      },
    ],
  },
  {
    code: 'SOEN 203',
    name: 'Introduction to Database Systems',
    description: 'Relational data models, normalization (1NF-BCNF), SQL querying, indexing, and transaction management.',
    lecturer: 'Verah Nyagoto',
    products: [
      {
        id: 'soen203-notes',
        type: 'notes',
        name: 'Clean notes PDF',
        description: 'Scanned, typed, clean exam-focused notes.',
        price: 1,
      },
      {
        id: 'soen203-video',
        type: 'video',
        name: 'Explainer video',
        description: 'Step-by-step queries, schema design, and normalization breakdown.',
        price: 5,
      },
      {
        id: 'soen203-video-slides',
        type: 'videoSlides',
        name: 'Video + slides pack',
        description: 'Full video walkthrough plus slide decks for quick revision.',
        price: 7,
      },
      {
        id: 'soen203-full-pack',
        type: 'fullPack',
        name: 'Complete study pack',
        description: 'All notes, explainer video, slides, and reference diagrams.',
        price: 10,
      },
    ],
  },
  {
    code: 'SOEN 220',
    name: 'Data Communication & Networks',
    description: 'OSI and TCP/IP stack layers, transmission media, subnetting, routing protocols, and socket communication.',
    lecturer: 'Rebecca Arikas',
    products: [
      {
        id: 'soen220-notes',
        type: 'notes',
        name: 'Clean notes PDF',
        description: 'Scanned, typed, clean exam-focused notes.',
        price: 1,
      },
      {
        id: 'soen220-video',
        type: 'video',
        name: 'Explainer video',
        description: 'Network packet flows, IP subnetting math, and routing explained.',
        price: 5,
      },
      {
        id: 'soen220-video-slides',
        type: 'videoSlides',
        name: 'Video + slides pack',
        description: 'Full video walkthrough plus slide decks for quick revision.',
        price: 7,
      },
      {
        id: 'soen220-full-pack',
        type: 'fullPack',
        name: 'Complete study pack',
        description: 'All notes, explainer video, slides, and reference diagrams.',
        price: 10,
      },
    ],
  },
  {
    code: 'SOEN 240',
    name: 'Object Oriented Programming Using Java I',
    description: 'Encapsulation, inheritance, polymorphism, abstract classes, interfaces, and core Java exception handling.',
    lecturer: 'Dr. Joshua Okemwa',
    products: [
      {
        id: 'soen240-notes',
        type: 'notes',
        name: 'Clean notes PDF',
        description: 'Scanned, typed, clean exam-focused notes.',
        price: 1,
      },
      {
        id: 'soen240-video',
        type: 'video',
        name: 'Explainer video',
        description: 'Object-oriented Java execution patterns and live code solutions.',
        price: 5,
      },
      {
        id: 'soen240-video-slides',
        type: 'videoSlides',
        name: 'Video + slides pack',
        description: 'Full video walkthrough plus slide decks for quick revision.',
        price: 7,
      },
      {
        id: 'soen240-full-pack',
        type: 'fullPack',
        name: 'Complete study pack',
        description: 'All notes, explainer video, slides, and reference diagrams.',
        price: 10,
      },
    ],
  },
];

export function getUnitByCode(code: string): Unit | undefined {
  const normalized = code.replace(/[-_]/g, ' ').toUpperCase();
  return UNITS.find(
    (u) => u.code.toUpperCase() === normalized || u.code.replace(/\s+/g, '').toUpperCase() === normalized.replace(/\s+/g, '')
  );
}
