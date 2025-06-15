import { users, projects, designs, boqs, chatMessages, type User, type InsertUser, type Project, type InsertProject, type Design, type InsertDesign, type BOQ, type InsertBOQ, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getUserProjects(userId: number): Promise<Project[]>;
  updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Design operations
  createDesign(design: InsertDesign): Promise<Design>;
  getDesign(id: number): Promise<Design | undefined>;
  getLatestDesign(projectId: number): Promise<Design | undefined>;
  getDesignVersions(projectId: number): Promise<Design[]>;
  updateDesign(id: number, data: Partial<InsertDesign>): Promise<Design | undefined>;
  
  // BOQ operations
  createBoq(boq: InsertBOQ): Promise<BOQ>;
  getBoq(projectId: number): Promise<BOQ | undefined>;
  updateBoq(id: number, data: Partial<InsertBOQ>): Promise<BOQ | undefined>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getProjectChatHistory(projectId: number): Promise<ChatMessage[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        createdAt: now
      })
      .returning();
    return user;
  }
  
  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const now = new Date();
    const [newProject] = await db
      .insert(projects)
      .values({
        ...project,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newProject;
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  
  async getUserProjects(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }
  
  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return !!result;
  }
  
  // Design operations
  async createDesign(design: InsertDesign): Promise<Design> {
    const now = new Date();
    const [newDesign] = await db
      .insert(designs)
      .values({
        ...design,
        createdAt: now
      })
      .returning();
    return newDesign;
  }
  
  async getDesign(id: number): Promise<Design | undefined> {
    const [design] = await db.select().from(designs).where(eq(designs.id, id));
    return design;
  }
  
  async getLatestDesign(projectId: number): Promise<Design | undefined> {
    const [latestDesign] = await db
      .select()
      .from(designs)
      .where(eq(designs.projectId, projectId))
      .orderBy(desc(designs.version))
      .limit(1);
    return latestDesign;
  }
  
  async getDesignVersions(projectId: number): Promise<Design[]> {
    return await db
      .select()
      .from(designs)
      .where(eq(designs.projectId, projectId))
      .orderBy(desc(designs.version));
  }
  
  async updateDesign(id: number, data: Partial<InsertDesign>): Promise<Design | undefined> {
    const [updatedDesign] = await db
      .update(designs)
      .set(data)
      .where(eq(designs.id, id))
      .returning();
    return updatedDesign;
  }
  
  // BOQ operations
  async createBoq(boq: InsertBOQ): Promise<BOQ> {
    const now = new Date();
    const [newBoq] = await db
      .insert(boqs)
      .values({
        ...boq,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newBoq;
  }
  
  async getBoq(projectId: number): Promise<BOQ | undefined> {
    const [boq] = await db
      .select()
      .from(boqs)
      .where(eq(boqs.projectId, projectId));
    return boq;
  }
  
  async updateBoq(id: number, data: Partial<InsertBOQ>): Promise<BOQ | undefined> {
    const [updatedBoq] = await db
      .update(boqs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(boqs.id, id))
      .returning();
    return updatedBoq;
  }
  
  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const now = new Date();
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        ...message,
        timestamp: now
      })
      .returning();
    return newMessage;
  }
  
  async getProjectChatHistory(projectId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.projectId, projectId))
      .orderBy(chatMessages.timestamp);
  }
}

export const storage = new DatabaseStorage();