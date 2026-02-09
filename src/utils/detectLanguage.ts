/**
 * Map file extensions to Prism language identifiers.
 */
export const detectLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    log: 'markup',
    txt: 'markup',
    json: 'json',
    xml: 'xml',
    html: 'markup',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    java: 'java',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
  }
  return languageMap[ext || ''] || 'markup'
}
