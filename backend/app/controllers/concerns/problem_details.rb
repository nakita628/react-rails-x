# エラーはすべて RFC 9457 の problem document（application/problem+json）。バリデーション失敗（422）は
# `errors` に問題のあるフィールドを契約どおりの camelCase で並べる。
module ProblemDetails
  extend ActiveSupport::Concern

  # 契約に反するクエリパラメータ（page=0, feed=xyz など）。モデルの検証失敗と同じ 422 にする。
  class InvalidParameter < StandardError
    attr_reader :field

    def initialize(field, message)
      @field = field
      super(message)
    end
  end

  included do
    rescue_from ActiveRecord::RecordNotFound do
      render_problem :not_found, "Resource not found"
    end

    rescue_from ActiveRecord::RecordInvalid do |error|
      render_validation_problem error.record.errors
    end

    rescue_from InvalidParameter do |error|
      render_problem :unprocessable_content, "The request failed validation. See `errors` for the offending fields.",
                     errors: [ { field: error.field.to_s.camelize(:lower), message: error.message } ]
    end

    rescue_from ActionDispatch::Http::Parameters::ParseError do
      render_problem :bad_request, "The request body is not valid JSON"
    end

    rescue_from ActionController::ParameterMissing, LinkPreview::BadRequest do |error|
      render_problem :bad_request, error.message
    end
  end

  private
    def render_validation_problem(errors)
      render_problem :unprocessable_content, "The request failed validation. See `errors` for the offending fields.",
                     errors: errors.map { { field: it.attribute.to_s.camelize(:lower), message: it.full_message } }
    end

    def render_problem(status, detail, errors: nil)
      code = Rack::Utils.status_code(status)
      problem = {
        type: "/problems/#{status.to_s.dasherize}",
        title: Rack::Utils::HTTP_STATUS_CODES[code],
        status: code,
        detail: detail,
        instance: request.path
      }
      problem[:errors] = errors if errors
      render json: problem, status: code, content_type: "application/problem+json"
    end
end
