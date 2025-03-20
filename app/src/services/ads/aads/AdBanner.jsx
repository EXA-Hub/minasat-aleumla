// app/src/services/ads/aads/AA.jsx

const AdBanner = () => {
  return (
    <div id="frame" style={{ width: '970px', height: 'auto' }}>
      <iframe
        title="ad-banner"
        data-aa="2386694"
        src="//ad.a-ads.com/2386694?size=970x250"
        style={{
          width: '970px',
          height: '250px',
          border: '0px',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}></iframe>
      <a
        id="preview-link"
        href="https://aads.com/campaigns/new/?source_id=2386694&source_type=ad_unit&partner=2386694"
        style={{ display: 'block', textAlign: 'right', fontSize: '12px' }}
        target="_blank"
        rel="noopener noreferrer">
        Advertise here
      </a>
    </div>
  );
};

export default AdBanner;
