Rswag::Api.configure do |c|
  # rswag が書く swagger/v1/swagger.yaml を /api-docs/v1/swagger.yaml で配信する
  c.openapi_root = Rails.root.join("swagger").to_s
end
