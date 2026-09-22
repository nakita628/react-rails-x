// Rails の request spec（rswag）が生成する OpenAPI 文書（backend/swagger/v1/swagger.yaml）から
// src/api/schema.d.ts を書く。`rake rswag:specs:swaggerize` のあとに `pnpm generate` で実行する。
import fs from 'node:fs'

import openapiTS, { astToString } from 'openapi-typescript'
import ts from 'typescript'

const FILE = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('File'))

const ast = await openapiTS(new URL('../../backend/swagger/v1/swagger.yaml', import.meta.url), {
  // アップロード（type: string, format: binary）はブラウザ側では File。
  transform(schemaObject) {
    if ('format' in schemaObject && schemaObject.format === 'binary') return FILE
    return undefined
  },
})

fs.writeFileSync(new URL('../src/api/schema.d.ts', import.meta.url), astToString(ast))
console.log('wrote src/api/schema.d.ts')
