const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = new PrismaClient({
  adapter,
});

const categoriesData = [
  {
    name: 'Cloud',
    subcategories: [
      'Cloud Fundamentals',
      'Cloud Service Models (IaaS, PaaS, SaaS)',
      'Public, Private & Hybrid Cloud',
      'Cloud Security & Compliance',
      'Cloud Cost Management (FinOps)'
    ]
  },
  {
    name: 'Networking',
    subcategories: [
      'Networking Basics',
      'Routing & Switching',
      'Network Protocols & Services',
      'Wireless & Mobile Networking',
      'Network Troubleshooting & Monitoring'
    ]
  },
  {
    name: 'Cybersecurity',
    subcategories: [
      'Security Fundamentals',
      'Network & Application Security',
      'Ethical Hacking & Penetration Testing',
      'Incident Response & Forensics',
      'Governance, Risk & Compliance (GRC)'
    ]
  },
  {
    name: 'DevOps',
    subcategories: [
      'DevOps Fundamentals',
      'CI/CD Pipelines',
      'Infrastructure as Code (IaC)',
      'Monitoring & Logging',
      'Containerization & Orchestration'
    ]
  },
  {
    name: 'AI/ML',
    subcategories: [
      'AI & ML Fundamentals',
      'Supervised & Unsupervised Learning',
      'Deep Learning & Neural Networks',
      'Natural Language Processing',
      'Model Deployment & MLOps'
    ]
  },
  {
    name: 'Project Management',
    subcategories: [
      'Project Management Fundamentals',
      'Agile & Scrum',
      'Risk & Stakeholder Management',
      'Project Planning & Scheduling',
      'Quality & Performance Management'
    ]
  },
  {
    name: 'Data Analytics',
    subcategories: [
      'Data Analytics Fundamentals',
      'Data Cleaning & Preparation',
      'Data Visualization',
      'Statistical Analysis',
      'Business Intelligence & Reporting'
    ]
  },
  {
    name: 'Business Communication',
    subcategories: [
      'Professional Communication Skills',
      'Written Communication',
      'Presentation & Public Speaking',
      'Interpersonal & Team Communication',
      'Negotiation & Conflict Management'
    ]
  },
  {
    name: 'Business Model',
    subcategories: [
      'Business Model Fundamentals',
      'Value Proposition Design',
      'Revenue Models',
      'Market & Competitive Analysis',
      'Scaling & Growth Strategies'
    ]
  },
  {
    name: 'Web Development',
    subcategories: [
      'Web Fundamentals (HTML, CSS, JS)',
      'Frontend Development',
      'Backend Development',
      'Full-Stack Development',
      'Web Performance & Security'
    ]
  },
  {
    name: 'Database',
    subcategories: [
      'Database Fundamentals',
      'Relational Databases (SQL)',
      'NoSQL Databases',
      'Database Design & Modeling',
      'Database Performance & Optimization'
    ]
  },
  {
    name: 'Digital Marketing',
    subcategories: [
      'Digital Marketing Fundamentals',
      'Search Engine Optimization (SEO)',
      'Social Media Marketing',
      'Content & Email Marketing',
      'Analytics & Performance Tracking'
    ]
  },
  {
    name: 'Virtualisation',
    subcategories: [
      'Virtualization Fundamentals',
      'Hypervisors & Virtual Machines',
      'Containerization Concepts',
      'Virtual Network & Storage',
      'Virtualization Security'
    ]
  },
  {
    name: 'Linux',
    subcategories: [
      'Linux Fundamentals',
      'File System & Permissions',
      'Process & System Management',
      'Shell Scripting',
      'Linux Networking & Security'
    ]
  }
];

async function seedCategories() {
  console.log('Starting category seed...');

  for (let i = 0; i < categoriesData.length; i++) {
    const categoryData = categoriesData[i];
    
    // Create main category
    const mainCategory = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: { level: 0, orderIndex: i },
      create: {
        name: categoryData.name,
        level: 0,
        orderIndex: i,
      },
    });

    console.log(`✓ Created main category: ${mainCategory.name}`);

    // Create subcategories
    for (let j = 0; j < categoryData.subcategories.length; j++) {
      const subCatName = categoryData.subcategories[j];
      
      await prisma.category.upsert({
        where: { name: subCatName },
        update: {
          parentCategoryId: mainCategory.id,
          level: 1,
          orderIndex: j,
        },
        create: {
          name: subCatName,
          parentCategoryId: mainCategory.id,
          level: 1,
          orderIndex: j,
        },
      });

      console.log(`  ✓ Created subcategory: ${subCatName}`);
    }
  }

  console.log('\n✅ Category seeding complete!');
  console.log(`Total: ${categoriesData.length} main categories, ${categoriesData.reduce((sum, cat) => sum + cat.subcategories.length, 0)} subcategories`);
}

seedCategories()
  .catch((e) => {
    console.error('Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });