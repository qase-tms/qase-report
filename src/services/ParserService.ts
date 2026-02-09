import { z } from 'zod'

/**
 * Service for parsing and validating JSON data with Zod schemas.
 * Provides type-safe JSON parsing with detailed validation error messages.
 */
export class ParserService {
  /**
   * Parses JSON text and validates against a Zod schema.
   *
   * Uses safeParse to provide detailed validation errors before throwing,
   * ensuring type safety at runtime.
   *
   * @param text - JSON string to parse
   * @param schema - Zod schema for validation
   * @returns Validated and typed data
   * @throws Error with validation details if parsing or validation fails
   *
   * @example
   * const parser = new ParserService()
   * const data = await parser.parseJSON(jsonText, QaseRunSchema)
   * // data is typed as QaseRun
   */
  async parseJSON<T>(text: string, schema: z.ZodSchema<T>): Promise<T> {
    let parsed: unknown

    // Parse JSON
    try {
      parsed = JSON.parse(text)
    } catch (error) {
      throw new Error(
        `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    // Validate with Zod schema
    const result = schema.safeParse(parsed)

    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`)
    }

    return result.data
  }
}
