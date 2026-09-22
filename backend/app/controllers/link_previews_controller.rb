class LinkPreviewsController < ApplicationController
  # GET /api/link_preview?url=https://...
  def show
    preview = LinkPreview.fetch(params.require(:url))
    render json: { url: preview.url, title: preview.title, description: preview.description, image: preview.image, siteName: preview.site_name }
  end
end
