import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getEnvironmentalData } from "./services/weatherService";
import { generateBOQ, calculateTotalCost, groupBOQByCategory } from "./services/pricingService";
import { synthesizeSpeech, isTTSAvailable } from "./services/ttsService";
import { insertProjectSchema, insertDesignSchema, insertChatMessageSchema, insertBoqSchema, DesignData, Room } from "@shared/schema";
import { z } from "zod";

// Authentication middleware
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Project routes
  app.post("/api/projects", ensureAuthenticated, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      
      // Set the userId to the authenticated user
      projectData.userId = req.user!.id;
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  });
  
  app.get("/api/projects", ensureAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getUserProjects(req.user!.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  
  app.get("/api/projects/:id", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });
  
  app.put("/api/projects/:id", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this project" });
      }
      
      const projectData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(projectId, projectData);
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update project" });
      }
    }
  });
  
  app.delete("/api/projects/:id", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to delete this project" });
      }
      
      await storage.deleteProject(projectId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  
  // Environmental analysis routes
  app.get("/api/environmental-analysis", async (req, res) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      
      const environmentalData = await getEnvironmentalData(latitude, longitude);
      res.json(environmentalData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch environmental data" });
    }
  });
  
  // Design routes
  app.post("/api/projects/:id/designs", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to add designs to this project" });
      }
      
      // Parse the design data
      const designData = insertDesignSchema.parse({
        ...req.body,
        projectId
      });
      
      // Get the latest design version
      const latestDesign = await storage.getLatestDesign(projectId);
      const version = latestDesign ? latestDesign.version + 1 : 1;
      
      // Create the design
      const design = await storage.createDesign({
        ...designData,
        version
      });
      
      res.status(201).json(design);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid design data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create design" });
      }
    }
  });
  
  app.get("/api/projects/:id/designs", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view designs for this project" });
      }
      
      const designs = await storage.getDesignVersions(projectId);
      res.json(designs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });
  
  app.get("/api/projects/:id/designs/latest", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view designs for this project" });
      }
      
      const design = await storage.getLatestDesign(projectId);
      
      if (!design) {
        return res.status(404).json({ message: "No designs found for this project" });
      }
      
      res.json(design);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest design" });
    }
  });
  
  // Generate initial design
  app.post("/api/projects/:id/generate-design", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission for this project" });
      }
      
      if (!project.landArea || !project.latitude || !project.longitude) {
        return res.status(400).json({ 
          message: "Project must have land area and location coordinates to generate a design" 
        });
      }
      
      // Get environmental data
      const environmentalData = await getEnvironmentalData(project.latitude, project.longitude);
      
      // Generate a simple design based on land area and environmental data
      // In a real application, this would use more sophisticated algorithms and AI
      
      // Determine orientation based on wind direction
      let orientation = 0;
      if (environmentalData.windDirection.includes('North')) {
        orientation = 0;
      } else if (environmentalData.windDirection.includes('East')) {
        orientation = 90;
      } else if (environmentalData.windDirection.includes('South')) {
        orientation = 180;
      } else if (environmentalData.windDirection.includes('West')) {
        orientation = 270;
      }
      
      // Simple design generation algorithm
      const landArea = project.landArea;
      const buildingWidth = Math.sqrt(landArea * 0.6); // Using 60% of land area
      const buildingHeight = buildingWidth * 1.5; // Rectangular building
      
      // Create rooms
      const rooms: Room[] = [
        {
          id: '1',
          name: 'Living Room',
          type: 'living_room',
          area: landArea * 0.25,
          width: buildingWidth * 0.7,
          height: buildingHeight * 0.4,
          position: { x: 10, y: 10 },
          rotation: 0,
          isWetArea: false
        },
        {
          id: '2',
          name: 'Kitchen',
          type: 'kitchen',
          area: landArea * 0.1,
          width: buildingWidth * 0.3,
          height: buildingHeight * 0.3,
          position: { 
            // Position kitchen opposite to wind direction
            x: orientation === 0 || orientation === 180 ? 10 + buildingWidth * 0.7 : 10,
            y: orientation === 90 || orientation === 270 ? 10 + buildingHeight * 0.4 : 10
          },
          rotation: 0,
          isWetArea: true
        },
        {
          id: '3',
          name: 'Bedroom',
          type: 'bedroom',
          area: landArea * 0.15,
          width: buildingWidth * 0.5,
          height: buildingHeight * 0.3,
          position: { x: 10, y: 10 + buildingHeight * 0.4 },
          rotation: 0,
          isWetArea: false
        },
        {
          id: '4',
          name: 'Bathroom',
          type: 'bathroom',
          area: landArea * 0.05,
          width: buildingWidth * 0.3,
          height: buildingHeight * 0.2,
          position: { 
            // Position bathroom opposite to wind direction
            x: orientation === 0 || orientation === 180 ? buildingWidth * 0.7 : 10,
            y: orientation === 90 || orientation === 270 ? buildingHeight * 0.4 : 10 + buildingHeight * 0.4
          },
          rotation: 0,
          isWetArea: true
        }
      ];
      
      const designData: DesignData = {
        rooms,
        totalArea: landArea * 0.6, // Using 60% of land area
        dimensions: {
          width: buildingWidth,
          height: buildingHeight
        }
      };
      
      // Create the design in storage
      const latestDesign = await storage.getLatestDesign(projectId);
      const version = latestDesign ? latestDesign.version + 1 : 1;
      
      const design = await storage.createDesign({
        projectId,
        designData,
        environmentalData,
        version
      });
      
      // Generate BOQ
      const boqItems = await generateBOQ(rooms, designData.totalArea);
      const totalCost = calculateTotalCost(boqItems);
      
      const boq = await storage.createBoq({
        projectId,
        items: boqItems,
        totalCost
      });
      
      // Add initial assistant message
      await storage.createChatMessage({
        projectId,
        sender: 'assistant',
        content: `Welcome to your ${project.name} project! I've analyzed the environmental conditions for your location and generated an initial conceptual design. The main living areas face ${environmentalData.windDirection === 'North-East' ? 'north-east' : environmentalData.windDirection.toLowerCase()} to take advantage of natural lighting while keeping wet areas opposite to the prevailing wind direction.`,
        designChanges: null
      });
      
      res.status(201).json({
        design,
        boq,
        environmentalData
      });
    } catch (error) {
      console.error("Error generating design:", error);
      res.status(500).json({ message: "Failed to generate design" });
    }
  });
  
  // BOQ routes
  app.get("/api/projects/:id/boq", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view BOQ for this project" });
      }
      
      const boq = await storage.getBoq(projectId);
      
      if (!boq) {
        return res.status(404).json({ message: "No BOQ found for this project" });
      }
      
      // If a budget is provided, check for warnings
      let budgetWarning = null;
      if (project.budget && boq.totalCost > project.budget) {
        budgetWarning = {
          message: "The estimated cost exceeds the project budget",
          difference: boq.totalCost - project.budget
        };
      }
      
      res.json({
        boq,
        categorySummary: groupBOQByCategory(boq.items),
        budgetWarning
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BOQ" });
    }
  });
  
  // Chat routes
  app.post("/api/projects/:id/chat", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission for this project" });
      }
      
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        projectId
      });
      
      const message = await storage.createChatMessage(messageData);
      
      // If this is a user message, generate an AI response
      // In a real application, this would use NLP and design modification algorithms
      if (messageData.sender === 'user') {
        const userMessage = messageData.content.toLowerCase();
        let assistantResponse = "I've received your message and will process it.";
        let designChanges = null;
        
        // Get the latest design
        const latestDesign = await storage.getLatestDesign(projectId);
        
        if (latestDesign) {
          const design = JSON.parse(JSON.stringify(latestDesign));
          const designData = design.designData as DesignData;
          
          // Simple keyword matching for demo purposes
          // In a real application, this would use NLP and more sophisticated algorithms
          if (userMessage.includes('larger') || userMessage.includes('bigger')) {
            // Determine which room to enlarge
            let roomToEnlarge = '';
            if (userMessage.includes('living room')) roomToEnlarge = 'living_room';
            else if (userMessage.includes('kitchen')) roomToEnlarge = 'kitchen';
            else if (userMessage.includes('bedroom')) roomToEnlarge = 'bedroom';
            else if (userMessage.includes('bathroom')) roomToEnlarge = 'bathroom';
            
            if (roomToEnlarge) {
              // Modify the room size
              designData.rooms = designData.rooms.map(room => {
                if (room.type === roomToEnlarge) {
                  const newArea = room.area * 1.2; // Increase by 20%
                  const areaChange = newArea - room.area;
                  
                  return {
                    ...room,
                    area: newArea,
                    width: room.width * 1.1,
                    height: room.height * 1.1
                  };
                }
                return room;
              });
              
              // Update total area
              designData.totalArea += designData.rooms.find(r => r.type === roomToEnlarge)?.area * 0.2 || 0;
              
              designChanges = {
                roomModified: roomToEnlarge,
                sizeIncrease: true
              };
              
              // Create a new design version
              const newDesign = await storage.createDesign({
                projectId,
                designData,
                environmentalData: design.environmentalData,
                version: design.version + 1
              });
              
              // Recalculate BOQ
              const boqItems = await generateBOQ(designData.rooms, designData.totalArea);
              const totalCost = calculateTotalCost(boqItems);
              const oldBoq = await storage.getBoq(projectId);
              
              let costDifference = 0;
              if (oldBoq) {
                costDifference = totalCost - oldBoq.totalCost;
                
                // Update the BOQ
                await storage.updateBoq(oldBoq.id, {
                  items: boqItems,
                  totalCost
                });
              } else {
                // Create a new BOQ
                await storage.createBoq({
                  projectId,
                  items: boqItems,
                  totalCost
                });
              }
              
              // Create appropriate response
              const roomName = designData.rooms.find(r => r.type === roomToEnlarge)?.name || roomToEnlarge;
              assistantResponse = `I've updated the ${roomName.toLowerCase()} dimensions. This increased the total built area by ${Math.round(designData.rooms.find(r => r.type === roomToEnlarge)?.area * 0.2 || 0)} m². The budget has been adjusted accordingly with an increase of ${Math.round(costDifference)} EGP. Would you like to see the modified floor plan?`;
            }
          }
        }
        
        // Create assistant response
        const assistantMessage = await storage.createChatMessage({
          projectId,
          sender: 'assistant',
          content: assistantResponse,
          designChanges
        });
        
        // Generate TTS if requested
        let speechUrl = null;
        if (req.body.tts === true) {
          speechUrl = await synthesizeSpeech(assistantResponse);
        }
        
        res.status(201).json({
          userMessage: message,
          assistantMessage,
          speechUrl
        });
      } else {
        res.status(201).json(message);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        console.error("Chat error:", error);
        res.status(500).json({ message: "Failed to process chat message" });
      }
    }
  });
  
  app.get("/api/projects/:id/chat", ensureAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view chat for this project" });
      }
      
      const messages = await storage.getProjectChatHistory(projectId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });
  
  // TTS status endpoint
  app.get("/api/tts/status", (req, res) => {
    res.json({
      available: isTTSAvailable()
    });
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
