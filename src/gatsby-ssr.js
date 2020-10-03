import React from "react"

export const onRenderBody = (
  {setHeadComponents, setPostBodyComponents}, { googleAnalytics = {}, environments = ['production'], hotjar, facebookPixel = {} }
) => {
  const currentEnvironment = process.env.ENV || process.env.NODE_ENV || "development";

  if (!environments.includes(currentEnvironment)) {
    return null;
  }

  // Lighthouse recommends pre-connecting to googletagmanager
  setHeadComponents([
    <link
      rel="preconnect dns-prefetch"
      key="preconnect-googletagmanager"
      href="https://www.googletagmanager.com"
    />,
    <link
      rel="preconnect dns-prefetch"
      key="preconnect-google-analytics"
      href="https://www.google-analytics.com"
    />,
  ])

  const anonymize = typeof googleAnalytics.anonymize !== `undefined` && googleAnalytics.anonymize === true;
  const setComponents = googleAnalytics.head ? setHeadComponents : setPostBodyComponents
  setComponents([
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalytics.trackingId}`}/>,
    <script
      key={`gatsby-plugin-gdpr-tracking`}
      dangerouslySetInnerHTML={{
        __html: `
        ${
          anonymize === true
            ? `function gaOptout(){document.cookie=disableStr+'=true; expires=Thu, 31 Dec 2099 23:59:59 UTC;path=/',window[disableStr]=!0}var gaProperty='${googleAnalytics.trackingId}',disableStr='ga-disable-'+gaProperty;document.cookie.indexOf(disableStr+'=true')>-1&&(window[disableStr]=!0);`
            : ``
        }
         window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
        `,
      }}
    />,
  ])

  if (hotjar && hotjar.trackingId) {
    setHeadComponents([
      <script
        key={`gatsby-plugin-hotjar`}
        dangerouslySetInnerHTML={{
          __html: `
              var hjLoaded = false;
              function trackHotjar() {
                if (!hjLoaded) {
                  (function(h,o,t,j,a,r){
                      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                      h._hjSettings={hjid:${hotjar.trackingId},hjsv:${hotjar.snippetVersion || '6'}};
                      a=o.getElementsByTagName('head')[0];
                      r=o.createElement('script');r.async=1;
                      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                      a.appendChild(r);
                  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=')
                  hjLoaded = true;
                }
             }
          `,
        }}
      />,
    ])
  }

  if (facebookPixel && facebookPixel.pixelId) {
    setHeadComponents([
      <script
        key="gatsby-plugin-gdpr-cookies-facebook-pixel"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
          `,
        }}
      />,
    ])
  }
}