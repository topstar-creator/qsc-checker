import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  status: text("status").notNull().default("trialing"),
  storeCount: integer("store_count").notNull().default(0),
  trialEndsAt: integer("trial_ends_at", { mode: "timestamp" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  notifyEmail: integer("notify_email", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const stores = sqliteTable("stores", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  name: text("name").notNull(),
  code: text("code"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const userStoreAssignments = sqliteTable("user_store_assignments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id),
});

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const groupMemberships = sqliteTable("group_memberships", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id),
});

export const checkSheets = sqliteTable("check_sheets", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  checkSheetId: text("check_sheet_id")
    .notNull()
    .references(() => checkSheets.id),
  text: text("text").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull().default("score"),
  weight: real("weight").default(1),
  sortOrder: integer("sort_order").notNull(),
  required: integer("required", { mode: "boolean" }).default(true),
});

export const inspections = sqliteTable("inspections", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id),
  checkSheetId: text("check_sheet_id")
    .notNull()
    .references(() => checkSheets.id),
  inspectorId: text("inspector_id")
    .notNull()
    .references(() => users.id),
  totalScore: real("total_score"),
  comment: text("comment"),
  inspectedAt: integer("inspected_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const inspectionAnswers = sqliteTable("inspection_answers", {
  id: text("id").primaryKey(),
  inspectionId: text("inspection_id")
    .notNull()
    .references(() => inspections.id),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  score: real("score"),
  textAnswer: text("text_answer"),
  comment: text("comment"),
});

export const inspectionMedia = sqliteTable("inspection_media", {
  id: text("id").primaryKey(),
  inspectionId: text("inspection_id")
    .notNull()
    .references(() => inspections.id),
  questionId: text("question_id").references(() => questions.id),
  type: text("type").notNull(),
  url: text("url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id),
  inspectionId: text("inspection_id")
    .notNull()
    .references(() => inspections.id),
  totalScore: real("total_score").notNull(),
  aiSummary: text("ai_summary"),
  aiDiscussionPoints: text("ai_discussion_points"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const improvementCases = sqliteTable("improvement_cases", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id),
  reportId: text("report_id").references(() => reports.id),
  inspectionId: text("inspection_id").references(() => inspections.id),
  title: text("title").notNull(),
  issueItem: text("issue_item"),
  issueComment: text("issue_comment"),
  assigneeId: text("assignee_id").references(() => users.id),
  dueDate: integer("due_date", { mode: "timestamp" }),
  rootCause: text("root_cause"),
  actionPlan: text("action_plan"),
  implementation: text("implementation"),
  verificationResult: text("verification_result"),
  status: text("status").notNull().default("pending"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const caseMedia = sqliteTable("case_media", {
  id: text("id").primaryKey(),
  caseId: text("case_id")
    .notNull()
    .references(() => improvementCases.id),
  type: text("type").notNull(),
  purpose: text("purpose").notNull(),
  url: text("url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const caseStatusHistory = sqliteTable("case_status_history", {
  id: text("id").primaryKey(),
  caseId: text("case_id")
    .notNull()
    .references(() => improvementCases.id),
  status: text("status").notNull(),
  comment: text("comment"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const aiCache = sqliteTable("ai_cache", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const companiesRelations = relations(companies, ({ many, one }) => ({
  users: many(users),
  stores: many(stores),
  groups: many(groups),
  subscription: one(subscriptions),
}));

export type { UserRole, CaseStatus, RankingType, RankingPeriod } from "@/lib/types";
