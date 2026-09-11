export type Language = 'en' | 'hi';

export interface Translations {
  appName: string;
  appNameDevanagari: string;
  tagline: string;
  subtitle: string;
  systemOnline: string;
  demoMode: string;
  livePipeline: string;
  exportDossier: string;
  
  // Navigation
  overview: string;
  oceanMap: string;
  sonarIntelligence: string;
  marineEcosystems: string;
  hazardAudit: string;
  analyticsEdge: string;
  disasterResponse: string;
  missionControl: string;
  reports: string;

  // Sidebar metrics
  surveyArea: string;
  hazardsDetected: string;
  criticalBlockers: string;
  aiInference: string;
  coastalRegions: string;
  ecosystemsMonitored: string;
  channelStatus: string;
  channelRestricted: string;
  channelCleared: string;
  missionProfile: string;
  selectMission: string;
  ingestSonar: string;

  // Controls
  confidenceCutoff: string;
  waveletDespeckle: string;
  shadowGate: string;
  shippingBuffer: string;

  // Hero & Impact
  heroHeading: string;
  heroSubheading: string;
  exploreOceans: string;
  startSonarAnalysis: string;
  
  impactEcosystemsTitle: string;
  impactEcosystemsDesc: string;
  impactSafetyTitle: string;
  impactSafetyDesc: string;
  impactLivelihoodsTitle: string;
  impactLivelihoodsDesc: string;
  impactBlueEconomyTitle: string;
  impactBlueEconomyDesc: string;

  // Selected detection
  selectedDetection: string;
  navigationRisk: string;
  ecosystemRisk: string;
  potentialImpact: string;
  clearancePriority: string;
  viewOnMap: string;
  inspectSonar: string;

  // Disaster Response
  disasterResponseTitle: string;
  disasterDeclared: string;
  sonarSurvey: string;
  aiDetection: string;
  hazardMap: string;
  clearanceReadiness: string;
  portReopeningTitle: string;
  coverage: string;

  // Ecosystems Section
  ecosystemsSectionTitle: string;
  ecosystemsSectionSubtitle: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'SAGARDRISHTI',
    appNameDevanagari: 'सागरदृष्टि',
    tagline: "Seeing beneath India's waters. Protecting what lies beneath.",
    subtitle: "AI-POWERED MARINE INTELLIGENCE FOR INDIA",
    systemOnline: 'SYSTEM ONLINE',
    demoMode: 'DEMO MODE (INDIA RECON)',
    livePipeline: 'LIVE PIPELINE',
    exportDossier: 'EXPORT DOSSIER',

    overview: 'Overview',
    oceanMap: "India Ocean Map",
    sonarIntelligence: 'Sonar Intelligence',
    marineEcosystems: 'Marine Ecosystems',
    hazardAudit: 'Hazard Audit',
    analyticsEdge: 'Analytics & Edge',
    disasterResponse: 'Disaster Response',
    missionControl: 'Mission Control',
    reports: 'Reports',

    surveyArea: 'SURVEY AREA',
    hazardsDetected: 'HAZARDS DETECTED',
    criticalBlockers: 'CRITICAL BLOCKERS',
    aiInference: 'AI INFERENCE',
    coastalRegions: 'COASTAL REGIONS',
    ecosystemsMonitored: 'ECOSYSTEMS MONITORED',
    channelStatus: 'CHANNEL STATUS',
    channelRestricted: 'CHANNEL RESTRICTED',
    channelCleared: 'CHANNEL PASSABLE',
    missionProfile: 'DEMO MISSION PROFILE',
    selectMission: 'Select Indian Maritime Survey',
    ingestSonar: 'Ingest Sonar Log (.png, .tif)',

    confidenceCutoff: 'Confidence Cutoff',
    waveletDespeckle: 'Wavelet Despeckling (2D-DWT)',
    shadowGate: 'Acoustic Shadow Gate',
    shippingBuffer: '50m Fairway Hazard Buffer',

    heroHeading: 'SAGARDRISHTI // सागरदृष्टि',
    heroSubheading: "AI-Powered Sonar Vision & Seafloor Debris Mapping for India's Oceans",
    exploreOceans: "Explore India's Oceans",
    startSonarAnalysis: 'Start Sonar Analysis',

    impactEcosystemsTitle: 'MARINE ECOSYSTEMS',
    impactEcosystemsDesc: 'Guarding coral reefs, seagrass beds, and endangered marine life from toxic sunken debris.',
    impactSafetyTitle: 'MARITIME SAFETY',
    impactSafetyDesc: 'Uncovering submerged shipwrecks, severed conduits, and navigation death traps in shipping lanes.',
    impactLivelihoodsTitle: 'COASTAL LIVELIHOODS',
    impactLivelihoodsDesc: 'Protecting traditional artisanal fishing vessels and gear from ghost nets and submerged wreckage.',
    impactBlueEconomyTitle: 'BLUE ECONOMY',
    impactBlueEconomyDesc: 'Enabling rapid, autonomous post-cyclone port clearance and sustainable ocean resource stewardship.',

    selectedDetection: 'SELECTED DETECTION & RISK INTELLIGENCE',
    navigationRisk: 'Navigation Risk',
    ecosystemRisk: 'Ecosystem Risk',
    potentialImpact: 'Potential Impact',
    clearancePriority: 'Clearance Priority',
    viewOnMap: 'View on Map',
    inspectSonar: 'Inspect Sonar',

    disasterResponseTitle: 'PORT REOPENING READINESS // POST-DISASTER PROTOCOL',
    disasterDeclared: 'Cyclone / Tsunami Declared',
    sonarSurvey: 'Autonomous AUV Survey',
    aiDetection: 'AI Sonar Detection',
    hazardMap: 'Geotagged Hazard Map',
    clearanceReadiness: 'Navigation & Eco Clearance',
    portReopeningTitle: 'Harbour Reopening Clearance Index',
    coverage: 'Survey Swath Coverage',

    ecosystemsSectionTitle: "INDIA'S MARINE ECOSYSTEMS & HABITAT ZONES",
    ecosystemsSectionSubtitle: "Integrated Acoustic Hazard Monitoring Across Key Biological Reserves & Coastal Sanctuaries"
  },
  hi: {
    appName: 'सागरदृष्टि',
    appNameDevanagari: 'SAGARDRISHTI',
    tagline: 'भारत के समुद्रों को समझना, सुरक्षित रखना और संरक्षित करना।',
    subtitle: 'भारत के लिए एआई-संचालित समुद्री बुद्धिमत्ता',
    systemOnline: 'प्रणाली ऑनलाइन',
    demoMode: 'डेमो मोड (भारतीय महासागर सर्वेक्षण)',
    livePipeline: 'लाइव पाइपलाइन',
    exportDossier: 'दस्तावेज़ डाउनलोड करें',

    overview: 'अवलोकन',
    oceanMap: 'भारत महासागर मानचित्र',
    sonarIntelligence: 'सोनार बुद्धिमत्ता',
    marineEcosystems: 'समुद्री पारिस्थितिकी तंत्र',
    hazardAudit: 'खतरा ऑडिट',
    analyticsEdge: 'एनालिटिक्स और एज',
    disasterResponse: 'आपदा प्रतिक्रिया',
    missionControl: 'मिशन नियंत्रण',
    reports: 'रिपोर्ट',

    surveyArea: 'सर्वेक्षण क्षेत्र',
    hazardsDetected: 'पहचाने गए खतरे',
    criticalBlockers: 'गंभीर अवरोधक',
    aiInference: 'एआई अनुमान समय',
    coastalRegions: 'तटीय क्षेत्र',
    ecosystemsMonitored: 'निगरानी क्षेत्र',
    channelStatus: 'चैनल स्थिति',
    channelRestricted: 'चैनल प्रतिबंधित / अवरुद्ध',
    channelCleared: 'चैनल सुरक्षित / चालू',
    missionProfile: 'डेमो मिशन प्रोफ़ाइल',
    selectMission: 'भारतीय समुद्री सर्वेक्षण चुनें',
    ingestSonar: 'सोनार फ़ाइल अपलोड करें (.png, .tif)',

    confidenceCutoff: 'विश्वास सीमा (कॉन्फिडेंस)',
    waveletDespeckle: 'वेवलेट डिस्पेक्लिंग (2D-DWT)',
    shadowGate: 'ध्वनिक छाया सत्यापन (शैडो गेट)',
    shippingBuffer: '५०मी नौवहन सुरक्षा बफर',

    heroHeading: 'सागरदृष्टि // SAGARDRISHTI',
    heroSubheading: 'भारतीय समुद्रों के लिए एआई-संचालित सोनार विज़न एवं मलबे की पहचान',
    exploreOceans: 'भारत के समुद्रों का अन्वेषण करें',
    startSonarAnalysis: 'सोनार विश्लेषण शुरू करें',

    impactEcosystemsTitle: 'समुद्री पारिस्थितिकी तंत्र',
    impactEcosystemsDesc: 'मूंगा चट्टानों, समुद्री घास और लुप्तप्राय जीवों को जलमग्न कचरे से सुरक्षा प्रदान करना।',
    impactSafetyTitle: 'समुद्री सुरक्षा',
    impactSafetyDesc: 'शिपिंग चैनलों में डूबे हुए जहाजों और खतरनाक पाइपलाइनों की स्वचालित पहचान।',
    impactLivelihoodsTitle: 'तटीय आजीविका',
    impactLivelihoodsDesc: 'घोस्ट नेट्स (लावारिस जालों) और मलबे से पारंपरिक मछुआरों की नावों व आजीविका की रक्षा।',
    impactBlueEconomyTitle: 'ब्लू इकोनॉमी',
    impactBlueEconomyDesc: 'चक्रवात के बाद बंदरगाहों को तेजी से फिर से खोलने और सतत विकास के लिए तकनीक।',

    selectedDetection: 'चयनित खतरा एवं जोखिम विश्लेषण',
    navigationRisk: 'नौवहन जोखिम',
    ecosystemRisk: 'पारिस्थितिकी जोखिम',
    potentialImpact: 'संभावित प्रभाव',
    clearancePriority: 'निकासी प्राथमिकता',
    viewOnMap: 'मानचित्र पर देखें',
    inspectSonar: 'सोनार में जांचें',

    disasterResponseTitle: 'बंदरगाह पुनः खोलने की तत्परता // आपदा प्रतिक्रिया प्रोटोकॉल',
    disasterDeclared: 'चक्रवात / सुनामी घोषित',
    sonarSurvey: 'स्वायत्त एयूवी सर्वेक्षण',
    aiDetection: 'एआई सोनार पहचान',
    hazardMap: 'जियोटैग्ड खतरा मानचित्र',
    clearanceReadiness: 'सुरक्षा एवं पर्यावरण मंजूरी',
    portReopeningTitle: 'बंदरगाह पुनः खोलने का सुरक्षा सूचकांक',
    coverage: 'सर्वेक्षण कवरेज',

    ecosystemsSectionTitle: 'भारत के समुद्री पारिस्थितिकी तंत्र एवं पर्यावास क्षेत्र',
    ecosystemsSectionSubtitle: 'प्रमुख जैव अभयारण्यों और तटीय क्षेत्रों में एकीकृत ध्वनिक खतरा निगरानी'
  }
};
