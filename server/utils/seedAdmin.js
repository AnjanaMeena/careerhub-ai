const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin');
const Opportunity = require('../models/Opportunity');
const Student = require('../models/Student');

const seedAdminAndData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerhub_ai';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB');

    // 1. Seed Admin Account
    const existingAdmin = await Admin.findOne({ email: 'admin@careerhub.ai' });
    let adminId;

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      const admin = await Admin.create({
        name: 'CareerHub Admin',
        email: 'admin@careerhub.ai',
        password: hashedPassword,
        role: 'Admin'
      });
      adminId = admin._id;
      console.log('✅ Admin Account Created Successfully:');
      console.log('   Email: admin@careerhub.ai');
      console.log('   Password: Admin@123');
    } else {
      adminId = existingAdmin._id;
      console.log('ℹ️ Admin Account already exists (admin@careerhub.ai)');
    }

    // 1b. Seed Demo Student Account
    const existingStudent = await Student.findOne({ email: 'student@careerhub.ai' });
    if (!existingStudent) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Student@123', salt);

      await Student.create({
        name: 'Alex Morgan',
        email: 'student@careerhub.ai',
        password: hashedPassword,
        phone: '+1 555-0199',
        university: 'State University',
        department: 'Computer Science',
        year: 'Final Year',
        cgpa: 8.5,
        skills: ['React', 'JavaScript', 'Node.js', 'Python', 'Data Structures', 'Git'],
        interests: ['Software Development', 'Artificial Intelligence', 'Full Stack'],
        linkedin: 'https://linkedin.com/in/alex-morgan',
        github: 'https://github.com/alex-morgan',
        portfolio: 'https://alexmorgan.dev',
        profileCompletion: 95,
        role: 'Student'
      });
      console.log('✅ Demo Student Account Created Successfully:');
      console.log('   Email: student@careerhub.ai');
      console.log('   Password: Student@123');
    } else {
      console.log('ℹ️ Demo Student Account already exists (student@careerhub.ai)');
    }

    // 2. Seed Sample Opportunities if DB is empty
    const opCount = await Opportunity.countDocuments();
    if (opCount === 0) {
      const sampleOpportunities = [
        {
          companyName: 'Google',
          role: 'Software Engineering Intern (Summer 2026)',
          category: 'Internship',
          description: 'Join Google for an intensive summer internship working on scalable backend microservices, Search algorithms, and Cloud infrastructure.',
          eligibility: 'B.Tech / B.E. / M.Tech in CS, IT, or related field with 7.5+ CGPA',
          requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'Python', 'C++'],
          cgpaRequirement: 7.5,
          location: 'Bangalore / Hyderabad / Remote',
          stipendSalary: '₹1,20,000 / month',
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          applyLink: 'https://careers.google.com/jobs/results/',
          createdBy: adminId
        },
        {
          companyName: 'Microsoft',
          role: 'Full Stack Software Engineer',
          category: 'Placement',
          description: 'Full-time opportunity to engineer next-generation Azure Cloud & Developer Tools using React, Node.js, C#, and TypeScript.',
          eligibility: 'Graduating Batch 2026 with 8.0+ CGPA and zero active backlogs',
          requiredSkills: ['React', 'JavaScript', 'Node.js', 'TypeScript', 'SQL'],
          cgpaRequirement: 8.0,
          location: 'Hyderabad / Bangalore',
          stipendSalary: '₹22,00,000 / annum',
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          applyLink: 'https://careers.microsoft.com',
          createdBy: adminId
        },
        {
          companyName: 'Hacktoberfest 2026',
          role: 'Open Source Developer Hackathon',
          category: 'Hackathon',
          description: 'Global month-long celebration of open source software. Submit 4 valid pull requests to win digital badges and swag!',
          eligibility: 'Open to all university students across any department and year',
          requiredSkills: ['Git', 'GitHub', 'JavaScript', 'HTML/CSS', 'Python'],
          cgpaRequirement: 0,
          location: 'Global Virtual / Remote',
          stipendSalary: 'Swag Kit + $1,000 Cash Prizes',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          applyLink: 'https://hacktoberfest.com',
          createdBy: adminId
        },
        {
          companyName: 'AWS Academy',
          role: 'Cloud Architecture & DevOps Masterclass',
          category: 'Workshop',
          description: 'Hands-on 3-day certified workshop covering AWS EC2, S3, Lambda, Docker, and Kubernetes deployment pipelines.',
          eligibility: 'Open for 2nd, 3rd, and 4th year Engineering students',
          requiredSkills: ['Linux', 'Docker', 'AWS', 'Networking'],
          cgpaRequirement: 6.0,
          location: 'Campus Auditorium & Live Stream',
          stipendSalary: 'Free Certification Voucher included',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          applyLink: 'https://aws.amazon.com/training/',
          createdBy: adminId
        },
        {
          companyName: 'NVIDIA Graduate Research Fellowship',
          role: 'AI & GPU Computing Scholar',
          category: 'Scholarship',
          description: 'Financial research grant supporting top undergraduate and master students pursuing Artificial Intelligence and Computer Vision.',
          eligibility: 'CGPA 8.5+ with research publications or major AI projects',
          requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'CUDA', 'Deep Learning'],
          cgpaRequirement: 8.5,
          location: 'Remote Research Grant',
          stipendSalary: '₹3,50,000 Grant',
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          applyLink: 'https://www.nvidia.com/en-us/research/graduate-fellowships/',
          createdBy: adminId
        }
      ];

      await Opportunity.insertMany(sampleOpportunities);
      console.log('✅ Seeded 5 initial opportunities for Google, Microsoft, AWS, Hacktoberfest, NVIDIA!');
    }

    console.log('🚀 Seed Process Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seed script execution:', error);
    process.exit(1);
  }
};

seedAdminAndData();
