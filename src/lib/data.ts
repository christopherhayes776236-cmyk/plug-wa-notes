import { Product, Unit, WeekSection } from './types';

function thumb(id: string): string {
  return `/thumbnails/${id}.svg`;
}

function week13Products(
  prefix: string,
  videoDescription: string,
  notesOverride?: Product[]
): Product[] {
  const notes: Product[] = notesOverride ?? [
    {
      id: `${prefix}-notes`,
      type: 'notes',
      name: 'Clean notes PDF',
      description: 'Typed, exam-focused notes for weeks 1–3.',
      price: 1,
      thumbnailSrc: thumb(`${prefix}-notes`),
      fileUrl: `/units/${prefix}/notes.pdf`,
    },
  ];

  return [
    ...notes,
    {
      id: `${prefix}-audio`,
      type: 'audio',
      name: 'Audio overview',
      description: 'Audio highlight breakdown for learning on the go.',
      price: 3,
      thumbnailSrc: thumb(`${prefix}-video`),
      fileUrl: `/units/${prefix}/audio.m4a`,
    },
    {
      id: `${prefix}-video`,
      type: 'video',
      name: 'Explainer video',
      description: videoDescription,
      price: 5,
      thumbnailSrc: thumb(`${prefix}-video`),
      fileUrl: `/units/${prefix}/video.mp4`,
    },
    {
      id: `${prefix}-video-slides`,
      type: 'videoSlides',
      name: 'Video + slides pack',
      description: 'Full video walkthrough plus slide decks for quick revision.',
      price: 7,
      thumbnailSrc: thumb(`${prefix}-video-slides`),
      fileUrl: `/units/${prefix}/video.mp4`,
      files: [
        {
          name: 'Explainer Video (MP4)',
          fileUrl: `/units/${prefix}/video.mp4`,
          fileName: `${prefix}-explainer-video.mp4`,
          type: 'video',
        },
        {
          name: 'Slide Deck / Blueprint (PDF)',
          fileUrl: `/units/${prefix}/slides.pdf`,
          fileName: `${prefix}-slides.pdf`,
          type: 'slides',
        },
      ],
    },
    {
      id: `${prefix}-full-pack`,
      type: 'fullPack',
      name: 'Complete study pack',
      description: 'All notes, explainer video, slides, and reference diagrams.',
      price: 10,
      thumbnailSrc: thumb(`${prefix}-full-pack`),
      fileUrl: `/units/${prefix}/notes.pdf`,
      files: [
        {
          name: 'Exam Notes (PDF)',
          fileUrl: `/units/${prefix}/notes.pdf`,
          fileName: `${prefix}-notes.pdf`,
          type: 'notes',
        },
        {
          name: 'Slide Deck / Blueprint (PDF)',
          fileUrl: `/units/${prefix}/slides.pdf`,
          fileName: `${prefix}-slides.pdf`,
          type: 'slides',
        },
        {
          name: 'Audio Breakdown (M4A)',
          fileUrl: `/units/${prefix}/audio.m4a`,
          fileName: `${prefix}-audio-breakdown.m4a`,
          type: 'audio',
        },
        {
          name: 'Explainer Video (MP4)',
          fileUrl: `/units/${prefix}/video.mp4`,
          fileName: `${prefix}-explainer-video.mp4`,
          type: 'video',
        },
      ],
    },
  ];
}

function week13Section(products: Product[]): WeekSection {
  return {
    id: 'week-1-3',
    title: 'Weeks 1–3',
    subtitle: 'Foundation revision pack — notes, explainer video, slides, and full pack.',
    products,
  };
}

function week45Products(
  prefix: string,
  videoDescription: string,
  notesOverride?: Product[]
): Product[] {
  const notes: Product[] = notesOverride ?? [
    {
      id: `${prefix}-w45-notes`,
      type: 'notes',
      name: 'Weeks 4–5 notes PDF',
      description: 'Comprehensive, exam-focused lecture notes for weeks 4–5.',
      price: 1,
      thumbnailSrc: thumb(`${prefix}-notes`),
      fileUrl: `/units/${prefix}/notes-w45.pdf`,
    },
  ];

  return [
    ...notes,
    {
      id: `${prefix}-w45-audio`,
      type: 'audio',
      name: 'Weeks 4–5 audio overview',
      description: 'Audio highlight breakdown of weeks 4–5 core principles.',
      price: 3,
      thumbnailSrc: thumb(`${prefix}-video`),
      fileUrl: `/units/${prefix}/audio-w45.m4a`,
    },
    {
      id: `${prefix}-w45-video`,
      type: 'video',
      name: 'Weeks 4–5 explainer video',
      description: videoDescription,
      price: 5,
      thumbnailSrc: thumb(`${prefix}-video`),
      fileUrl: `/units/${prefix}/video-w45.mp4`,
    },
    {
      id: `${prefix}-w45-video-slides`,
      type: 'videoSlides',
      name: 'Weeks 4–5 video + slides pack',
      description: 'Full weeks 4–5 video walkthrough plus slide decks for quick revision.',
      price: 7,
      thumbnailSrc: thumb(`${prefix}-video-slides`),
      fileUrl: `/units/${prefix}/video-w45.mp4`,
      files: [
        {
          name: 'Weeks 4–5 Explainer Video (MP4)',
          fileUrl: `/units/${prefix}/video-w45.mp4`,
          fileName: `${prefix}-w45-explainer-video.mp4`,
          type: 'video',
        },
        {
          name: 'Weeks 4–5 Slide Deck (PDF)',
          fileUrl: `/units/${prefix}/slides-w45.pdf`,
          fileName: `${prefix}-w45-slides.pdf`,
          type: 'slides',
        },
      ],
    },
    {
      id: `${prefix}-w45-full-pack`,
      type: 'fullPack',
      name: 'Weeks 4–5 complete study pack',
      description: 'All weeks 4–5 notes, explainer video, slides, and reference materials.',
      price: 10,
      thumbnailSrc: thumb(`${prefix}-full-pack`),
      fileUrl: `/units/${prefix}/notes-w45.pdf`,
      files: [
        {
          name: 'Weeks 4–5 Exam Notes (PDF)',
          fileUrl: `/units/${prefix}/notes-w45.pdf`,
          fileName: `${prefix}-w45-notes.pdf`,
          type: 'notes',
        },
        {
          name: 'Weeks 4–5 Slide Deck (PDF)',
          fileUrl: `/units/${prefix}/slides-w45.pdf`,
          fileName: `${prefix}-w45-slides.pdf`,
          type: 'slides',
        },
        {
          name: 'Weeks 4–5 Audio Breakdown (M4A)',
          fileUrl: `/units/${prefix}/audio-w45.m4a`,
          fileName: `${prefix}-w45-audio-breakdown.m4a`,
          type: 'audio',
        },
        {
          name: 'Weeks 4–5 Explainer Video (MP4)',
          fileUrl: `/units/${prefix}/video-w45.mp4`,
          fileName: `${prefix}-w45-explainer-video.mp4`,
          type: 'video',
        },
      ],
    },
  ];
}

function week45Section(products: Product[]): WeekSection {
  return {
    id: 'week-4-5',
    title: 'Weeks 4–5',
    badge: 'NEW',
    subtitle: 'Latest batch — weeks 4–5 lecture breakdown, notes, slides, and walkthrough.',
    products,
  };
}

function soen220AssignmentSection(): WeekSection {
  return {
    id: 'soen220-assignment',
    title: 'Weeks 4–5 Assignment Pack',
    badge: 'ASSIGNMENT',
    subtitle: 'Dedicated walkthrough video and solution notes for the SOEN 220 assignment.',
    products: [
      {
        id: 'soen220-asg-notes',
        type: 'notes',
        name: 'Assignment Solution Notes (PDF)',
        description: 'Complete step-by-step written guide and solutions for the weeks 4–5 assignment.',
        price: 1,
        thumbnailSrc: thumb('soen220-notes'),
        fileUrl: '/units/soen220/assignment-notes.pdf',
      },
      {
        id: 'soen220-asg-video',
        type: 'video',
        name: 'Assignment Video Overview (MP4)',
        description: 'Detailed video walkthrough explaining each question and concept in the assignment.',
        price: 5,
        thumbnailSrc: thumb('soen220-video'),
        fileUrl: '/units/soen220/assignment-video.mp4',
      },
      {
        id: 'soen220-asg-full-pack',
        type: 'fullPack',
        name: 'Assignment Complete Pack',
        description: 'Everything you need for the assignment — video overview plus written solution notes.',
        price: 5,
        thumbnailSrc: thumb('soen220-full-pack'),
        fileUrl: '/units/soen220/assignment-notes.pdf',
        files: [
          {
            name: 'Assignment Solution Notes (PDF)',
            fileUrl: '/units/soen220/assignment-notes.pdf',
            fileName: 'soen220-assignment-notes.pdf',
            type: 'notes',
          },
          {
            name: 'Assignment Video Overview (MP4)',
            fileUrl: '/units/soen220/assignment-video.mp4',
            fileName: 'soen220-assignment-video.mp4',
            type: 'video',
          },
        ],
      },
    ],
  };
}

export const UNITS: Unit[] = [
  {
    code: 'COMP 102',
    name: 'Discrete Mathematics',
    description: 'Sets, relations, functions, propositional logic, and combinatorics designed for computing systems.',
    lecturer: 'Silas Momanyi',
    sections: [
      week45Section(
        week45Products('comp102', 'Comprehensive problem-solving breakdown for sets, relations & functions.')
      ),
      week13Section(
        week13Products('comp102', 'Concise visual walkthrough of core problem solving.')
      ),
    ],
  },
  {
    code: 'SOEN 201',
    name: 'Object Oriented Analysis and Design',
    description: 'System modeling, UML diagrams, use case analysis, design patterns, and architectural abstractions.',
    lecturer: 'Catherine Wangari',
    sections: [
      week45Section(
        week45Products('soen201', 'UML design patterns, state diagrams, and architectural principles.')
      ),
      week13Section(
        week13Products('soen201', 'Concise visual walkthrough of UML and modeling cases.')
      ),
    ],
  },
  {
    code: 'SOEN 202',
    name: 'Web Programming I',
    description: 'Modern web architecture, HTML5 semantics, responsive CSS, client-side JavaScript, and HTTP fundamentals.',
    lecturer: 'Silas Momanyi',
    sections: [
      week45Section(
        week45Products('soen202', 'Deep dive into responsive layout mechanics, DOM manipulation, and HTTP.')
      ),
      week13Section(
        week13Products('soen202', 'Code-along walkthrough of web concepts and exam questions.')
      ),
    ],
  },
  {
    code: 'SOEN 203',
    name: 'Introduction to Database Systems',
    description: 'Relational data models, normalization (1NF-BCNF), SQL querying, indexing, and transaction management.',
    lecturer: 'Verah Nyagoto',
    sections: [
      week45Section(
        week45Products('soen203', 'Advanced relational algebra, SQL optimization, and database normalization.')
      ),
      week13Section(
        week13Products('soen203', 'Step-by-step queries, schema design, and normalization breakdown.')
      ),
    ],
  },
  {
    code: 'SOEN 220',
    name: 'Data Communication & Networks',
    description: 'OSI and TCP/IP stack layers, transmission media, subnetting, routing protocols, and socket communication.',
    lecturer: 'Rebecca Arikas',
    sections: [
      week45Section(
        week45Products('soen220', 'Transmission media, packet routing mechanics, and subnet calculations.')
      ),
      soen220AssignmentSection(),
      week13Section(
        week13Products('soen220', 'Network packet flows, IP subnetting math, and routing explained.', [
          {
            id: 'soen220-notes-w12',
            type: 'notes',
            name: 'Weeks 1–2 notes',
            description: 'Typed notes covering data communication fundamentals for weeks 1–2.',
            price: 1,
            thumbnailSrc: thumb('soen220-notes-w12'),
            fileUrl: '/units/soen220/notes-w12.pdf',
          },
          {
            id: 'soen220-notes-w3',
            type: 'notes',
            name: 'Week 3 notes',
            description: 'Network topology notes for week 3.',
            price: 1,
            thumbnailSrc: thumb('soen220-notes-w3'),
            fileUrl: '/units/soen220/notes-w3.pdf',
          },
        ])
      ),
    ],
  },
  {
    code: 'SOEN 240',
    name: 'Object Oriented Programming Using Java I',
    description: 'Encapsulation, inheritance, polymorphism, abstract classes, interfaces, and core Java exception handling.',
    lecturer: 'Dr. Joshua Okemwa',
    sections: [
      week45Section(
        week45Products('soen240', 'Java inheritance hierarchies, polymorphism patterns, and exception architecture.')
      ),
      week13Section(
        week13Products('soen240', 'Object-oriented Java execution patterns and live code solutions.')
      ),
    ],
  },
];

export function getUnitByCode(code: string): Unit | undefined {
  const normalized = code.replace(/[-_]/g, ' ').toUpperCase();
  return UNITS.find(
    (u) =>
      u.code.toUpperCase() === normalized ||
      u.code.replace(/\s+/g, '').toUpperCase() === normalized.replace(/\s+/g, '')
  );
}

export function getProductById(unit: Unit, productId: string) {
  for (const section of unit.sections) {
    const product = section.products.find((p) => p.id === productId);
    if (product) return product;
  }
  return undefined;
}

export function findProduct(
  unit: Unit,
  opts: { productId?: string; productType?: string }
) {
  if (opts.productId) {
    const byId = getProductById(unit, opts.productId);
    if (byId) return byId;
  }
  if (opts.productType) {
    for (const section of unit.sections) {
      const product = section.products.find((p) => p.type === opts.productType);
      if (product) return product;
    }
  }
  return undefined;
}
