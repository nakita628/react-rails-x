// Rails の統合テストが生成する OpenAPI 文書（backend/doc/openapi.yaml）から src/api/schema.d.ts を書く。
// `OPENAPI=1 bin/rails test` のあとに `pnpm generate` で実行する。
import fs from 'node:fs'

import openapiTS, { astToString } from 'openapi-typescript'
import ts from 'typescript'

const FILE = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('File'))

const ast = await openapiTS(new URL('../../backend/doc/openapi.yaml', import.meta.url), {
  // アップロード（type: string, format: binary）はブラウザ側では File。
  transform(schemaObject) {
    if ('format' in schemaObject && schemaObject.format === 'binary') return FILE
    return undefined
  },
})

fs.writeFileSync(new URL('../src/api/schema.d.ts', import.meta.url), astToString(ast))
console.log('wrote src/api/schema.d.ts')
