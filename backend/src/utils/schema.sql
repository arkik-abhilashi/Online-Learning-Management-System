-- Run once to create all tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "Role" AS ENUM ('ADMIN', 'INSTRUCTOR', 'STUDENT');
CREATE TYPE "Level" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "fullName" VARCHAR(255) NOT NULL,
  role "Role" DEFAULT 'STUDENT',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Category" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE "Course" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  "categoryId" UUID REFERENCES "Category"(id) ON DELETE SET NULL,
  "instructorId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
  "imageUrl" TEXT,
  price FLOAT DEFAULT 0,
  level "Level" DEFAULT 'BEGINNER',
  "isPublished" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Enrollment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES "Course"(id) ON DELETE CASCADE,
  "enrolledAt" TIMESTAMP DEFAULT NOW(),
  progress FLOAT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  "certificateIssued" BOOLEAN DEFAULT false,
  UNIQUE("userId", "courseId")
);

CREATE TABLE "Session" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "courseId" UUID REFERENCES "Course"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "videoUrl" TEXT,
  "order" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Attachment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sessionId" UUID REFERENCES "Session"(id) ON DELETE CASCADE,
  "fileName" VARCHAR(255) NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileType" VARCHAR(100)
);

CREATE TABLE "Quiz" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sessionId" UUID REFERENCES "Session"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE "Question" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "quizId" UUID REFERENCES "Quiz"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "order" INT DEFAULT 0,
  marks FLOAT DEFAULT 1
);

CREATE TABLE "Option" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "questionId" UUID REFERENCES "Question"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "isCorrect" BOOLEAN DEFAULT false
);

CREATE TABLE "StudentQuizAttempt" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
  "quizId" UUID REFERENCES "Quiz"(id) ON DELETE CASCADE,
  score FLOAT,
  "totalMarks" FLOAT,
  "submittedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "StudentAnswer" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "attemptId" UUID REFERENCES "StudentQuizAttempt"(id) ON DELETE CASCADE,
  "questionId" UUID REFERENCES "Question"(id) ON DELETE CASCADE,
  "selectedOptionId" UUID REFERENCES "Option"(id) ON DELETE SET NULL
);

CREATE TABLE "Certificate" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES "Course"(id) ON DELETE CASCADE,
  "issueDate" TIMESTAMP DEFAULT NOW(),
  "certificateCode" VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE "Notification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  type VARCHAR(50),
  "referenceId" UUID,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
