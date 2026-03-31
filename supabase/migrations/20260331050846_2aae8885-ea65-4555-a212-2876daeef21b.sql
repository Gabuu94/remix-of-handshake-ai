
-- Clean referencing tables first
DELETE FROM payments;
DELETE FROM subscriptions;
DELETE FROM task_completions;

-- Reset plans with dollar prices (stored in cents)
DELETE FROM plans;
INSERT INTO plans (name, description, price, duration_days, tasks_limit) VALUES
  ('Beginner', 'Perfect for those starting their journey', 235, 30, 9),
  ('Average Skilled', 'Ideal for experienced task performers', 465, 30, 15),
  ('Expert', 'For dedicated professionals', 698, 30, 25),
  ('Elite', 'Maximum earnings potential', 1008, 30, 40);

-- Reset tasks with 25+ surveys, rewards in cents
DELETE FROM tasks;
INSERT INTO tasks (title, description, category, difficulty, reward, is_active, requires_subscription) VALUES
  ('Text Annotation', 'Tag and label text data', 'Data Annotation', 'easy', 175, true, false),
  ('Content Classification', 'Categorize content items', 'AI Evaluation', 'easy', 195, true, false),
  ('Data Categorization', 'Organize data efficiently', 'Data Annotation', 'medium', 230, true, true),
  ('Pattern Recognition', 'Identify data patterns', 'AI Evaluation', 'medium', 315, true, true),
  ('Sentence Arrangement', 'Arrange text sequences', 'Research & Writing', 'easy', 160, true, true),
  ('Refer & Earn', 'Invite friends to earn', 'Research & Writing', 'easy', 200, true, false),
  ('Customer Feedback Review', 'Analyze customer feedback responses', 'AI Evaluation', 'easy', 180, true, true),
  ('Math Reasoning Verification', 'Verify mathematical solutions', 'Mathematics', 'medium', 275, true, true),
  ('Code Quality Assessment', 'Review code for quality and bugs', 'Code Review', 'hard', 350, true, true),
  ('Product Review Analysis', 'Evaluate product review authenticity', 'AI Evaluation', 'easy', 190, true, true),
  ('Image Labeling', 'Label objects in images accurately', 'Data Annotation', 'easy', 165, true, true),
  ('Sentiment Analysis', 'Classify text sentiment', 'AI Evaluation', 'medium', 245, true, true),
  ('Translation Quality Check', 'Verify translation accuracy', 'Translation', 'medium', 280, true, true),
  ('Survey Response Validation', 'Validate survey data quality', 'Research & Writing', 'easy', 170, true, true),
  ('AI Chatbot Testing', 'Test AI chatbot responses', 'AI Evaluation', 'medium', 260, true, true),
  ('Document Summarization', 'Summarize lengthy documents', 'Research & Writing', 'medium', 290, true, true),
  ('Audio Transcription Review', 'Review audio transcriptions', 'Data Annotation', 'medium', 250, true, true),
  ('Spam Detection', 'Identify spam content', 'Safety & Alignment', 'easy', 185, true, true),
  ('Creative Writing Prompt', 'Write creative content from prompts', 'Creative Writing', 'medium', 300, true, true),
  ('Data Entry Verification', 'Verify data entry accuracy', 'Data Annotation', 'easy', 155, true, true),
  ('Website Usability Survey', 'Evaluate website user experience', 'Research & Writing', 'easy', 195, true, true),
  ('Ad Copy Review', 'Review advertising copy quality', 'AI Evaluation', 'medium', 240, true, true),
  ('Social Media Analysis', 'Analyze social media trends', 'Research & Writing', 'medium', 270, true, true),
  ('Prompt Engineering Task', 'Craft effective AI prompts', 'Prompt Engineering', 'hard', 380, true, true),
  ('Safety Content Review', 'Review content for safety compliance', 'Safety & Alignment', 'hard', 400, true, true),
  ('Technical Documentation', 'Write technical documentation', 'Documentation', 'hard', 420, true, true),
  ('Language Pair Evaluation', 'Evaluate language translation pairs', 'Translation', 'medium', 265, true, true),
  ('Research Data Collection', 'Collect and organize research data', 'Research & Writing', 'medium', 255, true, true);

-- Update all existing profile balances to $10 signup bonus (1000 cents)
UPDATE profiles SET balance = 1000 WHERE welcome_bonus_claimed = true;
UPDATE profiles SET balance = 0 WHERE welcome_bonus_claimed = false;
