import React from "react"
import { Helmet } from "react-helmet"
import { siteUrl } from "../../../blog-config"
import { gtag } from "../../../blog-config"

const SEO = ({ title, description, url }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={`${siteUrl}/og-image.png`} />
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      <script
        async
        src={"https://www.googletagmanager.com/gtag/js?id=" + gtag}
      ></script>
      <script>
        {`window.dataLayer = window.dataLayer || []; function gtag()
        {dataLayer.push(arguments)}
        gtag('js', new Date()); gtag('config', '`+ gtag + `');`}
      </script>
    </Helmet>
  )
}

export default SEO