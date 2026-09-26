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
    },
  ];

  return [
    ...notes,
    {
      id: `${prefix}-video`,
      type: 'video',
      name: 'Explainer video',
      description: videoDescription,
      price: 5,
      thumbnailSrc: thumb(`${prefix}-video`),
    },
    {
      id: `${prefix}-video-slides`,
      type: 'videoSlides',
      name: 'Video + slides pack',
      description: 'Full video walkthrough plus slide decks for quick revision.',
      price: 7,
      thumbnailSrc: thumb(`${prefix}-video-slides`),
    },
    {
      id: `${prefix}-full-pack`,
      type: 'fullPack',
      name: 'Complete study pack',
      description: 'All notes, explainer video, slides, and reference diagrams.',
      price: 10,
      thumbnailSrc: thumb(`${prefix}-full-pack`),
    },
  ];
}

function week13Section(products: Product[]): WeekSection {
  return {
    id: 'week-1-3',
    title: 'Week 1–3 notes',
    products,
  };
}

export const UNITS: Unit[] = [
  {
    code: 'COMP 102',
    name: 'Discrete Mathematics',
    description: 'Sets, relations, functions, propositional logic, and combinatorics designed for computing systems.',
    lecturer: 'Silas Momanyi',
    sections: [
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
      week13Section(
        week13Products('soen220', 'Network packet flows, IP subnetting math, and routing explained.', [
          {
            id: 'soen220-notes-w12',
            type: 'notes',
            name: 'Weeks 1–2 notes',
            description: 'Typed notes covering data communication fundamentals for weeks 1–2.',
            price: 1,
            thumbnailSrc: thumb('soen220-notes-w12'),
          },
          {
            id: 'soen220-notes-w3',
            type: 'notes',
            name: 'Week 3 notes',
            description: 'Network topology notes for week 3.',
            price: 1,
            thumbnailSrc: thumb('soen220-notes-w3'),
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
