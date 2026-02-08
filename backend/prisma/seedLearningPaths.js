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

async function seedLearningPaths() {
  console.log('Starting learning paths seed...');

  // First, get all categories to reference by name
  const allCategories = await prisma.category.findMany();
  
  const getCategoryId = (name) => {
    const cat = allCategories.find(c => c.name === name);
    if (!cat) throw new Error(`Category not found: ${name}`);
    return cat.id;
  };

  const learningPaths = [
    {
      name: 'Full-Stack Web Developer',
      description: 'Complete path to becoming a full-stack web developer, covering frontend, backend, and databases.',
      goalKeywords: ['web developer', 'full stack', 'fullstack', 'website development', 'web development', 'build websites'],
      difficultyLevel: 'BEGINNER',
      estimatedMonths: 8,
      requiredCategoryIds: [
        getCategoryId('Web Fundamentals (HTML, CSS, JS)'),
        getCategoryId('Frontend Development'),
        getCategoryId('Backend Development'),
        getCategoryId('Database Fundamentals'),
        getCategoryId('Relational Databases (SQL)')
      ],
      preferencesJson: {
        framework: ['React', 'Vue', 'Angular'],
        backend: ['Node.js', 'Python', 'Java'],
        database: ['PostgreSQL', 'MySQL', 'MongoDB']
      }
    },
    {
      name: 'Cloud Engineer',
      description: 'Master cloud infrastructure, deployment, and management across major cloud platforms.',
      goalKeywords: ['cloud engineer', 'cloud computing', 'aws', 'azure', 'cloud infrastructure', 'cloud architect'],
      difficultyLevel: 'INTERMEDIATE',
      estimatedMonths: 6,
      requiredCategoryIds: [
        getCategoryId('Cloud Fundamentals'),
        getCategoryId('Cloud Service Models (IaaS, PaaS, SaaS)'),
        getCategoryId('Public, Private & Hybrid Cloud'),
        getCategoryId('Cloud Security & Compliance'),
        getCategoryId('Networking Basics')
      ],
      preferencesJson: {
        cloudProvider: ['AWS', 'Azure', 'Google Cloud'],
        focus: ['Infrastructure', 'DevOps', 'Security']
      }
    },
    {
      name: 'DevOps Engineer',
      description: 'Learn to automate, deploy, and manage applications with modern DevOps practices.',
      goalKeywords: ['devops', 'ci/cd', 'automation', 'kubernetes', 'docker', 'infrastructure'],
      difficultyLevel: 'INTERMEDIATE',
      estimatedMonths: 7,
      requiredCategoryIds: [
        getCategoryId('DevOps Fundamentals'),
        getCategoryId('CI/CD Pipelines'),
        getCategoryId('Infrastructure as Code (IaC)'),
        getCategoryId('Containerization & Orchestration'),
        getCategoryId('Monitoring & Logging'),
        getCategoryId('Cloud Fundamentals')
      ],
      preferencesJson: {
        containerization: ['Docker', 'Kubernetes', 'Both'],
        cicd: ['Jenkins', 'GitLab CI', 'GitHub Actions'],
        cloudProvider: ['AWS', 'Azure', 'Google Cloud']
      }
    },
    {
      name: 'Data Analyst',
      description: 'Transform data into insights with analytics, visualization, and business intelligence.',
      goalKeywords: ['data analyst', 'data analysis', 'analytics', 'business intelligence', 'data visualization'],
      difficultyLevel: 'BEGINNER',
      estimatedMonths: 5,
      requiredCategoryIds: [
        getCategoryId('Data Analytics Fundamentals'),
        getCategoryId('Data Cleaning & Preparation'),
        getCategoryId('Data Visualization'),
        getCategoryId('Statistical Analysis'),
        getCategoryId('Business Intelligence & Reporting')
      ],
      preferencesJson: {
        tools: ['Python', 'R', 'SQL', 'Excel'],
        visualization: ['Tableau', 'Power BI', 'Python (Matplotlib/Seaborn)']
      }
    },
    {
      name: 'Cybersecurity Specialist',
      description: 'Protect systems and networks with comprehensive security knowledge and ethical hacking skills.',
      goalKeywords: ['cybersecurity', 'security', 'ethical hacking', 'penetration testing', 'infosec', 'cyber security'],
      difficultyLevel: 'INTERMEDIATE',
      estimatedMonths: 8,
      requiredCategoryIds: [
        getCategoryId('Security Fundamentals'),
        getCategoryId('Network & Application Security'),
        getCategoryId('Ethical Hacking & Penetration Testing'),
        getCategoryId('Incident Response & Forensics'),
        getCategoryId('Networking Basics')
      ],
      preferencesJson: {
        focus: ['Offensive Security', 'Defensive Security', 'Both'],
        certification: ['CEH', 'OSCP', 'CompTIA Security+']
      }
    },
    {
      name: 'AI/ML Engineer',
      description: 'Build and deploy machine learning models and AI systems.',
      goalKeywords: ['machine learning', 'ai', 'artificial intelligence', 'ml engineer', 'data science', 'deep learning'],
      difficultyLevel: 'ADVANCED',
      estimatedMonths: 10,
      requiredCategoryIds: [
        getCategoryId('AI & ML Fundamentals'),
        getCategoryId('Supervised & Unsupervised Learning'),
        getCategoryId('Deep Learning & Neural Networks'),
        getCategoryId('Model Deployment & MLOps'),
        getCategoryId('Data Analytics Fundamentals')
      ],
      preferencesJson: {
        framework: ['TensorFlow', 'PyTorch', 'Scikit-learn'],
        focus: ['Computer Vision', 'NLP', 'General ML']
      }
    },
    {
      name: 'Database Administrator',
      description: 'Design, implement, and maintain robust database systems.',
      goalKeywords: ['database', 'dba', 'database administrator', 'sql', 'database management'],
      difficultyLevel: 'INTERMEDIATE',
      estimatedMonths: 6,
      requiredCategoryIds: [
        getCategoryId('Database Fundamentals'),
        getCategoryId('Relational Databases (SQL)'),
        getCategoryId('NoSQL Databases'),
        getCategoryId('Database Design & Modeling'),
        getCategoryId('Database Performance & Optimization')
      ],
      preferencesJson: {
        databaseType: ['SQL', 'NoSQL', 'Both'],
        platform: ['PostgreSQL', 'MySQL', 'MongoDB', 'Oracle']
      }
    },
    {
      name: 'Digital Marketing Specialist',
      description: 'Master online marketing strategies including SEO, social media, and analytics.',
      goalKeywords: ['digital marketing', 'marketing', 'seo', 'social media', 'online marketing'],
      difficultyLevel: 'BEGINNER',
      estimatedMonths: 4,
      requiredCategoryIds: [
        getCategoryId('Digital Marketing Fundamentals'),
        getCategoryId('Search Engine Optimization (SEO)'),
        getCategoryId('Social Media Marketing'),
        getCategoryId('Content & Email Marketing'),
        getCategoryId('Analytics & Performance Tracking')
      ],
      preferencesJson: {
        focus: ['SEO', 'Social Media', 'Content Marketing', 'All'],
        platforms: ['Google Ads', 'Facebook Ads', 'LinkedIn', 'Instagram']
      }
    },
    {
      name: 'Linux System Administrator',
      description: 'Manage and secure Linux servers and infrastructure.',
      goalKeywords: ['linux', 'sysadmin', 'system administrator', 'linux admin', 'server management'],
      difficultyLevel: 'INTERMEDIATE',
      estimatedMonths: 5,
      requiredCategoryIds: [
        getCategoryId('Linux Fundamentals'),
        getCategoryId('File System & Permissions'),
        getCategoryId('Process & System Management'),
        getCategoryId('Shell Scripting'),
        getCategoryId('Linux Networking & Security')
      ],
      preferencesJson: {
        distribution: ['Ubuntu', 'CentOS/RHEL', 'Debian'],
        focus: ['Server Management', 'Security', 'Automation']
      }
    }
  ];

  for (const path of learningPaths) {
    // Check if learning path already exists
    const existing = await prisma.learningPath.findFirst({
      where: { name: path.name }
    });

    if (existing) {
      // Update existing
      const updated = await prisma.learningPath.update({
        where: { id: existing.id },
        data: path,
      });
      console.log(`✓ Updated learning path: ${updated.name}`);
    } else {
      // Create new
      const created = await prisma.learningPath.create({
        data: path,
      });
      console.log(`✓ Created learning path: ${created.name}`);
    }
  }

  console.log(`\n✅ Learning paths seeding complete! Created ${learningPaths.length} paths.`);
}

seedLearningPaths()
  .catch((e) => {
    console.error('Error seeding learning paths:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });