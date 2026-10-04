import Script from "next/script";

/**
 * Panelden girilen ölçümleme kodları. Backend değerleri karakter kümesiyle doğruluyor
 * (sadece harf, rakam, tire, alt çizgi), bu yüzden script içine gömülmeleri güvenli.
 */
export default function Analytics({ settings }) {
    if (!settings) return null;

    const { googleAnalyticsId, facebookPixelId, yandexMetrikaId } = settings;

    return (
        <>
            {googleAnalyticsId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga-init" strategy="afterInteractive">
                        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${googleAnalyticsId}');`}
                    </Script>
                </>
            )}

            {facebookPixelId && (
                <Script id="meta-pixel" strategy="afterInteractive">
                    {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,
'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${facebookPixelId}');fbq('track','PageView');`}
                </Script>
            )}

            {yandexMetrikaId && (
                <Script id="yandex-metrika" strategy="afterInteractive">
                    {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,
a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
ym(${yandexMetrikaId},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
                </Script>
            )}
        </>
    );
}