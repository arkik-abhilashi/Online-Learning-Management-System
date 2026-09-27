CREATE TABLE IF NOT EXISTS "StudentSessionProgress" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
    "sessionId" UUID REFERENCES "Session"(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("userId", "sessionId")
);
