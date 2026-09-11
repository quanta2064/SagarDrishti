import type { MarineEcosystemZone } from '../types';

export interface IndianMissionConfig {
  id: string;
  name: string;
  hindi_name: string;
  region: string;
  sea_basin: string;
  center_coords: [number, number];
  vessel: string;
  sonar_model: string;
  scanned_area_km2: number;
  disaster_scenario?: string;
  description: string;
  hindi_description: string;
  target_ecosystem: string;
}

export const INDIAN_MISSIONS: IndianMissionConfig[] = [
  {
    id: 'chennai',
    name: 'Chennai Coastal Safety & Harbour Approach Survey',
    hindi_name: 'चेन्नई तटीय सुरक्षा एवं बंदरगाह मार्ग सर्वेक्षण',
    region: 'Tamil Nadu (Coromandel Coast)',
    sea_basin: 'Bay of Bengal',
    center_coords: [13.0827, 80.2707],
    vessel: 'INS Makar (Hydrographic Catamaran)',
    sonar_model: 'EdgeTech 4125 (455/900 kHz)',
    scanned_area_km2: 5.40,
    disaster_scenario: 'Post-Monsoon Shipping Channel Obstruction Recon',
    description: 'Autonomous side-scan survey across Chennai port outer anchorage and artisanal fishing fairways.',
    hindi_description: 'चेन्नई बंदरगाह के बाहरी लंगरगाह और पारंपरिक मत्स्य पालन गलियारों का स्वायत्त सोनार सर्वेक्षण।',
    target_ecosystem: 'Pulicat & Coromandel Seagrass Habitat'
  },
  {
    id: 'mumbai',
    name: 'Mumbai Harbour & JNPT Navigation Channel Debris Audit',
    hindi_name: 'मुंबई बंदरगाह एवं जेएनपीटी नेविगेशन चैनल मलबा ऑडिट',
    region: 'Maharashtra (Konkan Coast)',
    sea_basin: 'Arabian Sea',
    center_coords: [18.9438, 72.8617],
    vessel: 'RV Samudra Ratnakar',
    sonar_model: 'Klein 3000 Digital SSS',
    scanned_area_km2: 6.80,
    disaster_scenario: 'Heavy Vessel Traffic Collision & Lost Cargo Container Audit',
    description: 'High-density sonar swath mapping of submerged metallic industrial conduits, sunken barges, and navigation death traps.',
    hindi_description: 'उच्च घनत्व सोनार मैपिंग - जलमग्न धातु पाइपलाइनों, डूबे बार्जों और नौवहन अवरोधों की पहचान।',
    target_ecosystem: 'Thane Creek Mudflats & Mangrove Estuary'
  },
  {
    id: 'odisha',
    name: 'Odisha Post-Cyclone Paradip Reconnaissance Survey',
    hindi_name: 'ओडिशा चक्रवात-उपरांत पारादीप बंदरगाह पुनःप्राप्ति सर्वेक्षण',
    region: 'Odisha (Northern Circars)',
    sea_basin: 'Bay of Bengal',
    center_coords: [20.2961, 86.6710],
    vessel: 'AUV Sagar-Kanya',
    sonar_model: 'EdgeTech 4125 Dual-Freq',
    scanned_area_km2: 4.85,
    disaster_scenario: 'Post-Cyclone Storm Surge Fairway Clearance & Olive Ridley Corridor Protection',
    description: 'Rapid port reopening survey detecting cyclone debris, storm-displaced buoys, and tangled trawl nets near turtle nesting paths.',
    hindi_description: 'चक्रवात के मलबे और ओलिव रिडले कछुओं के प्रवास गलियारे के पास फंसे जालों की तीव्र पहचान हेतु सर्वेक्षण।',
    target_ecosystem: 'Gahirmatha Turtle Sanctuary & Mahanadi Mangroves'
  },
  {
    id: 'andaman',
    name: 'Andaman & Nicobar Marine Habitat & Wreck Survey',
    hindi_name: 'अंडमान एवं निकोबार समुद्री पर्यावास एवं मलबा सर्वेक्षण',
    region: 'Andaman & Nicobar Islands',
    sea_basin: 'Andaman Sea',
    center_coords: [11.6234, 92.7265],
    vessel: 'AUV Matsya-III',
    sonar_model: 'Reson SeaBat S7K Forward-Looking SSS',
    scanned_area_km2: 3.90,
    disaster_scenario: 'Coral Bleaching & Tsunami Debris Impact Assessment',
    description: 'High-resolution acoustic reconnaissance around Port Blair lagoon for sunken historic hulls and plastic fishing net bundles.',
    hindi_description: 'पोर्ट ब्लेयर लैगून के आसपास डूबे ऐतिहासिक जहाजों और प्लास्टिक जालों की उच्च-सटीकता ध्वनिक पहचान।',
    target_ecosystem: 'Mahatma Gandhi Marine National Park Coral Reefs'
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep Atoll & Lagoon Reef Protection Survey',
    hindi_name: 'लक्षद्वीप एटोल एवं लैगून रीफ संरक्षण सर्वेक्षण',
    region: 'Lakshadweep Islands',
    sea_basin: 'Laccadive Sea / Arabian Sea',
    center_coords: [10.8500, 72.1900],
    vessel: 'AUV Sagar-Nidhi',
    sonar_model: 'EdgeTech 4125 (High Res 900 kHz)',
    scanned_area_km2: 3.20,
    disaster_scenario: 'Ecological Reef Health & Abandoned Ghost Net Recovery',
    description: 'Lagoon seabed inspection detecting sunken longline cables and synthetic netting threatening fragile coral structures.',
    hindi_description: 'नाजुक मूंगा संरचनाओं को खतरे में डालने वाले जलमग्न केबलों और कृत्रिम जालों का निरीक्षण।',
    target_ecosystem: 'Agatti & Kavaratti Pristine Coral Reef Atolls'
  },
  {
    id: 'kerala',
    name: 'Kerala Fishing Corridor & Kochi Approach Safety Survey',
    hindi_name: 'केरल मत्स्य पालन गलियारा एवं कोच्चि चैनल सुरक्षा सर्वेक्षण',
    region: 'Kerala (Malabar Coast)',
    sea_basin: 'Arabian Sea',
    center_coords: [9.9312, 76.2673],
    vessel: 'RV Sagar Sampada',
    sonar_model: 'EdgeTech 4125',
    scanned_area_km2: 4.60,
    disaster_scenario: 'Monsoon Siltation & Submerged Concrete Debris Detection',
    description: 'Ensuring safe passage for traditional deep-sea tuna vessels and container traffic through Cochin Port fairway.',
    hindi_description: 'कोचीन बंदरगाह मार्ग से गहरे समुद्र में मछली पकड़ने वाले जहाजों के लिए सुरक्षित मार्ग सुनिश्चित करना।',
    target_ecosystem: 'Vembanad Wetland & Cochin Backwater Estuary'
  }
];

export const MARINE_ECOSYSTEMS: MarineEcosystemZone[] = [
  {
    id: 'eco-1',
    name: 'Gulf of Mannar Marine Biosphere Reserve',
    hindi_name: 'मन्नार की खाड़ी समुद्री बायोस्फीयर रिजर्व',
    category: 'Coral Reefs',
    region: 'Tamil Nadu',
    sea_basin: 'Indian Ocean',
    center: [9.1500, 79.1200],
    area_km2: 10500,
    health_index: 82,
    key_species: 'Dugong (Sea Cow), Whale Shark, Green Turtle',
    primary_threat: 'Tangled monofilament ghost nets & chemical runoff',
    hazard_proximity_count: 2
  },
  {
    id: 'eco-2',
    name: 'Sundarbans Biosphere & Mangrove Wetland',
    hindi_name: 'सुंदरबन बायोस्फीयर एवं मैंग्रोव आर्द्रभूमि',
    category: 'Mangroves',
    region: 'West Bengal',
    sea_basin: 'Bay of Bengal',
    center: [21.9497, 89.1833],
    area_km2: 9630,
    health_index: 88,
    key_species: 'Estuarine Crocodile, Irrawaddy Dolphin',
    primary_threat: 'Sunken wooden craft & plastic debris clogging tidal creeks',
    hazard_proximity_count: 1
  },
  {
    id: 'eco-3',
    name: 'Gahirmatha Marine Sanctuary & Olive Ridley Corridor',
    hindi_name: 'गहिरमाथा समुद्री अभयारण्य (कछुआ गलियारा)',
    category: 'Coastal Wetlands',
    region: 'Odisha',
    sea_basin: 'Bay of Bengal',
    center: [20.7100, 87.0500],
    area_km2: 1435,
    health_index: 76,
    key_species: 'Olive Ridley Sea Turtles (World largest rookery)',
    primary_threat: 'Industrial cyclone wreckage & illegal bottom trawl nets',
    hazard_proximity_count: 3
  },
  {
    id: 'eco-4',
    name: 'Lakshadweep Coral Atolls & Lagoons',
    hindi_name: 'लक्षद्वीप मूंगा एटोल एवं लैगून',
    category: 'Coral Reefs',
    region: 'Lakshadweep',
    sea_basin: 'Arabian Sea',
    center: [10.5667, 72.6417],
    area_km2: 4200,
    health_index: 91,
    key_species: 'Staghorn Coral, Manta Rays, Hawksbill Turtle',
    primary_threat: 'Anchor scours, abandoned nylon gillnets',
    hazard_proximity_count: 1
  },
  {
    id: 'eco-5',
    name: 'Mahatma Gandhi Marine National Park (Wandoor)',
    hindi_name: 'महात्मा गांधी समुद्री राष्ट्रीय उद्यान (अंडमान)',
    category: 'Coral Reefs',
    region: 'Andaman & Nicobar',
    sea_basin: 'Andaman Sea',
    center: [11.5800, 92.5900],
    area_km2: 281,
    health_index: 94,
    key_species: 'Giant Clam, Black Coral, Dugong',
    primary_threat: 'WWII historic munitions and storm debris',
    hazard_proximity_count: 2
  },
  {
    id: 'eco-6',
    name: 'Palk Bay & Chilika Seagrass Meadows',
    hindi_name: 'पाक जलडमरूमध्य एवं चिल्का समुद्री घास के मैदान',
    category: 'Seagrass',
    region: 'Tamil Nadu / Odisha',
    sea_basin: 'Bay of Bengal',
    center: [9.7500, 79.2500],
    area_km2: 850,
    health_index: 79,
    key_species: 'Dugong, Syngnathid Seahorses, Seagrass Meadows',
    primary_threat: 'Propeller scarring & heavy industrial debris deposits',
    hazard_proximity_count: 1
  },
  {
    id: 'eco-7',
    name: 'Gulf of Kutch Marine National Park',
    hindi_name: 'कच्छ की खाड़ी समुद्री राष्ट्रीय उद्यान',
    category: 'Mudflats',
    region: 'Gujarat',
    sea_basin: 'Arabian Sea',
    center: [22.4500, 69.8000],
    area_km2: 457,
    health_index: 74,
    key_species: 'Sponges, Sea Anemones, Indo-Pacific Humpback Dolphin',
    primary_threat: 'Industrial pipeline ruptures & petroleum transport',
    hazard_proximity_count: 2
  },
  {
    id: 'eco-8',
    name: 'Malvan Marine Sanctuary & Sindhudurg Rock Reefs',
    hindi_name: 'मालवण समुद्री अभयारण्य (सिंधुदुर्ग)',
    category: 'Open Ocean',
    region: 'Maharashtra',
    sea_basin: 'Arabian Sea',
    center: [16.0500, 73.4700],
    area_km2: 29,
    health_index: 84,
    key_species: 'Pearl Oysters, Sea Plumes, Bryozoans',
    primary_threat: 'Uncharted rocky contacts & abandoned fishing gear',
    hazard_proximity_count: 1
  }
];

export const MAJOR_INDIAN_PORTS = [
  { id: 'p1', name: 'JNPT / Mumbai Port', state: 'Maharashtra', coords: [18.9500, 72.9500] as [number, number], status: 'PASSABLE' },
  { id: 'p2', name: 'Chennai Port', state: 'Tamil Nadu', coords: [13.0850, 80.2950] as [number, number], status: 'RESTRICTED' },
  { id: 'p3', name: 'Cochin Port', state: 'Kerala', coords: [9.9650, 76.2670] as [number, number], status: 'PASSABLE' },
  { id: 'p4', name: 'Paradip Port', state: 'Odisha', coords: [20.2600, 86.6700] as [number, number], status: 'RESTRICTED' },
  { id: 'p5', name: 'Visakhapatnam Port', state: 'Andhra Pradesh', coords: [17.6850, 83.2850] as [number, number], status: 'PASSABLE' },
  { id: 'p6', name: 'Deendayal / Kandla Port', state: 'Gujarat', coords: [23.0000, 70.2200] as [number, number], status: 'PASSABLE' },
  { id: 'p7', name: 'Port Blair', state: 'Andaman & Nicobar', coords: [11.6700, 92.7400] as [number, number], status: 'PASSABLE' },
  { id: 'p8', name: 'Mormugao Port', state: 'Goa', coords: [15.4100, 73.8000] as [number, number], status: 'PASSABLE' }
];
