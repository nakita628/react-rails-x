// 開発用データ。`pnpm seed`（hekireki seed --reset）がこの行を storage/development.sqlite3 に書く。
// 行は挿入前に generated/seed/schema.ts（`pnpm generate` が書く）と照合される。親は一意キーで名指し
// （`user: { username }`）、子はネストして書く。
import { defineConfig } from 'hekireki'

import { schema } from './generated/seed/schema'

// "secret123" の bcrypt。seed のユーザーは全員これでサインインする。
const passwordDigest = '$2a$10$oGG13BkgolvVXXnJZGtS/e1cEvzu0tjWDavvjP438OJ6sFLs3c.ce'

export default defineConfig(schema, {
  url: 'file:./storage/development.sqlite3',
  models: {
    User: {
      data: [
        {
          username: 'alice',
          fullName: 'Alice',
          emailAddress: 'alice@example.com',
          passwordDigest,
          bio: "Hi, I'm Alice.",
          posts: [
            {
              text: 'Hello from Rails! https://rubyonrails.org/',
              likes: [{ user: { username: 'bob' } }],
              reposts: [{ user: { username: 'carol' } }],
              comments: [{ text: 'Nice post!', author: { username: 'bob' } }],
            },
          ],
          followers: [{ follower: { username: 'bob' } }, { follower: { username: 'carol' } }],
          notificationsTo: [
            { type: 'like', from: { username: 'bob' } },
            { type: 'follow', from: { username: 'carol' } },
          ],
        },
        {
          username: 'bob',
          fullName: 'Bob',
          emailAddress: 'bob@example.com',
          passwordDigest,
          bio: "Hi, I'm Bob.",
          posts: [{ text: 'The frontend is React, the API is Rails, the contract is OpenAPI.' }],
        },
        {
          username: 'carol',
          fullName: 'Carol',
          emailAddress: 'carol@example.com',
          passwordDigest,
          bio: "Hi, I'm Carol.",
          posts: [{ text: 'hekireki wrote the models from schema.prisma.' }],
        },
      ],
    },
  },
})
