class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Authentication
  include ProblemDetails
  include Representations

  # 契約は camelCase（fullName, likedBy）、コントローラーは snake_case で読む。
  before_action { params.deep_transform_keys!(&:underscore) }

  private
    # page（1 始まり、既定 1）と rows（1〜100、既定 20）。OpenAPI の宣言どおりに検証する。
    def paginate(relation)
      relation.offset(page_offset).limit(page_rows)
    end

    def page_offset
      (page_number - 1) * page_rows
    end

    def page_number
      number = Integer(params[:page].presence || 1, exception: false)
      raise ProblemDetails::InvalidParameter.new(:page, "Page must be an integer of 1 or more") unless number && number >= 1
      number
    end

    def page_rows
      number = Integer(params[:rows].presence || 20, exception: false)
      raise ProblemDetails::InvalidParameter.new(:rows, "Rows must be an integer between 1 and 100") unless number && (1..100).cover?(number)
      number
    end
end
