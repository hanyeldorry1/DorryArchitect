import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").default("architect"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type"), // residential, commercial, etc.
  landArea: real("land_area"), // in square meters
  budget: integer("budget"), // in EGP
  latitude: real("latitude"),
  longitude: real("longitude"),
  location: text("location"), // e.g., "New Cairo"
  culturalStyle: text("cultural_style"), // e.g., "Islamic"
  status: text("status").default("concept"), // concept, in_progress, review, completed
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  userId: integer("user_id").notNull().references(() => users.id), // Foreign key to users
});

// Design model
export const designs = pgTable("designs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id), // Foreign key to projects
  designData: jsonb("design_data").notNull(), // Contains all design elements
  environmentalData: jsonb("environmental_data"), // Wind, sun analysis
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bill of Quantities model
export const boqs = pgTable("boqs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id), // Foreign key to projects
  items: jsonb("items").notNull(), // Array of materials, quantities, and prices
  totalCost: integer("total_cost").notNull(), // in EGP
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat message model
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id), // Foreign key to projects
  sender: text("sender").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  designChanges: jsonb("design_changes"), // Optional changes made by this message
});

// User relations
export const usersRelations = relations(users, ({ many }: { many: any }) => ({
  projects: many(projects),
}));

// Project relations
export const projectsRelations = relations(projects, ({ one, many }: { one: any; many: any }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  designs: many(designs),
  boqs: many(boqs),
  chatMessages: many(chatMessages),
}));

// Design relations
export const designsRelations = relations(designs, ({ one }: { one: any }) => ({
  project: one(projects, {
    fields: [designs.projectId],
    references: [projects.id],
  }),
}));

// BOQ relations
export const boqsRelations = relations(boqs, ({ one }: { one: any }) => ({
  project: one(projects, {
    fields: [boqs.projectId],
    references: [projects.id],
  }),
}));

// Chat message relations
export const chatMessagesRelations = relations(chatMessages, ({ one }: { one: any }) => ({
  project: one(projects, {
    fields: [chatMessages.projectId],
    references: [projects.id],
  }),
}));

// Schemas for insert operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
});

export const insertProjectSchema = createInsertSchema(projects)
  .omit({ createdAt: true, updatedAt: true })
  .partial({ userId: true });

export const insertDesignSchema = createInsertSchema(designs).pick({
  projectId: true,
  designData: true,
  environmentalData: true,
  version: true,
});

export const insertBoqSchema = createInsertSchema(boqs).pick({
  projectId: true,
  items: true,
  totalCost: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  projectId: true,
  sender: true,
  content: true,
  designChanges: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Design = typeof designs.$inferSelect;
export type InsertDesign = z.infer<typeof insertDesignSchema>;

export type BOQ = typeof boqs.$inferSelect;
export type InsertBOQ = z.infer<typeof insertBoqSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Simplified weather data structure
export interface WeatherData {
  windDirection: string;
  windSpeed: number;
  solarIrradiance: number;
  temperature: number;
  humidity: number;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  timestamp: Date;
}

// Room type interface
export interface Room {
  id: string;
  name: string;
  type: string; // living_room, bedroom, kitchen, bathroom, etc.
  area: number; // in square meters
  width: number;
  height: number;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  isWetArea: boolean;
}

// Design data structure
export interface DesignData {
  rooms: Room[];
  totalArea: number;
  dimensions: {
    width: number;
    height: number;
  };
}

// BOQ item interface
export interface BOQItem {
  category: string; // e.g., "Concrete & Foundation", "Structural Elements"
  name: string;
  description: string;
  unit: string; // e.g., "m²", "m³", "piece"
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  options?: {
    unitPrice: number;
    totalPrice: number;
    supplier: string;
  }[];
}
