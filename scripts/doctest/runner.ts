/**
 * Doctest Runner for Qore Documentation
 * 提取 Markdown 中的代码块并执行测试
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface CodeBlock {
  file: string
  line: number
  language: string
  code: string
  info?: string
}

interface TestResult {
  file: string
  total: number
  passed: number
  failed: number
  errors: Array<{
    line: number
    code: string
    error: string
  }>
}

// 提取 Markdown 中的代码块
function extractCodeBlocks(content: string, filePath: string): CodeBlock[] {
  const blocks: CodeBlock[] = []
  const lines = content.split('\n')
  let inCodeBlock = false
  let codeBlockStart = 0
  let currentCode = ''
  let currentLanguage = ''
  let currentInfo = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const codeBlockMatch = line.match(/^```(\w+)?(.*)$/)

    if (codeBlockMatch && !inCodeBlock) {
      inCodeBlock = true
      codeBlockStart = i + 1
      currentLanguage = codeBlockMatch[1] || ''
      currentInfo = codeBlockMatch[2]?.trim() || ''
      currentCode = ''
    } else if (codeBlockMatch && inCodeBlock) {
      inCodeBlock = false
      blocks.push({
        file: filePath,
        line: codeBlockStart,
        language: currentLanguage,
        code: currentCode,
        info: currentInfo
      })
    } else if (inCodeBlock) {
      currentCode += line + '\n'
    }
  }

  return blocks
}

// 检查代码块是否应该被测试
function shouldTestBlock(block: CodeBlock): boolean {
  // 只测试 TypeScript 代码块
  if (!['typescript', 'ts', 'js', 'javascript'].includes(block.language)) {
    return false
  }

  // 跳过标记为 no-test 的代码块
  if (block.info?.includes('no-test') || block.info?.includes('no-run')) {
    return false
  }

  // 跳过纯类型定义
  if (block.code.trim().startsWith('interface') && !block.code.includes('=')) {
    return false
  }

  // 跳过只有类型定义的代码块
  if (block.code.trim().startsWith('type ') && !block.code.includes('function') && !block.code.includes('const')) {
    return false
  }

  // 跳过只有函数签名的代码块
  if (block.code.includes('function signature') || block.code.trim().match(/^function\s+\w+\s*\([^)]*\)\s*:/)) {
    return false
  }

  // 检查是否有实际可执行的代码
  const hasRealCode = block.code.match(/(signal|computed|effect|batch|component|console\.log|\.set\(|\.update\(|\.peek\(|return\s|const\s|let\s|var\s|if\s|for\s|while|import.*from)/)
  if (!hasRealCode) {
    return false
  }

  return true
}

// 分析代码需要哪些导入
function analyzeImports(code: string): string[] {
  const imports: Set<string> = new Set()
  
  if (code.match(/\bsignal\s*\(/)) imports.add('signal')
  if (code.match(/\bcomputed\s*\(/)) imports.add('computed')
  if (code.match(/\beffect\s*\(/)) imports.add('effect')
  if (code.match(/\bbatch\s*\(/)) imports.add('batch')
  if (code.match(/\bcomponent\s*\(/)) imports.add('component')
  if (code.match(/\bonMount\s*\(/)) imports.add('onMount')
  if (code.match(/\bonUnmount\s*\(/)) imports.add('onUnmount')

  return Array.from(imports)
}

// 转换代码以可执行
function transformCode(code: string, existingImports: string[] = []): string {
  let transformed = code

  // 检查是否已有导入
  const hasQoreImport = transformed.includes('from \'qore\'') || transformed.includes('from "qore"')
  
  if (hasQoreImport) {
    // 替换现有的 qore 导入
    transformed = transformed.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"]qore['"]/g,
      'import { $1 } from \'../../doctest/qore-mock.js\''
    )
  } else {
    // 添加必要的导入
    const neededImports = analyzeImports(code)
    if (neededImports.length > 0) {
      const importStatement = `import { ${neededImports.join(', ')} } from '../../doctest/qore-mock.js'\n`
      transformed = importStatement + transformed
    }
  }

  return transformed
}

// 运行单个代码块测试
async function runCodeBlock(block: CodeBlock): Promise<{ success: boolean; error?: string }> {
  const transformedCode = transformCode(block.code)
  
  // 创建临时文件
  const tempFile = join(__dirname, 'temp-test.ts')
  writeFileSync(tempFile, transformedCode)

  try {
    // 使用 tsx 运行
    execSync(`cd "${__dirname}" && npx tsx "${tempFile}"`, {
      stdio: 'pipe',
      timeout: 5000
    })
    return { success: true }
  } catch (error: any) {
    const errorMsg = error.stderr?.toString() || error.stdout?.toString() || error.message || 'Unknown error'
    return {
      success: false,
      error: errorMsg.split('\n').slice(0, 5).join('\n')
    }
  } finally {
    // 清理临时文件
    if (existsSync(tempFile)) {
      unlinkSync(tempFile)
    }
  }
}

// 运行单个文件的 doctest
async function testFile(filePath: string): Promise<TestResult> {
  const content = readFileSync(filePath, 'utf-8')
  const blocks = extractCodeBlocks(content, filePath)
  const testableBlocks = blocks.filter(shouldTestBlock)

  const result: TestResult = {
    file: filePath,
    total: testableBlocks.length,
    passed: 0,
    failed: 0,
    errors: []
  }

  console.log(`\n📄 Testing ${basename(filePath)}: ${testableBlocks.length} code blocks`)

  for (const block of testableBlocks) {
    const testResult = await runCodeBlock(block)
    
    if (testResult.success) {
      result.passed++
      console.log(`  ✅ Line ${block.line}`)
    } else {
      result.failed++
      result.errors.push({
        line: block.line,
        code: block.code.substring(0, 100).replace(/\n/g, '\\n') + '...',
        error: testResult.error || 'Unknown error'
      })
      console.log(`  ❌ Line ${block.line}: ${testResult.error?.split('\n')[0]?.substring(0, 80)}`)
    }
  }

  // 输出详细错误
  if (result.errors.length > 0) {
    console.log('\n  Detailed errors:')
    for (const err of result.errors.slice(0, 3)) {
      console.log(`    Line ${err.line}: ${err.error.substring(0, 100)}`)
    }
  }

  return result
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  const files = args.length > 0 ? args : [
    join(__dirname, '../../api/signal.md'),
    join(__dirname, '../../api/computed.md'),
    join(__dirname, '../../api/effect.md'),
    join(__dirname, '../../api/batch.md')
  ]

  console.log('🧪 Qore Doctest Runner\n')
  console.log('=' .repeat(50))

  const allResults: TestResult[] = []

  for (const file of files) {
    if (existsSync(file)) {
      const result = await testFile(file)
      allResults.push(result)
    } else {
      console.log(`⚠️  File not found: ${file}`)
    }
  }

  // 汇总结果
  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')

  let totalTests = 0
  let totalPassed = 0
  let totalFailed = 0

  for (const result of allResults) {
    totalTests += result.total
    totalPassed += result.passed
    totalFailed += result.failed

    const status = result.failed === 0 ? '✅' : '❌'
    console.log(`  ${status} ${basename(result.file)}: ${result.passed}/${result.total}`)
  }

  console.log('\n' + '-'.repeat(50))
  console.log(`Total: ${totalPassed}/${totalTests} passed`)

  if (totalFailed > 0) {
    console.log(`\n❌ ${totalFailed} tests failed`)
    process.exit(1)
  } else {
    console.log('\n✅ All tests passed!')
    process.exit(0)
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
