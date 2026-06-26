/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  GeoState, 
  GeoDistrict, 
  GeoTaluk, 
  CityVillage, 
  Area, 
  Street, 
  SubStreet, 
  ZoneRef, 
  SetSite, 
  RegistryDomain, 
  RegistryCategory,
  RegistryType,
  ActiveEntity,
  PendingEntity
} from "../types";

// 1. GEO SKELETON
export const states: GeoState[] = [
  { id: "GEO-TN", name: "Tamil Nadu" },
  { id: "GEO-PY", name: "Puducherry UT" }
];

export const districts: GeoDistrict[] = [
  { id: "GEO-TN-MAY", stateId: "GEO-TN", name: "Mayiladuthurai" },
  { id: "GEO-TN-CHN", stateId: "GEO-TN", name: "Chennai" },
  { id: "GEO-TN-CBE", stateId: "GEO-TN", name: "Coimbatore" },
  { id: "GEO-TN-MDU", stateId: "GEO-TN", name: "Madurai" },
  { id: "GEO-TN-TRY", stateId: "GEO-TN", name: "Tiruchirappalli" },
  { id: "GEO-TN-THA", stateId: "GEO-TN", name: "Thanjavur" },
  { id: "GEO-TN-NAG", stateId: "GEO-TN", name: "Nagapattinam" },
  { id: "GEO-TN-TIR", stateId: "GEO-TN", name: "Tiruvarur" },
  { id: "GEO-TN-CUD", stateId: "GEO-TN", name: "Cuddalore" },
  { id: "GEO-TN-SAL", stateId: "GEO-TN", name: "Salem" },
  { id: "GEO-TN-ERO", stateId: "GEO-TN", name: "Erode" },
  { id: "GEO-TN-TPR", stateId: "GEO-TN", name: "Tiruppur" },
  { id: "GEO-TN-VEL", stateId: "GEO-TN", name: "Vellore" },
  { id: "GEO-TN-TNV", stateId: "GEO-TN", name: "Tirunelveli" },
  { id: "GEO-TN-TUT", stateId: "GEO-TN", name: "Thoothukudi" },
  { id: "GEO-TN-KAN", stateId: "GEO-TN", name: "Kanyakumari" },
  { id: "GEO-TN-DHA", stateId: "GEO-TN", name: "Dharmapuri" },
  { id: "GEO-TN-KRI", stateId: "GEO-TN", name: "Krishnagiri" },
  { id: "GEO-TN-TVL", stateId: "GEO-TN", name: "Tiruvallur" },
  { id: "GEO-TN-KNC", stateId: "GEO-TN", name: "Kanchipuram" },
  { id: "GEO-TN-CHE", stateId: "GEO-TN", name: "Chengalpattu" },
  { id: "GEO-TN-VIL", stateId: "GEO-TN", name: "Villupuram" },
  { id: "GEO-TN-TVM", stateId: "GEO-TN", name: "Tiruvannamalai" },
  { id: "GEO-TN-PUD", stateId: "GEO-TN", name: "Pudukkottai" },
  { id: "GEO-TN-DIN", stateId: "GEO-TN", name: "Dindigul" },
  { id: "GEO-TN-KAR", stateId: "GEO-TN", name: "Karur" },
  { id: "GEO-TN-NAM", stateId: "GEO-TN", name: "Namakkal" },
  { id: "GEO-TN-NIL", stateId: "GEO-TN", name: "The Nilgiris" },
  { id: "GEO-TN-PER", stateId: "GEO-TN", name: "Perambalur" },
  { id: "GEO-TN-ARI", stateId: "GEO-TN", name: "Ariyalur" },
  { id: "GEO-TN-RAM", stateId: "GEO-TN", name: "Ramanathapuram" },
  { id: "GEO-TN-SIV", stateId: "GEO-TN", name: "Sivaganga" },
  { id: "GEO-TN-VIR", stateId: "GEO-TN", name: "Virudhunagar" },
  { id: "GEO-TN-THE", stateId: "GEO-TN", name: "Theni" },
  { id: "GEO-TN-TEN", stateId: "GEO-TN", name: "Tenkasi" },
  { id: "GEO-TN-KAL", stateId: "GEO-TN", name: "Kallakurichi" },
  { id: "GEO-TN-RAN", stateId: "GEO-TN", name: "Ranipet" },
  { id: "GEO-TN-TTP", stateId: "GEO-TN", name: "Tirupathur" },
  
  { id: "GEO-PY-KAR", stateId: "GEO-PY", name: "Karaikal" },
  { id: "GEO-PY-PUD", stateId: "GEO-PY", name: "Puducherry District" },
  { id: "GEO-PY-MAH", stateId: "GEO-PY", name: "Mahe" },
  { id: "GEO-PY-YAN", stateId: "GEO-PY", name: "Yanam" }
];

export const taluks: GeoTaluk[] = [
  // Mayiladuthurai Taluks
  { id: "GEO-TN-MAY-SIR", districtId: "GEO-TN-MAY", name: "Sirkazhi" },
  { id: "GEO-TN-MAY-MAY", districtId: "GEO-TN-MAY", name: "Mayiladuthurai" },
  { id: "GEO-TN-MAY-THA", districtId: "GEO-TN-MAY", name: "Tharangambadi" },
  { id: "GEO-TN-MAY-KUT", districtId: "GEO-TN-MAY", name: "Kuthalam" },

  // Chennai Taluks
  { id: "GEO-TN-CHN-MYL", districtId: "GEO-TN-CHN", name: "Mylapore" },
  { id: "GEO-TN-CHN-GUI", districtId: "GEO-TN-CHN", name: "Guindy" },
  { id: "GEO-TN-CHN-VEL", districtId: "GEO-TN-CHN", name: "Velachery" },
  { id: "GEO-TN-CHN-EGM", districtId: "GEO-TN-CHN", name: "Egmore" },
  { id: "GEO-TN-CHN-TON", districtId: "GEO-TN-CHN", name: "Tondiarpet" },
  { id: "GEO-TN-CHN-AMI", districtId: "GEO-TN-CHN", name: "Aminjikarai" },

  // Coimbatore Taluks
  { id: "GEO-TN-CBE-NTH", districtId: "GEO-TN-CBE", name: "Coimbatore North" },
  { id: "GEO-TN-CBE-STH", districtId: "GEO-TN-CBE", name: "Coimbatore South" },
  { id: "GEO-TN-CBE-POL", districtId: "GEO-TN-CBE", name: "Pollachi" },
  { id: "GEO-TN-CBE-MET", districtId: "GEO-TN-CBE", name: "Mettupalayam" },
  { id: "GEO-TN-CBE-SUL", districtId: "GEO-TN-CBE", name: "Sulur" },

  // Madurai Taluks
  { id: "GEO-TN-MDU-NTH", districtId: "GEO-TN-MDU", name: "Madurai North" },
  { id: "GEO-TN-MDU-STH", districtId: "GEO-TN-MDU", name: "Madurai South" },
  { id: "GEO-TN-MDU-MEL", districtId: "GEO-TN-MDU", name: "Melur" },
  { id: "GEO-TN-MDU-TMG", districtId: "GEO-TN-MDU", name: "Thirumangalam" },
  { id: "GEO-TN-MDU-VAD", districtId: "GEO-TN-MDU", name: "Vadipatti" },

  // Tiruchirappalli Taluks
  { id: "GEO-TN-TRY-EST", districtId: "GEO-TN-TRY", name: "Trichy East" },
  { id: "GEO-TN-TRY-WST", districtId: "GEO-TN-TRY", name: "Trichy West" },
  { id: "GEO-TN-TRY-SRI", districtId: "GEO-TN-TRY", name: "Srirangam" },
  { id: "GEO-TN-TRY-LAL", districtId: "GEO-TN-TRY", name: "Lalgudi" },
  { id: "GEO-TN-TRY-MNP", districtId: "GEO-TN-TRY", name: "Manapparai" },

  // Thanjavur Taluks
  { id: "GEO-TN-THA-THA", districtId: "GEO-TN-THA", name: "Thanjavur" },
  { id: "GEO-TN-THA-KUM", districtId: "GEO-TN-THA", name: "Kumbakonam" },
  { id: "GEO-TN-THA-PAP", districtId: "GEO-TN-THA", name: "Papanasam" },
  { id: "GEO-TN-THA-PAT", districtId: "GEO-TN-THA", name: "Pattukkottai" },
  { id: "GEO-TN-THA-THV", districtId: "GEO-TN-THA", name: "Thiruvaiyaru" },

  // Nagapattinam Taluks
  { id: "GEO-TN-NAG-NAG", districtId: "GEO-TN-NAG", name: "Nagapattinam" },
  { id: "GEO-TN-NAG-KIL", districtId: "GEO-TN-NAG", name: "Kilvelur" },
  { id: "GEO-TN-NAG-TKV", districtId: "GEO-TN-NAG", name: "Thirukkuvalai" },
  { id: "GEO-TN-NAG-VED", districtId: "GEO-TN-NAG", name: "Vedaranyam" },

  // Tiruvarur Taluks
  { id: "GEO-TN-TIR-TIR", districtId: "GEO-TN-TIR", name: "Tiruvarur" },
  { id: "GEO-TN-TIR-NAN", districtId: "GEO-TN-TIR", name: "Nannilam" },
  { id: "GEO-TN-TIR-MAN", districtId: "GEO-TN-TIR", name: "Mannargudi" },
  { id: "GEO-TN-TIR-KUD", districtId: "GEO-TN-TIR", name: "Kudavasal" },

  // Cuddalore Taluks
  { id: "GEO-TN-CUD-CUD", districtId: "GEO-TN-CUD", name: "Cuddalore" },
  { id: "GEO-TN-CUD-CHI", districtId: "GEO-TN-CUD", name: "Chidambaram" },
  { id: "GEO-TN-CUD-PAN", districtId: "GEO-TN-CUD", name: "Panruti" },
  { id: "GEO-TN-CUD-VRI", districtId: "GEO-TN-CUD", name: "Vriddhachalam" },

  // Salem Taluks
  { id: "GEO-TN-SAL-SAL", districtId: "GEO-TN-SAL", name: "Salem" },
  { id: "GEO-TN-SAL-ATT", districtId: "GEO-TN-SAL", name: "Attur" },
  { id: "GEO-TN-SAL-MET", districtId: "GEO-TN-SAL", name: "Mettur" },
  { id: "GEO-TN-SAL-OMA", districtId: "GEO-TN-SAL", name: "Omalur" },

  // Erode Taluks
  { id: "GEO-TN-ERO-ERO", districtId: "GEO-TN-ERO", name: "Erode" },
  { id: "GEO-TN-ERO-GOB", districtId: "GEO-TN-ERO", name: "Gobichettipalayam" },
  { id: "GEO-TN-ERO-SAB", districtId: "GEO-TN-ERO", name: "Sathyamangalam" },

  // Tiruppur Taluks
  { id: "GEO-TN-TPR-TPR", districtId: "GEO-TN-TPR", name: "Tiruppur" },
  { id: "GEO-TN-TPR-AVI", districtId: "GEO-TN-TPR", name: "Avinashi" },
  { id: "GEO-TN-TPR-PAL", districtId: "GEO-TN-TPR", name: "Palladam" },

  // Vellore Taluks
  { id: "GEO-TN-VEL-VEL", districtId: "GEO-TN-VEL", name: "Vellore" },
  { id: "GEO-TN-VEL-KAT", districtId: "GEO-TN-VEL", name: "Katpadi" },
  { id: "GEO-TN-VEL-GUD", districtId: "GEO-TN-VEL", name: "Gudiyatham" },

  // Tirunelveli Taluks
  { id: "GEO-TN-TNV-TNV", districtId: "GEO-TN-TNV", name: "Tirunelveli" },
  { id: "GEO-TN-TNV-PAL", districtId: "GEO-TN-TNV", name: "Palayamkottai" },
  { id: "GEO-TN-TNV-AMB", districtId: "GEO-TN-TNV", name: "Ambasamudram" },

  // Thoothukudi Taluks
  { id: "GEO-TN-TUT-TUT", districtId: "GEO-TN-TUT", name: "Thoothukudi" },
  { id: "GEO-TN-TUT-TIR", districtId: "GEO-TN-TUT", name: "Tiruchendur" },
  { id: "GEO-TN-TUT-KOV", districtId: "GEO-TN-TUT", name: "Kovilpatti" },

  // Kanyakumari Taluks
  { id: "GEO-TN-KAN-AGA", districtId: "GEO-TN-KAN", name: "Agastheeswaram" },
  { id: "GEO-TN-KAN-KAL", districtId: "GEO-TN-KAN", name: "Kalkulam" },

  // Dharmapuri Taluks
  { id: "GEO-TN-DHA-DHA", districtId: "GEO-TN-DHA", name: "Dharmapuri" },
  { id: "GEO-TN-DHA-HAR", districtId: "GEO-TN-DHA", name: "Harur" },

  // Krishnagiri Taluks
  { id: "GEO-TN-KRI-KRI", districtId: "GEO-TN-KRI", name: "Krishnagiri" },
  { id: "GEO-TN-KRI-HOS", districtId: "GEO-TN-KRI", name: "Hosur" },

  // Tiruvallur Taluks
  { id: "GEO-TN-TVL-TVL", districtId: "GEO-TN-TVL", name: "Tiruvallur" },
  { id: "GEO-TN-TVL-AVA", districtId: "GEO-TN-TVL", name: "Avadi" },

  // Kanchipuram Taluks
  { id: "GEO-TN-KNC-KNC", districtId: "GEO-TN-KNC", name: "Kanchipuram" },
  { id: "GEO-TN-KNC-SRP", districtId: "GEO-TN-KNC", name: "Sriperumbudur" },

  // Chengalpattu Taluks
  { id: "GEO-TN-CHE-CHE", districtId: "GEO-TN-CHE", name: "Chengalpattu" },
  { id: "GEO-TN-CHE-TAM", districtId: "GEO-TN-CHE", name: "Tambaram" },

  // Villupuram Taluks
  { id: "GEO-TN-VIL-VIL", districtId: "GEO-TN-VIL", name: "Villupuram" },
  { id: "GEO-TN-VIL-TIN", districtId: "GEO-TN-VIL", name: "Tindivanam" },

  // Tiruvannamalai Taluks
  { id: "GEO-TN-TVM-TVM", districtId: "GEO-TN-TVM", name: "Tiruvannamalai" },
  { id: "GEO-TN-TVM-ARA", districtId: "GEO-TN-TVM", name: "Arani" },

  // Pudukkottai Taluks
  { id: "GEO-TN-PUD-PUD", districtId: "GEO-TN-PUD", name: "Pudukkottai" },
  { id: "GEO-TN-PUD-ARA", districtId: "GEO-TN-PUD", name: "Aranthangi" },

  // Dindigul Taluks
  { id: "GEO-TN-DIN-DIN", districtId: "GEO-TN-DIN", name: "Dindigul" },
  { id: "GEO-TN-DIN-KOD", districtId: "GEO-TN-DIN", name: "Kodaikanal" },

  // Karur Taluks
  { id: "GEO-TN-KAR-KAR", districtId: "GEO-TN-KAR", name: "Karur" },
  { id: "GEO-TN-KAR-KUL", districtId: "GEO-TN-KAR", name: "Kulithalai" },

  // Namakkal Taluks
  { id: "GEO-TN-NAM-NAM", districtId: "GEO-TN-NAM", name: "Namakkal" },
  { id: "GEO-TN-NAM-TGO", districtId: "GEO-TN-NAM", name: "Tiruchengode" },

  // Nilgiris Taluks
  { id: "GEO-TN-NIL-UDH", districtId: "GEO-TN-NIL", name: "Udhagamandalam" },
  { id: "GEO-TN-NIL-COO", districtId: "GEO-TN-NIL", name: "Coonoor" },

  // Perambalur Taluks
  { id: "GEO-TN-PER-PER", districtId: "GEO-TN-PER", name: "Perambalur" },

  // Ariyalur Taluks
  { id: "GEO-TN-ARI-ARI", districtId: "GEO-TN-ARI", name: "Ariyalur" },

  // Ramanathapuram Taluks
  { id: "GEO-TN-RAM-RAM", districtId: "GEO-TN-RAM", name: "Ramanathapuram" },
  { id: "GEO-TN-RAM-RMS", districtId: "GEO-TN-RAM", name: "Rameswaram" },

  // Sivaganga Taluks
  { id: "GEO-TN-SIV-SIV", districtId: "GEO-TN-SIV", name: "Sivaganga" },
  { id: "GEO-TN-SIV-KKI", districtId: "GEO-TN-SIV", name: "Karaikudi" },

  // Virudhunagar Taluks
  { id: "GEO-TN-VIR-VIR", districtId: "GEO-TN-VIR", name: "Virudhunagar" },
  { id: "GEO-TN-VIR-SIV", districtId: "GEO-TN-VIR", name: "Sivakasi" },

  // Theni Taluks
  { id: "GEO-TN-THE-THE", districtId: "GEO-TN-THE", name: "Theni" },

  // Tenkasi Taluks
  { id: "GEO-TN-TEN-TEN", districtId: "GEO-TN-TEN", name: "Tenkasi" },

  // Kallakurichi Taluks
  { id: "GEO-TN-KAL-KAL", districtId: "GEO-TN-KAL", name: "Kallakurichi" },

  // Ranipet Taluks
  { id: "GEO-TN-RAN-RAN", districtId: "GEO-TN-RAN", name: "Ranipet" },

  // Tirupathur Taluks
  { id: "GEO-TN-TTP-TTP", districtId: "GEO-TN-TTP", name: "Tirupathur" },

  // Puducherry UT Districts / Taluks
  { id: "GEO-PY-KAR-TAL", districtId: "GEO-PY-KAR", name: "Karaikal Commune" },
  { id: "GEO-PY-PUD-TAL", districtId: "GEO-PY-PUD", name: "Puducherry Commune" },
  { id: "GEO-PY-MAH-TAL", districtId: "GEO-PY-MAH", name: "Mahe Commune" },
  { id: "GEO-PY-YAN-TAL", districtId: "GEO-PY-YAN", name: "Yanam Commune" }
];

// 2. ZONE SKELETON (Settlements)
export const citiesVillages: CityVillage[] = [
  { id: "ZON-CITY-001", talukId: "GEO-TN-MAY-SIR", name: "Sirkazhi City" },
  { id: "ZON-CITY-002", talukId: "GEO-TN-MAY-SIR", name: "Thirumullaivasal Village" },
  { id: "ZON-CITY-003", talukId: "GEO-TN-MAY-MAY", name: "Mayiladuthurai Town" },
  { id: "ZON-CITY-004", talukId: "GEO-TN-MAY-THA", name: "Poompuhar Heritage Coast" },
  { id: "ZON-CITY-005", talukId: "GEO-TN-MAY-SIR", name: "Vaitheeswarankoil Townlet" },
  { id: "ZON-CITY-PY1", talukId: "GEO-PY-KAR-TAL", name: "Karaikal Town Center" },
  { id: "ZON-CITY-PY2", talukId: "GEO-PY-KAR-TAL", name: "Kottucherry Village" }
];

export const areas: Area[] = [
  // Sirkazhi City Areas
  { id: "ZON-AREA-101", cityVillageId: "ZON-CITY-001", name: "Pattamangala Ward" },
  { id: "ZON-AREA-102", cityVillageId: "ZON-CITY-001", name: "Thenpathi Area" },
  { id: "ZON-AREA-103", cityVillageId: "ZON-CITY-001", name: "Vadagarai Suburbs" },
  // Thirumullaivasal
  { id: "ZON-AREA-201", cityVillageId: "ZON-CITY-002", name: "Fisherman Bay Wharf" },
  // Mayiladuthurai Town
  { id: "ZON-AREA-301", cityVillageId: "ZON-CITY-003", name: "Kaveri Riverfront Ward" },
  { id: "ZON-AREA-302", cityVillageId: "ZON-CITY-003", name: "Town Junction Trade center" },
  // Karaikal UT Areas
  { id: "ZON-AREA-PY101", cityVillageId: "ZON-CITY-PY1", name: "Karaikal Port Vista" },
  { id: "ZON-AREA-PY102", cityVillageId: "ZON-CITY-PY2", name: "Kottucherry Main Street Area" }
];

export const streets: Street[] = [
  // Pattamangala Ward Streets
  { id: "ZON-STR-501", areaId: "ZON-AREA-101", name: "South Car Street (Temple)", substreetsCount: 2 },
  { id: "ZON-STR-502", areaId: "ZON-AREA-101", name: "North Car Street (Market)", substreetsCount: 1 },
  { id: "ZON-STR-503", areaId: "ZON-AREA-101", name: "Gandhi High Road", substreetsCount: 0 },
  // Thenpathi
  { id: "ZON-STR-504", areaId: "ZON-AREA-102", name: "Sirkazhi Bazaar Street", substreetsCount: 3 },
  { id: "ZON-STR-505", areaId: "ZON-AREA-102", name: "Railway Station Border Road", substreetsCount: 0 },
  // Fisherman Bay
  { id: "ZON-STR-506", areaId: "ZON-AREA-201", name: "East Port Pathway", substreetsCount: 1 },
  // Kaveri Riverfront
  { id: "ZON-STR-507", areaId: "ZON-AREA-301", name: "Kaveri South Main Road", substreetsCount: 2 },
  // Karaikal Port Vista
  { id: "ZON-STR-PY501", areaId: "ZON-AREA-PY101", name: "Beach Road Port Boulevard", substreetsCount: 1 }
];

export const substreets: SubStreet[] = [
  { id: "ZON-SUB-901", streetId: "ZON-STR-501", name: "Srinivasa Sannidhi Lane" },
  { id: "ZON-SUB-902", streetId: "ZON-STR-501", name: "Pradakshina Corner Track" },
  { id: "ZON-SUB-903", streetId: "ZON-STR-502", name: "Vellalar Lane" },
  { id: "ZON-SUB-904", streetId: "ZON-STR-504", name: "Pillayar Kovil Cross Track" },
  { id: "ZON-SUB-905", streetId: "ZON-STR-504", name: "Anjaneyar Lane" },
  { id: "ZON-SUB-PY901", streetId: "ZON-STR-PY501", name: "Customs Office Back Alley" }
];

// Helper to rebuild current full list of zone packages
export function generateZoneRefs(): ZoneRef[] {
  const refs: ZoneRef[] = [];
  
  for (const s of streets) {
    const a = areas.find(x => x.id === s.areaId);
    if (!a) continue;
    const cv = citiesVillages.find(x => x.id === a.cityVillageId);
    if (!cv) continue;
    const t = taluks.find(x => x.id === cv.talukId);
    if (!t) continue;
    
    const dist = districts.find(d => d.id === t.districtId);
    const distName = dist ? dist.name : "Mayiladuthurai";
    const stateId = dist ? dist.stateId : "GEO-TN";
    
    // Add primary street zone reference
    const street_pk = `ZON-${cv.id.split("-")[2]}-${a.id.split("-")[2]}-${s.id.split("-")[2]}`;
    refs.push({
      zone_pk: street_pk,
      stateId: stateId,
      districtId: t.districtId,
      talukId: t.id,
      cityVillageId: cv.id,
      areaId: a.id,
      streetId: s.id,
      substreetId: null,
      fullAddress: `${s.name}, ${a.name}, ${cv.name}, ${t.name}, ${distName} District`
    });

    // Add sub-streets
    const relevantSubs = substreets.filter(sub => sub.streetId === s.id);
    for (const sub of relevantSubs) {
      const sub_pk = `${street_pk}-SUB-${sub.id.split("-")[2]}`;
      refs.push({
        zone_pk: sub_pk,
        stateId: stateId,
        districtId: t.districtId,
        talukId: t.id,
        cityVillageId: cv.id,
        areaId: a.id,
        streetId: s.id,
        substreetId: sub.id,
        fullAddress: `${sub.name}, ${s.name}, ${a.name}, ${cv.name}, ${t.name}, ${distName} Dist`
      });
    }
  }
  
  return refs;
}

// 3. THE 11 MASTER DOMAINS (Finalized Utility-Based Classification)
export const masterDomains: RegistryDomain[] = [
  {
    code: "MED",
    name: "Medicinal",
    description: "Multi-Specialty & Rural Hospitals, Local Clinics, Pharmacies, and Diagnostics",
    color: "emerald",
    icon: "Heart"
  },
  {
    code: "EDU",
    name: "Education",
    description: "Schools, Arts & Science Colleges, Rural Tuition Centers, and Public Libraries",
    color: "blue",
    icon: "GraduationCap"
  },
  {
    code: "ADM",
    name: "Administrative",
    description: "Strictly regulatory units: Taluk Offices, local Magistrate Courts, Police and Post Stations",
    color: "indigo",
    icon: "Briefcase"
  },
  {
    code: "FIN",
    name: "Finance",
    description: "Cooperative banks, insurance affiliates, rural ATMs, and micro-credit portals",
    color: "amber",
    icon: "Coins"
  },
  {
    code: "AGR",
    name: "Agriculture",
    description: "Seed/Fertilizer storage depots, wholesale Rice Mills, and Cold Storage silos",
    color: "green",
    icon: "Sprout"
  },
  {
    code: "IND",
    name: "Industrial",
    description: "Small-scale weaving plants, engineering workshops, and agro-processing factories",
    color: "cyan",
    icon: "Factory"
  },
  {
    code: "RET",
    name: "Retail",
    description: "Bazaar stalls, textile houses, hardware providers, and local jewelry merchants",
    color: "violet",
    icon: "ShoppingBag"
  },
  {
    code: "FOO",
    name: "Food & Bev",
    description: "Traditional mess outlets, hotels, bakeries, tea shops, and event caterers",
    color: "rose",
    icon: "Utensils"
  },
  {
    code: "SPO",
    name: "Sport/Well",
    description: "Wellness and martial arts circles, local gyms, stadiums, and yoga pads",
    color: "purple",
    icon: "Smile"
  },
  {
    code: "TRP",
    name: "Transport",
    description: "Bus terminals, rail junctions, shuttle parks, post couriers, and fuel stations",
    color: "sky",
    icon: "Bus"
  },
  {
    code: "TOU",
    name: "Tour/Heritage",
    description: "Ancient temples, heritage mosques, commemorative churches, historical sites & parks",
    color: "orange",
    icon: "MapPin"
  }
];

// 3.1 MASTER CATEGORIES (Grouping domains under specific categories)
export const masterCategories: RegistryCategory[] = [
  { pk: "CAT-MED-101", domainCode: "MED", name: "Hospitals & Diagnostics", description: "Government and private primary/secondary sanitarium centers and multi-specialty clinics" },
  { pk: "CAT-MED-103", domainCode: "MED", name: "Specialized Clinics", description: "Independent practitioner dental clinics, maternity labs, pediatrics and rural doctors" },
  { pk: "CAT-MED-105", domainCode: "MED", name: "Retail Pharmacies", description: "24/7 retail pharmacies, emergency dispensaries and wholesale medical distributors" },
  
  { pk: "CAT-EDU-201", domainCode: "EDU", name: "Academic Schools", description: "Primary, secondary and nursery educational institutions managed by public/private sector" },
  { pk: "CAT-EDU-202", domainCode: "EDU", name: "Higher Education", description: "Arts & science, polytechnic, engineering colleges and technical training institutes" },
  { pk: "CAT-EDU-203", domainCode: "EDU", name: "Public Libraries", description: "Government taluk libraries, community reading rooms and private archival setups" },

  { pk: "CAT-ADM-301", domainCode: "ADM", name: "Judicial & Administration Complexes", description: "Taluk offices, magistrate court arenas, administrative government blocks" },
  { pk: "CAT-ADM-315", domainCode: "ADM", name: "Legal Consulting Units", description: "Attorney chambers, notary public hubs, legal aid advocates and filing offices" },

  { pk: "CAT-FIN-601", domainCode: "FIN", name: "Cooperative Banks", description: "Primary agricultural bank credit associations, rural cooperative funds and ATMs" },
  { pk: "CAT-FIN-602", domainCode: "FIN", name: "Insurance & Micro-Credit Portal", description: "Microfinance centers, small business credit nodes and LIC advisory desks" },

  { pk: "CAT-AGR-501", domainCode: "AGR", name: "Seeds & Farm Supplies Depot", description: "Government fertilizer depots, organic seed counters and wholesale pesticide suppliers" },
  { pk: "CAT-AGR-502", domainCode: "AGR", name: "Wholesale Processing Mills", description: "High capacity rice thrashing mills, paddy bulk warehousing, food processing silos" },

  { pk: "CAT-IND-101", domainCode: "IND", name: "Agro-processing Factories", description: "Rice huller engineering workshops, textile loom plants, sub-urban weaving units" },

  { pk: "CAT-RET-201", domainCode: "RET", name: "Bazaars & Grocery Depots", description: "Paddy wholesale shops, provisions hubs, wholesale vegetable stands" },
  { pk: "CAT-RET-250", domainCode: "RET", name: "Hardware Store Network", description: "Building materials, electrical wiring stalls, hardware accessories" },
  { pk: "CAT-RET-299", domainCode: "RET", name: "Apparel & Tailoring Stations", description: "Traditional saree weaving centers, designer tailors, dry-cleaning units" },

  { pk: "CAT-FOO-401", domainCode: "FOO", name: "Sweets & Bakery Outlets", description: "Bakeries, traditional HALWA/sweet stalls, dairy products and juice spots" },
  { pk: "CAT-FOO-402", domainCode: "FOO", name: "Traditional Indian Mess", description: "Vegetarian feeding homes, non-veg messes, local tea shops and caterers" },

  { pk: "CAT-SPO-801", domainCode: "SPO", name: "Wellness & Gymnasiums", description: "Kari/Silambam martial arts camps, bodybuilding centers, public playgrounds" },

  { pk: "CAT-TRP-801", domainCode: "TRP", name: "Transit Stands & Terminals", description: "Bus transit points, regional auto-rickshaw bays, shuttle service centers" },

  { pk: "CAT-TOU-701", domainCode: "TOU", name: "Ancient Temples & shrines", description: "Highly historic spiritual architectures governed by HR&CE or local Waqf / Dioceses" },
  { pk: "CAT-TOU-704", domainCode: "TOU", name: "Pilgrimage Sannidhi Halls", description: "Traditional choultries, pilgrimage marriage complexes, assembly halls" },
  { pk: "CAT-TOU-722", domainCode: "TOU", name: "Spiritual Ashrams & Parks", description: "Meditation centers, ashrams, sacred groves and archaeological parks" }
];

// 3.2 MASTER TYPES (Classifications / precise business profiles within categories)
export const masterTypes: RegistryType[] = [
  { pk: "TYP-MED-101-01", categoryPk: "CAT-MED-101", name: "Government Taluk Hospital", description: "Public state-run multi specialty hospital offering free medical outpatient clinics" },
  { pk: "TYP-MED-101-02", categoryPk: "CAT-MED-101", name: "Diagnostics Center", description: "Imaging labs, blood draw clinics, and private ultrasound diagnostics centers" },
  { pk: "TYP-MED-103-01", categoryPk: "CAT-MED-103", name: "Private Dental Practice", description: "Orthodontics, cosmetic dental surgery, and general oral cleaning suites" },
  { pk: "TYP-MED-103-02", categoryPk: "CAT-MED-103", name: "Rural General Practitioner Hub", description: "Family physicians, emergency pediatric checkups, and general consultation desks" },
  { pk: "TYP-MED-105-01", categoryPk: "CAT-MED-105", name: "24-Hour Retail Pharmacy", description: "Allopathy, homeopathy, and siddha medicines retailer operating all day" },

  { pk: "TYP-ADM-301-01", categoryPk: "CAT-ADM-301", name: "Taluk Revenue Office Complex", description: "Administrative center for land registries, certificates, and surveyor deployments" },
  { pk: "TYP-ADM-315-01", categoryPk: "CAT-ADM-315", name: "Legal Counsel & Litigation Attorney", description: "Practicing advocate chambers dealing with property disputes and civil law" },
  { pk: "TYP-ADM-315-02", categoryPk: "CAT-ADM-315", name: "Notary Public & Document Writer", description: "Accredited stamp document drafter and physical deed writers" },

  { pk: "TYP-AGR-501-01", categoryPk: "CAT-AGR-501", name: "Wholesale Seeds & Fertilizers Supplier", description: "Fertilizer storage depots, wholesale Rice seed providers" },
  { pk: "TYP-FIN-602-01", categoryPk: "CAT-FIN-602", name: "Micro-Credit Cooperative Affiliate", description: "Cooperative loans, gold lending portals, and crop insurance desk" },

  { pk: "TYP-RET-201-01", categoryPk: "CAT-RET-201", name: "Provisions Store & Supermarket", description: "Wholesale and retail grains, pulses, and household grocery products" },
  { pk: "TYP-RET-250-01", categoryPk: "CAT-RET-250", name: "Retail Hardware Store", description: "Screws, steel rods, copper wire, paint buckets, and electrical panels" },
  { pk: "TYP-RET-299-01", categoryPk: "CAT-RET-299", name: "Custom Tailoring Workshop", description: "Saree designing, formal stitch crafting, and alterations" },

  { pk: "TYP-FOO-401-01", categoryPk: "CAT-FOO-401", name: "Sweets Station & Bakery Outlet", description: "Deeply fried savories, halwas, birthday cakes, and evening snacks" },
  { pk: "TYP-FOO-402-01", categoryPk: "CAT-FOO-402", name: "Traditional South Indian Mess", description: "Traditional rice plates, idli breakfasts, parotta dinners, and tea-shop" },

  { pk: "TYP-TRP-801-01", categoryPk: "CAT-TRP-801", name: "Sub-Urban Passenger Transit & Auto Stand", description: "Commuters hub and central regional autorickshaw stands" },

  { pk: "TYP-TOU-701-01", categoryPk: "CAT-TOU-701", name: "Ancient Shiva Sthalam (HR&CE Department)", description: "Major religious temple landmark operating under the HR&CE Act" },
  { pk: "TYP-TOU-701-03", categoryPk: "CAT-TOU-701", name: "Commemorative Sacred Structure / Church", description: "Landmark religious prayer spaces with visual heritage structures" },
  { pk: "TYP-TOU-704-01", categoryPk: "CAT-TOU-704", name: "Heritage Pilgrimage Assembly Hall", description: "Choultries and mandapams for pilgrims to assemble and stay" },
  { pk: "TYP-TOU-722-01", categoryPk: "CAT-TOU-722", name: "Spiritual Ashram & Meditation Center", description: "Secluded forest Ashrams, yoga pavilions and meditation halls" }
];

// 4. SEED SITES (Dynamic multi-tenant profiles)
export const seedSites: SetSite[] = [
  {
    site_id: "SITE-001",
    title: "Sirkazhi Ancient Temple & Heritage Portal",
    subdomain: "sirkazhi-heritage",
    description: "An official spiritual tourism portal cataloging temples, historic choultries, transport, and traditional food options adjacent to South and North Car Streets.",
    themeColor: "#ea580c", // Orange
    primaryDomain: "TOU",
    zoneIds: [
      "ZON-001-101-501", // South Car Street
      "ZON-001-101-501-SUB-901", // Srinivasa Sannidhi Lane
      "ZON-001-101-501-SUB-902", // Pradakshina Corner Track
      "ZON-001-102-504-SUB-904" // Pillayar Kovil Cross Track
    ],
    status: "active"
  },
  {
    site_id: "SITE-002",
    title: "Mayiladuthurai Medical Dispatch & Safety Network",
    subdomain: "may-health",
    description: "Unified public dispatch mapping medicinal resources, private specialized practices, pharmacies, and surrounding administrative support nodes.",
    themeColor: "#10b981", // Emerald
    primaryDomain: "MED",
    zoneIds: [
      "ZON-001-101-503", // Gandhi High Road
      "ZON-003-301-507"  // Kaveri South Main Road
    ],
    status: "active"
  },
  {
    site_id: "SITE-003",
    title: "Sirkazhi Retail Bazaar & Commerce Guide",
    subdomain: "sirkazhi-bazaar",
    description: "Digital business catalog listing local grocery depots, textile houses, hardware stores, and traditional professional services in the main shopping corridor.",
    themeColor: "#8b5cf6", // Violet
    primaryDomain: "RET",
    zoneIds: [
      "ZON-001-101-502", // North Car Street (Market)
      "ZON-001-110-502-SUB-903", // Vellalar Lane
      "ZON-001-102-504", // Sirkazhi Bazaar Street
      "ZON-001-102-504-SUB-905" // Anjaneyar Lane
    ],
    status: "active"
  }
];

// 5. MASTER ACTIVE ENTITIES (State L1 Database)
export const seedActiveEntities: ActiveEntity[] = [
  // TOU Domain (Spiritual/Heritage placed under Tourism)
  {
    entity_pk: "ENT-000001",
    entity_name: "Sirkazhi Bhramapureeswarar Temple",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-501",
    substreetId: null,
    zone_pk: "ZON-001-101-501",
    primary_domain: "TOU",
    secondary_domains: [],
    category_pk: "CAT-TOU-701",
    category_name: "Ancient Shiva Sthalam (HR&CE Department)",
    phone: "+91 4364 270258",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-06-20T14:30:00Z"
  },
  {
    entity_pk: "ENT-000002",
    entity_name: "Sattainathar Temple Sannidhi Mandapam",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-501",
    substreetId: "ZON-SUB-901",
    zone_pk: "ZON-001-101-501-SUB-901",
    primary_domain: "TOU",
    secondary_domains: ["ADM"],
    category_pk: "CAT-TOU-704",
    category_name: "Heritage Pilgrimage Assembly Hall",
    phone: "+91 4364 270110",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-01-15T09:20:00Z",
    updatedAt: "2026-04-12T11:00:00Z"
  },
  // MED Domain
  {
    entity_pk: "ENT-000003",
    entity_name: "Sirkazhi Municipal Government Hospital",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-503",
    substreetId: null,
    zone_pk: "ZON-001-101-503",
    primary_domain: "MED",
    secondary_domains: ["ADM"], // Function first (Govt Hospital is in MEDICINAL, tagged ADM secondary)
    category_pk: "CAT-MED-101",
    category_name: "Government Taluk Hospital",
    phone: "+91 4364 270414",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-02-05T08:00:00Z",
    updatedAt: "2026-06-18T10:00:00Z"
  },
  {
    entity_pk: "ENT-000004",
    entity_name: "Sri Abirami Pharmacy",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-503",
    substreetId: null,
    zone_pk: "ZON-001-101-503",
    primary_domain: "MED",
    secondary_domains: ["RET"],
    category_pk: "CAT-MED-105",
    category_name: "24-Hour Retail Pharmacy",
    phone: "+91 94432 12345",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-02-12T14:00:00Z",
    updatedAt: "2026-05-22T09:00:00Z"
  },
  // ADM Domain
  {
    entity_pk: "ENT-000005",
    entity_name: "Sirkazhi Taluk Office & Magistrate Complex",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-503",
    substreetId: null,
    zone_pk: "ZON-001-101-503",
    primary_domain: "ADM",
    secondary_domains: [],
    category_pk: "CAT-ADM-301",
    category_name: "Government Revenue Department Office",
    phone: "+91 4364 270222",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z"
  },
  // RET Domain
  {
    entity_pk: "ENT-000006",
    entity_name: "Vasantham Silk House & Textiles",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-502",
    substreetId: null,
    zone_pk: "ZON-001-101-502",
    primary_domain: "RET",
    secondary_domains: [],
    category_pk: "CAT-RET-202",
    category_name: "Traditional Clothing & Silk Showroom",
    phone: "+91 4364 270388",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-06-15T12:00:00Z"
  },
  {
    entity_pk: "ENT-000007",
    entity_name: "Murugan Vessels Store",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-502",
    substreetId: "ZON-SUB-903",
    zone_pk: "ZON-001-101-502-SUB-903",
    primary_domain: "RET",
    secondary_domains: [],
    category_pk: "CAT-RET-211",
    category_name: "Kitchen Brassware & Retail Hardware",
    phone: "+91 94441 55667",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-03-10T11:40:00Z",
    updatedAt: "2026-03-10T11:40:00Z"
  },
  // FOO Domain
  {
    entity_pk: "ENT-000008",
    entity_name: "Sri Mangalambika Traditional Hotel & Mess",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-501",
    substreetId: null,
    zone_pk: "ZON-001-101-501",
    primary_domain: "FOO",
    secondary_domains: [],
    category_pk: "CAT-FOO-402",
    category_name: "Traditional Vegetarian Restaurant",
    phone: "+91 4364 270901",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-02-18T07:22:00Z",
    updatedAt: "2026-06-21T21:00:00Z"
  },
  // AGR Domain
  {
    entity_pk: "ENT-000009",
    entity_name: "Cauvery Delta Seed Traders",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-102",
    streetId: "ZON-STR-504",
    substreetId: null,
    zone_pk: "ZON-001-102-504",
    primary_domain: "AGR",
    secondary_domains: ["RET"],
    category_pk: "CAT-AGR-501",
    category_name: "Agricultural Seeds & Fertilizer Retail",
    phone: "+91 94861 88990",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-01-20T09:00:00Z",
    updatedAt: "2026-04-10T15:30:00Z"
  },
  // FIN Domain
  {
    entity_pk: "ENT-000010",
    entity_name: "Sirkazhi Primary Agricultural Cooperative Bank",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-102",
    streetId: "ZON-STR-504",
    substreetId: "ZON-SUB-905",
    zone_pk: "ZON-001-102-504-SUB-905",
    primary_domain: "FIN",
    secondary_domains: ["ADM"],
    category_pk: "CAT-FIN-602",
    category_name: "Primary Cooperative Society & Bank",
    phone: "+91 4364 270059",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-05-15T16:00:00Z"
  },
  // TRP Domain
  {
    entity_pk: "ENT-000011",
    entity_name: "Sirkazhi Main Bus Station Terminal",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-102",
    streetId: "ZON-STR-504",
    substreetId: null,
    zone_pk: "ZON-001-102-504",
    primary_domain: "TRP",
    secondary_domains: ["ADM"],
    category_pk: "CAT-TRP-801",
    category_name: "Municipal Bus Stand Junction",
    phone: "+91 4364 270555",
    visibility_type: "Public",
    status: "active",
    createdAt: "2026-01-10T06:00:00Z",
    updatedAt: "2026-01-10T06:00:00Z"
  },
  // Private / Home work-from-home verification example (SERVICE under secondary, MED primary as mentalist clinic)
  {
    entity_pk: "ENT-000012",
    entity_name: "Advocate S. Swaminathan (Legal Council)",
    stateId: "GEO-TN",
    districtId: "GEO-TN-MAY",
    talukId: "GEO-TN-MAY-SIR",
    cityVillageId: "ZON-CITY-001",
    areaId: "ZON-AREA-101",
    streetId: "ZON-STR-501",
    substreetId: "ZON-SUB-902",
    zone_pk: "ZON-001-101-501-SUB-902",
    primary_domain: "ADM", // Adm/Legal
    secondary_domains: [],
    category_pk: "CAT-ADM-315",
    category_name: "Independent Legal Consultant & Notary",
    phone: "+91 94435 99881",
    visibility_type: "Private/Home", // Marks home-based attorney
    status: "active",
    createdAt: "2026-04-20T11:00:00Z",
    updatedAt: "2026-06-19T14:00:00Z"
  }
];

// 6. CSV SIMULATOR PACKETS (Used for testing and showcasing the validation engine)
export const csvTemplates: {
  id: string;
  filename: string;
  description: string;
  type: "perfect" | "errors" | "private_heavy";
  rawContent: string;
  parsedRecords: PendingEntity[];
} = {
  id: "preset-perfect",
  filename: "sirkazhi_bazaar_perfect.csv",
  description: "Contains 4 flawless entries with valid domains, exact categorizations, and matching Zone PKs.",
  type: "perfect",
  rawContent: `Entity Name,Primary Domain,Category PK,Category Name,Zone PK,Phone,Visibility
Vani Sweets & Bakery,FOO,CAT-FOO-401,Bakery Outlet,ZON-001-102-504,+91 94420 88221,Public
Annai Dental Clinic,MED,CAT-MED-103,Dental Practice,ZON-001-101-503,+91 4364 270772,Public
Murali Hardware Traders,RET,CAT-RET-250,Hardware Shop,ZON-001-102-504,+91 98940 33445,Public
Arun Advocate Chambers,ADM,CAT-ADM-315,Legal Counsel Office,ZON-001-101-501-SUB-901,+91 94431 82928,Private/Home`,
  parsedRecords: [
    {
      id: "pending-100",
      entity_name: "Vani Sweets & Bakery",
      target_zone_pk: "ZON-001-102-504",
      primary_domain: "FOO",
      category_pk: "CAT-FOO-401",
      category_name: "Bakery Outlet",
      phone: "+91 94420 88221",
      visibility_type: "Public",
      validationErrors: [],
      validationWarnings: [],
      status: "pending",
      reportedBy: "Area Inspector R. Chidambaram",
      surveyDate: "2026-06-20"
    },
    {
      id: "pending-101",
      entity_name: "Annai Dental Clinic",
      target_zone_pk: "ZON-001-101-503",
      primary_domain: "MED",
      category_pk: "CAT-MED-103",
      category_name: "Dental Practice",
      phone: "+91 4364 270772",
      visibility_type: "Public",
      validationErrors: [],
      validationWarnings: [],
      status: "pending",
      reportedBy: "Area Inspector R. Chidambaram",
      surveyDate: "2026-06-20"
    },
    {
      id: "pending-102",
      entity_name: "Murali Hardware Traders",
      target_zone_pk: "ZON-001-102-504",
      primary_domain: "RET",
      category_pk: "CAT-RET-250",
      category_name: "Hardware Shop",
      phone: "+91 98940 33445",
      visibility_type: "Public",
      validationErrors: [],
      validationWarnings: [],
      status: "pending",
      reportedBy: "Area Inspector R. Chidambaram",
      surveyDate: "2026-06-20"
    },
    {
      id: "pending-103",
      entity_name: "Arun Advocate Chambers",
      target_zone_pk: "ZON-001-101-501-SUB-901",
      primary_domain: "ADM",
      category_pk: "CAT-ADM-315",
      category_name: "Legal Counsel Office",
      phone: "+91 94431 82928",
      visibility_type: "Private/Home",
      validationErrors: [],
      validationWarnings: [],
      status: "pending",
      reportedBy: "Area Inspector R. Chidambaram",
      surveyDate: "2026-06-20"
    }
  ]
};

export const csvTemplateErrors = {
  id: "preset-errors",
  filename: "sirkazhi_draft_with_typos.csv",
  description: "Simulates an actual field survey file which has spelling/boundary bugs, duplication conflicts, or incorrect Domain tags.",
  type: "errors",
  rawContent: `Entity Name,Primary Domain,Category PK,Category Name,Zone PK,Phone,Visibility
Cauvery Delta Seed Traders,AGR,CAT-AGR-501,Seeds Store,ZON-001-102-504,+91 94861 88990,Public
Sirkazhi Municipal Government Hospital,MED,CAT-MED-101,Municipal Hospital,ZON-001-101-503,+91 4364 270414,Public
Radha Krishnan Ashram,RELIGIOUS,CAT-TOU-722,Spiritual Ashram,ZON-999-NON-EXISTENT,+91 94431 11223,Public
Sri Swamy Tailors,RET,CAT-RET-299,Tailor Workshop,ZON-001-101-502,,Public`,
  parsedRecords: [
    {
      id: "pending-200",
      entity_name: "Cauvery Delta Seed Traders",
      target_zone_pk: "ZON-001-102-504",
      primary_domain: "AGR",
      category_pk: "CAT-AGR-501",
      category_name: "Seeds Store",
      phone: "+91 94861 88990",
      visibility_type: "Public",
      validationErrors: [],
      validationWarnings: ["Duplicate Threat: An entity with name 'Cauvery Delta Seed Traders' is already ACTIVE under ENT-000009 in this exact Zone."],
      status: "pending",
      reportedBy: "Assistant Surveyor K. Rajan",
      surveyDate: "2026-06-22"
    },
    {
      id: "pending-201",
      entity_name: "Sirkazhi Municipal Government Hospital",
      target_zone_pk: "ZON-001-101-503",
      primary_domain: "MED",
      category_pk: "CAT-MED-101",
      category_name: "Municipal Hospital",
      phone: "+91 4364 270414",
      visibility_type: "Public",
      validationErrors: [],
      validationWarnings: ["Duplicate Threat: 'Sirkazhi Municipal Government Hospital' already committed under ENT-000003."],
      status: "pending",
      reportedBy: "Assistant Surveyor K. Rajan",
      surveyDate: "2026-06-22"
    },
    {
      id: "pending-202",
      entity_name: "Radha Krishnan Ashram",
      target_zone_pk: "ZON-999-NON-EXISTENT",
      primary_domain: "RELIGIOUS",
      category_pk: "CAT-TOU-722",
      category_name: "Spiritual Ashram",
      phone: "+91 94431 11223",
      visibility_type: "Public",
      validationErrors: [
        "Domain Code Rejected: 'RELIGIOUS' is not one of the 11 utility-based domains. Change to 'TOU' under our Tourism & Heritage relocation rule.",
        "Address Validation Failure: Zone PK 'ZON-999-NON-EXISTENT' does not register in Level 1 Database master codes."
      ],
      validationWarnings: [],
      status: "pending",
      reportedBy: "Assistant Surveyor K. Rajan",
      surveyDate: "2026-06-22"
    },
    {
      id: "pending-203",
      entity_name: "Sri Swamy Tailors",
      target_zone_pk: "ZON-001-101-502",
      primary_domain: "RET",
      category_pk: "CAT-RET-299",
      category_name: "Tailor Workshop",
      phone: "",
      visibility_type: "Public",
      validationErrors: [
        "Data Quality Breach: Phone contact field cannot be blank for standard 'Public' business frontage."
      ],
      validationWarnings: [],
      status: "pending",
      reportedBy: "Assistant Surveyor K. Rajan",
      surveyDate: "2026-06-22"
    }
  ]
};

// Handheld Paper Copies database simulator for Side-By-Side review panel
export const masterPaperCopies: Record<string, { legal_name: string; phone: string; address_note: string; matched: boolean }> = {
  "+91 94420 88221": {
    legal_name: "Vani Sweets & Milk Stall",
    phone: "+91 94420 88221",
    address_note: "Registered physical shop located at Door No 15, Sirkazhi Bazaar Street",
    matched: true
  },
  "+91 4364 270772": {
    legal_name: "Dr. Annai's Family Dental Clinic",
    phone: "+91 4364 270772",
    address_note: "Sirkazhi City Gandhi High Road, directly opposite Taluk Court complex",
    matched: true
  },
  "+91 98940 33445": {
    legal_name: "Murali Hardware and Electricals",
    phone: "+91 98940 33445",
    address_note: "Physical storefront on Market North Car Street right corner",
    matched: true
  },
  "+91 94431 82928": {
    legal_name: "Arun Kumar B.A, L.L.B (Home Office)",
    phone: "+91 94431 82928",
    address_note: "Home practice inside Sattainathar Temple Sannidhi Lane boundary, no visible signboard, verified private consultation",
    matched: true
  }
};
