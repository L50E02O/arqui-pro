/**
 * Registry de Tools para MCP Server
 * 
 * Este archivo centraliza todos los tools disponibles en el servidor.
 * Cada tool se registra aquí y se expone mediante JSON-RPC 2.0.
 * 
 * Uso:
 * - Importar getAllTools() para obtener lista de tools
 * - Usar getToolByName(name) para obtener un tool específico
 * - Usar listTools() para obtener descripción de todos los tools
 */

import { MCPTool } from '../types/mcp.types.js';
import { buscarVerificacionTool } from './buscar_verificacion.tool.js';
import { esPendienteTool } from './es_pendiente.tool.js';
import { cambiarAVerificadoTool } from './cambiar_a_verificado.tool.js';

/**
 * Array con todos los tools disponibles en el servidor MCP
 */
const ALL_TOOLS: MCPTool[] = [
  buscarVerificacionTool,
  esPendienteTool,
  cambiarAVerificadoTool,
];

/**
 * Obtener todos los tools registrados
 * @returns Array de MCPTool
 */
export const getAllTools = (): MCPTool[] => {
  return ALL_TOOLS;
};

/**
 * Obtener un tool por nombre
 * @param name - Nombre del tool
 * @returns MCPTool si existe, undefined en caso contrario
 */
export const getToolByName = (name: string): MCPTool | undefined => {
  return ALL_TOOLS.find((tool) => tool.name === name);
};

/**
 * Obtener lista de tools disponibles con descripción
 * Útil para métodos como "list_tools" en MCP
 * @returns Array con información de cada tool
 */
export const listTools = (): Array<{
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
}> => {
  return ALL_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    outputSchema: tool.outputSchema,
  }));
};

/**
 * Obtener nombres de todos los tools
 * Útil para validaciones rápidas
 * @returns Array de nombres de tools
 */
export const getToolNames = (): string[] => {
  return ALL_TOOLS.map((tool) => tool.name);
};

/**
 * Contar cuántos tools están registrados
 * @returns Número de tools disponibles
 */
export const getToolCount = (): number => {
  return ALL_TOOLS.length;
};

/**
 * Validar si un nombre de tool es válido
 * @param toolName - Nombre del tool
 * @returns true si existe, false en caso contrario
 */
export const isValidToolName = (toolName: string): boolean => {
  return getToolNames().includes(toolName);
};
