// src/lib/transport-routing/utils.ts
export const statesWithCities: Record<string, string[]> = {
  AndhraPradesh: [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry',
    'Tirupati', 'Kadapa', 'Anantapur', 'Eluru'
  ],
  ArunachalPradesh: [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Roing', 'Bomdila', 'Ziro',
    'Tawang', 'Daporijo', 'Tezu', 'Aalo'
  ],
  Assam: [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Nagaon',
    'Tinsukia', 'Bongaigaon', 'Barpeta', 'Karimganj'
  ],
  Bihar: [
    'Patna', 'Katihar', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga',
    'Purnia', 'Arrah', 'Begusarai', 'Samastipur'
  ],
  Chhattisgarh: [
    'Raipur', 'Bilaspur', 'Durg', 'Korba', 'Rajnandgaon', 'Jagdalpur',
    'Ambikapur', 'Raigarh', 'Bhilai', 'Kanker'
  ],
  Goa: [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Calangute',
    'Candolim', 'Bicholim', 'Curchorem', 'Sanquelim'
  ],
  Gujarat: [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
    'Gandhinagar', 'Anand', 'Nadiad', 'Junagadh'
  ],
  Haryana: [
    'Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Karnal', 'Hisar',
    'Rohtak', 'Yamunanagar', 'Sonipat', 'Panchkula'
  ],
  HimachalPradesh: [
    'Shimla', 'Solan', 'Mandi', 'Dharamshala', 'Hamirpur', 'Bilaspur',
    'Kullu', 'Chamba', 'Una', 'Nahan'
  ],
  Jharkhand: [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar',
    'Giridih', 'Ramgarh', 'Chaibasa', 'Palamu'
  ],
  Karnataka: [
    'Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi',
    'Davangere', 'Ballari', 'Shivamogga', 'Tumakuru'
  ],
  Kerala: [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Alappuzha',
    'Kollam', 'Kannur', 'Palakkad', 'Kottayam', 'Pathanamthitta'
  ],
  MadhyaPradesh: [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar',
    'Satna', 'Rewa', 'Ratlam', 'Chhindwara'
  ],
  Maharashtra: [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad',
    'Solapur', 'Kolhapur', 'Amravati', 'Sangli'
  ],
  Manipur: [
    'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati',
    'Ukhrul', 'Kakching', 'Tamenglong', 'Jiribam', 'Moreh'
  ],
  Meghalaya: [
    'Shillong', 'Tura', 'Nongstoin', 'Baghmara', 'Jowai', 'Williamnagar',
    'Resubelpara', 'Mairang', 'Sohra', 'Khliehriat'
  ],
  Mizoram: [
    'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Saiha',
    'Lawngtlai', 'Mamit', 'Bairabi', 'Saitual'
  ],
  Nagaland: [
    'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto',
    'Phek', 'Mon', 'Longleng', 'Kiphire'
  ],
  Odisha: [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Berhampur',
    'Balasore', 'Puri', 'Jharsuguda', 'Angul', 'Baripada'
  ],
  Punjab: [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
    'Mohali', 'Hoshiarpur', 'Moga', 'Firozpur', 'Pathankot'
  ],
  Rajasthan: [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner',
    'Alwar', 'Bharatpur', 'Sikar', 'Pali'
  ],
  Sikkim: [
    'Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Jorethang',
    'Pelling', 'Singtam', 'Pakyong', 'Soreng'
  ],
  TamilNadu: [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Vellore', 'Erode', 'Tirunelveli', 'Thoothukudi', 'Dindigul'
  ],
  Telangana: [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Ramagundam', 'Mahbubnagar', 'Siddipet', 'Adilabad', 'Miryalaguda'
  ],
  Tripura: [
    'Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar', 'Belonia',
    'Ambassa', 'Kamalpur', 'Sonamura', 'Panisagar', 'Melaghar'
  ],
  UttarPradesh: [
    'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Ghaziabad',
    'Noida', 'Meerut', 'Bareilly', 'Gorakhpur'
  ],
  Uttarakhand: [
    'Dehradun', 'Haridwar', 'Roorkee', 'Nainital', 'Haldwani',
    'Rudrapur', 'Almora', 'Pithoragarh', 'Kotdwar', 'Mussoorie'
  ],
  WestBengal: [
    'Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Howrah', 'Malda',
    'Berhampore', 'Kharagpur', 'Haldia', 'Darjeeling'
  ],
  Delhi: [
    'New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi',
    'Dwarka', 'Rohini', 'Karol Bagh', 'Lajpat Nagar', 'Connaught Place'
  ]
}


export function getCitiesByState(state: string): string[] {
  return statesWithCities[state] || []
}

export function getAllCities(): string[] {
  const allCities = Object.values(statesWithCities).flat()
  return Array.from(new Set(allCities)).sort()
}
