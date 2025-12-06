/**
 * System Prompt Renderer
 * 
 * Renders Handlebars-style templates with Level data to generate system prompts for AI conversations.
 * 
 * @example
 * ```typescript
 * import { renderSystemPrompt } from './helpers/promptRenderer';
 * import { LEVELS } from './const/levels';
 * 
 * const level = LEVELS[0];
 * const prompt = await renderSystemPrompt(
 *   '/assets/baseconvotemplate.md',
 *   level,
 *   {
 *     easy_mode: false,
 *     opening_line: "Welcome! How can I help you today?",
 *     conversation_flow: "1. Greeting\n2. Order\n3. Payment"
 *   }
 * );
 * ```
 */

import { Level } from '../types/Level';

interface InterferenceData {
  grammar?: string[];
  pronunciation?: string[];
  false_cognates?: string[];
  word_order?: string[];
  cultural_pragmatics?: string[];
}

interface TemplateContext {
  character_name: string;
  character_role: string;
  target_language_name: string;
  target_language: string;
  scenario_setting: string;
  character_persona: string;
  native_language_name: string;
  native_language: string;
  proficiency_level: string;
  easy_mode: boolean;
  interference?: InterferenceData;
  objectives: Array<{
    description: string;
    required?: boolean;
    hint?: string;
  }>;
  conversation_flow?: string;
  cultural_notes?: string;
  opening_line?: string;
}

/**
 * Renders a Handlebars-style template with the provided context
 */
function renderTemplate(template: string, context: TemplateContext): string {
  let result = template;

  // Helper function to get nested property value
  const getNestedValue = (path: string, ctx: any): any => {
    const parts = path.split('.');
    let value = ctx;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    return value;
  };

  // Replace simple variables: {{variable}}
  result = result.replace(/\{\{([^#\/][^}]*)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(trimmedPath, context);
    return value !== undefined ? String(value) : '';
  });

  // Handle {{#if condition}} ... {{else}} ... {{/if}}
  result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, trueBlock, falseBlock) => {
    const trimmedCondition = condition.trim();
    const value = getNestedValue(trimmedCondition, context);
    const isTruthy = value !== undefined && value !== null && value !== false && value !== '';
    return isTruthy ? trueBlock : (falseBlock || '');
  });

  // Handle {{#if condition}} ... {{/if}} (without else)
  result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, block) => {
    const trimmedCondition = condition.trim();
    const value = getNestedValue(trimmedCondition, context);
    const isTruthy = value !== undefined && value !== null && value !== false && value !== '';
    return isTruthy ? block : '';
  });

  // Handle {{#each array}} ... {{/each}}
  result = result.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayPath, block) => {
    const trimmedPath = arrayPath.trim();
    const array = getNestedValue(trimmedPath, context);
    
    if (!Array.isArray(array) || array.length === 0) {
      return '';
    }

    return array.map((item: any, index: number) => {
      let itemBlock = block;
      
      // Replace {{this}} with the item value (if it's a string)
      if (typeof item === 'string') {
        itemBlock = itemBlock.replace(/\{\{this\}\}/g, item);
      } else if (typeof item === 'object' && item !== null) {
        // If item is an object, replace {{this.property}} patterns
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g');
          itemBlock = itemBlock.replace(regex, String(item[key] || ''));
        });
        // Also replace {{this}} with a string representation if needed
        itemBlock = itemBlock.replace(/\{\{this\}\}/g, JSON.stringify(item));
      }
      
      // Replace {{@index}} with the index (1-based for template)
      itemBlock = itemBlock.replace(/\{\{@index\}\}/g, String(index + 1));
      
      // Replace other variables in the block (try item properties first, then context)
      itemBlock = itemBlock.replace(/\{\{([^}]+)\}\}/g, (varMatch: string, varPath: string) => {
        const trimmedVarPath = varPath.trim();
        // Skip if it's a this. or @index pattern (already handled above)
        if (trimmedVarPath.startsWith('this.') || trimmedVarPath === '@index') {
          return varMatch; // Return as-is, will be handled by previous replacements
        }
        // Try to get from item first (if it's an object), then from context
        if (typeof item === 'object' && item !== null) {
          const itemValue = getNestedValue(trimmedVarPath, item);
          if (itemValue !== undefined) {
            return String(itemValue);
          }
        }
        const contextValue = getNestedValue(trimmedVarPath, context);
        return contextValue !== undefined ? String(contextValue) : '';
      });
      
      return itemBlock;
    }).join('');
  });

  // Final pass to replace any remaining variables
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(trimmedPath, context);
    return value !== undefined ? String(value) : '';
  });

  return result;
}

/**
 * Loads interference data based on native and target language codes
 * This is a simplified version - in production, you'd load from the YAML file
 */
function getInterferenceData(
  nativeLanguageCode: string,
  targetLanguageCode: string
): InterferenceData | undefined {
  // This is a placeholder - in production, you'd parse the language_interference.yaml
  // For now, return undefined to skip interference sections
  // You can extend this to load and parse the YAML file
  return undefined;
}

/**
 * Maps a Level object to a TemplateContext for rendering
 */
function mapLevelToContext(level: Level, additionalData?: {
  easy_mode?: boolean;
  interference?: InterferenceData;
  conversation_flow?: string;
  cultural_notes?: string;
  opening_line?: string;
}): TemplateContext {
  // Map proficiency level to readable format
  const proficiencyMap: Record<string, string> = {
    '1': 'Beginner',
    '2': 'Intermediate',
    '3': 'Intermediate',
    '4': 'Advanced',
    '5': 'Advanced'
  };

  // Get interference data if not provided
  const interference = additionalData?.interference || 
    getInterferenceData(String(level.native_language.code), String(level.target_language.code));

  return {
    character_name: level.character_name,
    character_role: level.character_role,
    target_language_name: level.target_language.display,
    target_language: String(level.target_language.code),
    scenario_setting: level.scenario_setting,
    character_persona: level.character_persona,
    native_language_name: level.native_language.display,
    native_language: String(level.native_language.code),
    proficiency_level: proficiencyMap[level.proficiency_level] || level.proficiency_level,
    easy_mode: additionalData?.easy_mode || false,
    interference,
    objectives: level.objectives.map(obj => ({
      description: obj.description,
      required: true, // Default to required
      hint: `Complete: ${obj.display_text}` // Use display_text as hint
    })),
    conversation_flow: additionalData?.conversation_flow,
    cultural_notes: additionalData?.cultural_notes,
    opening_line: additionalData?.opening_line
  };
}

/**
 * Renders a system prompt template file with Level data
 * 
 * @param templatePath - Path to the template file (relative to public or absolute)
 * @param level - The Level object to use for rendering
 * @param additionalData - Optional additional data (easy_mode, interference, etc.)
 * @returns Promise that resolves to the rendered prompt text
 */
export async function renderSystemPrompt(
  templatePath: string,
  level: Level,
  additionalData?: {
    easy_mode?: boolean;
    interference?: InterferenceData;
    conversation_flow?: string;
    cultural_notes?: string;
    opening_line?: string;
  }
): Promise<string> {
  try {
    // Load template file
    // In a React app, files in public folder can be fetched directly
    let template: string;
    
    // Normalize the path
    let normalizedPath = templatePath;
    
    // If path doesn't start with /, assume it's relative to public
    if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('http')) {
      normalizedPath = '/' + normalizedPath;
    }
    
    // Handle paths that reference src/assets - redirect to public/assets
    if (normalizedPath.includes('src/assets/')) {
      normalizedPath = normalizedPath.replace('src/assets/', '/assets/');
    }
    
    try {
      const response = await fetch(normalizedPath);
      if (!response.ok) {
        throw new Error(`Template not found at ${normalizedPath} (${response.status})`);
      }
      template = await response.text();
    } catch (error) {
      throw new Error(`Could not load template from ${normalizedPath}: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Map level to context
    const context = mapLevelToContext(level, additionalData);

    // Render template
    return renderTemplate(template, context);
  } catch (error) {
    console.error('Error rendering system prompt:', error);
    throw error;
  }
}

/**
 * Synchronous version that requires the template to be pre-loaded
 * Useful when you have the template content already
 */
export function renderSystemPromptSync(
  template: string,
  level: Level,
  additionalData?: {
    easy_mode?: boolean;
    interference?: InterferenceData;
    conversation_flow?: string;
    cultural_notes?: string;
    opening_line?: string;
  }
): string {
  const context = mapLevelToContext(level, additionalData);
  return renderTemplate(template, context);
}
