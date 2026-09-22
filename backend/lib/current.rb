# リクエストのセッションとユーザー（rails generate authentication の Current）。app/models は
# hekireki が schema.prisma から丸ごと書くので、ここに置く。
class Current < ActiveSupport::CurrentAttributes
  attribute :session
  delegate :user, to: :session, allow_nil: true
end
