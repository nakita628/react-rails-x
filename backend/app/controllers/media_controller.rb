class MediaController < ApplicationController
  # 画像の URL はそれ自体が鍵。キーを知っていれば誰でも読める。
  allow_unauthenticated_access

  # GET /api/media/:prefix/:filename
  def show
    path = MediaStore.path_for("#{params[:prefix]}/#{params[:filename]}")
    return head :not_found unless path.file?

    response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    send_file path, disposition: "inline"
  end
end
