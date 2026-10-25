export interface BankBranch {
  branchName: string;
  code: string; // Real registered IFSC (11 chars for India), ABA Routing (US), Sort Code (UK), etc.
  city: string;
  state: string;
  country?: string;
  address?: string;
  micrCode?: string;
  district?: string;
  contact?: string;
}

export interface BankInfo {
  id: string;
  name: string;
  shortName: string;
  logoColor: string;
  codePrefix?: string;
  category?: 'PUBLIC_SECTOR' | 'PRIVATE_SECTOR' | 'FOREIGN_BANK' | 'PAYMENTS_BANK';
  rbiRegistered?: boolean;
  upiHandleSuffix?: string;
  branches: BankBranch[];
}

export interface CountryBankingInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  codeLabel: string;
  codePlaceholder: string;
  codeFormatHelp: string;
  accountNumberHelp: string;
  codeRegex: RegExp;
  states: string[];
  banks: BankInfo[];
}

export const COUNTRY_BANK_CATALOG: CountryBankingInfo[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    codeLabel: 'IFSC Code',
    codePlaceholder: 'e.g. SBIN0000300, HDFC0000240, ICIC0000004',
    codeFormatHelp: '11 characters: 4 letters bank prefix + "0" + 6-character branch code',
    accountNumberHelp: '9 to 18 digits bank account number (printed on passbook/cheque)',
    codeRegex: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    states: [
      'Maharashtra',
      'Delhi (NCT)',
      'Karnataka',
      'Tamil Nadu',
      'Telangana',
      'Gujarat',
      'West Bengal',
      'Uttar Pradesh',
      'Rajasthan',
      'Kerala',
      'Punjab',
      'Haryana',
      'Madhya Pradesh',
      'Andhra Pradesh',
      'Bihar',
      'Odisha',
      'Goa',
      'Chandigarh (UT)'
    ],
    banks: [
      // 1. STATE BANK OF INDIA (SBI)
      {
        id: 'sbi',
        name: 'State Bank of India (SBI)',
        shortName: 'SBI',
        codePrefix: 'SBIN',
        category: 'PUBLIC_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@oksbi',
        logoColor: 'from-blue-600 to-sky-700',
        branches: [
          // Maharashtra
          { branchName: 'Mumbai Fort Main (Horniman Circle)', code: 'SBIN0000300', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Mumbai Samachar Marg, Horniman Circle, Fort, Mumbai - 400001', micrCode: '400002010' },
          { branchName: 'Mumbai Nariman Point', code: 'SBIN0006945', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Mittal Court, C Wing, Nariman Point, Mumbai - 400021', micrCode: '400002052' },
          { branchName: 'Mumbai Bandra Kurla Complex (BKC)', code: 'SBIN0004380', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', address: 'C-6, G Block, Bandra Kurla Complex, Bandra East, Mumbai - 400051', micrCode: '400002073' },
          { branchName: 'Mumbai Andheri West', code: 'SBIN0000539', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', address: 'SV Road, Andheri West, Mumbai - 400058', micrCode: '400002018' },
          { branchName: 'Pune Main Branch (Laxmi Road)', code: 'SBIN0000454', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Laxmi Road, Phadke Haud, Pune - 411030', micrCode: '411002002' },
          { branchName: 'Pune Hinjawadi Infotech Park', code: 'SBIN0010269', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Rajiv Gandhi Infotech Park, Hinjawadi Phase 1, Pune - 411057', micrCode: '411002047' },
          { branchName: 'Pune Shivaji Nagar', code: 'SBIN0001110', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Shivaji Nagar, Ganeshkhind Road, Pune - 411005', micrCode: '411002008' },
          { branchName: 'Nagpur Main (Kingsway)', code: 'SBIN0000432', city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', address: 'Station Road, Kingsway, Nagpur - 440001', micrCode: '440002002' },
          { branchName: 'Thane Gokhale Road', code: 'SBIN0000486', city: 'Thane', state: 'Maharashtra', district: 'Thane', address: 'Gokhale Road, Naupada, Thane West - 400602', micrCode: '400002012' },
          { branchName: 'Navi Mumbai Vashi Sector 17', code: 'SBIN0004114', city: 'Navi Mumbai', state: 'Maharashtra', district: 'Thane', address: 'Sector 17, Vashi, Navi Mumbai - 400703', micrCode: '400002071' },

          // Delhi (NCT)
          { branchName: 'New Delhi Main (Parliament Street)', code: 'SBIN0000691', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: '11 Parliament Street, New Delhi - 110001', micrCode: '110002001' },
          { branchName: 'Connaught Circus (L-Block)', code: 'SBIN0000619', city: 'New Delhi', state: 'Delhi (NCT)', district: 'Central Delhi', address: 'L-Block, Connaught Circus, New Delhi - 110001', micrCode: '110002005' },
          { branchName: 'South Delhi South Extension II', code: 'SBIN0003219', city: 'New Delhi', state: 'Delhi (NCT)', district: 'South Delhi', address: 'D-28, South Extension Part II, New Delhi - 110049', micrCode: '110002029' },
          { branchName: 'Dwarka Sector 6', code: 'SBIN0005353', city: 'New Delhi', state: 'Delhi (NCT)', district: 'South West Delhi', address: 'Sector 6, Dwarka, New Delhi - 110075', micrCode: '110002361' },
          { branchName: 'Chandni Chowk Old Delhi', code: 'SBIN0000620', city: 'New Delhi', state: 'Delhi (NCT)', district: 'North Delhi', address: 'Fatehpuri, Chandni Chowk, Delhi - 110006', micrCode: '110002006' },

          // Karnataka
          { branchName: 'Bengaluru Main (St. Marks Road)', code: 'SBIN0000813', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'State Bank Road, St. Marks Road, Bengaluru - 560001', micrCode: '560002002' },
          { branchName: 'Bengaluru Koramangala 7th Block', code: 'SBIN0009077', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: '80 Feet Road, 7th Block Koramangala, Bengaluru - 560095', micrCode: '560002076' },
          { branchName: 'Bengaluru Whitefield ITPL', code: 'SBIN0007295', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'ITPL Main Road, Whitefield, Bengaluru - 560066', micrCode: '560002061' },
          { branchName: 'Bengaluru Indiranagar 100 Ft Rd', code: 'SBIN0003301', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038', micrCode: '560002028' },
          { branchName: 'Bengaluru Electronic City', code: 'SBIN0009998', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Keonics Complex, Electronic City, Bengaluru - 560100', micrCode: '560002082' },
          { branchName: 'Mysuru Main (Albert Victor Road)', code: 'SBIN0000878', city: 'Mysuru', state: 'Karnataka', district: 'Mysuru', address: 'Albert Victor Road, Mysuru - 570001', micrCode: '570002002' },
          { branchName: 'Mangaluru Main (Port Road)', code: 'SBIN0000871', city: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada', address: 'Port Road, Bunder, Mangaluru - 575001', micrCode: '575002002' },

          // Tamil Nadu
          { branchName: 'Chennai Main (Rajaji Salai)', code: 'SBIN0000800', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: '84 Rajaji Salai, George Town, Chennai - 600001', micrCode: '600002002' },
          { branchName: 'Chennai Mount Road (Anna Salai)', code: 'SBIN0000956', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: '737 Anna Salai, Chennai - 600002', micrCode: '600002004' },
          { branchName: 'Chennai Anna Nagar West', code: 'SBIN0003042', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: '2nd Avenue, Anna Nagar, Chennai - 600040', micrCode: '600002027' },
          { branchName: 'Chennai OMR Tidel Park', code: 'SBIN0010672', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: 'Tidel Park, Rajiv Gandhi Salai (OMR), Taramani, Chennai - 600113', micrCode: '600002133' },
          { branchName: 'Coimbatore Main (Bank Road)', code: 'SBIN0000827', city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', address: 'Bank Road, Gopalapuram, Coimbatore - 641018', micrCode: '641002002' },

          // Telangana
          { branchName: 'Hyderabad Main (Koti Bank Street)', code: 'SBIN0000847', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Bank Street, Koti, Hyderabad - 500095', micrCode: '500002002' },
          { branchName: 'Hyderabad Hitec City (Cyber Towers)', code: 'SBIN0011566', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Cyber Towers, Hitec City, Madhapur, Hyderabad - 500081', micrCode: '500002118' },
          { branchName: 'Hyderabad Banjara Hills', code: 'SBIN0003607', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Road No 1, Banjara Hills, Hyderabad - 500034', micrCode: '500002032' },
          { branchName: 'Secunderabad Main (MG Road)', code: 'SBIN0000916', city: 'Secunderabad', state: 'Telangana', district: 'Hyderabad', address: 'MG Road, Secunderabad - 500003', micrCode: '500002004' },

          // Gujarat
          { branchName: 'Ahmedabad Main (Bhadra)', code: 'SBIN0000301', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', address: 'Bhadra, Near Lal Darwaja, Ahmedabad - 380001', micrCode: '380002002' },
          { branchName: 'Ahmedabad SG Highway Bodakdev', code: 'SBIN0011749', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', address: 'SG Highway, Bodakdev, Ahmedabad - 380054', micrCode: '380002123' },
          { branchName: 'Vadodara Main (Mandvi)', code: 'SBIN0000324', city: 'Vadodara', state: 'Gujarat', district: 'Vadodara', address: 'Mandvi, Vadodara - 390006', micrCode: '390002002' },
          { branchName: 'Surat Main (Chowk Bazar)', code: 'SBIN0000488', city: 'Surat', state: 'Gujarat', district: 'Surat', address: 'Chowk Bazar, Surat - 395003', micrCode: '395002002' },

          // West Bengal
          { branchName: 'Kolkata Main (Strand Road)', code: 'SBIN0000001', city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', address: '1 Strand Road, Samriddhi Bhavan, Kolkata - 700001', micrCode: '700002001' },
          { branchName: 'Kolkata Salt Lake Sector 1', code: 'SBIN0001612', city: 'Kolkata', state: 'West Bengal', district: 'North 24 Parganas', address: 'BD-33, Sector 1, Salt Lake, Kolkata - 700064', micrCode: '700002032' },
          { branchName: 'Kolkata Park Street', code: 'SBIN0000221', city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', address: '34 Park Street, Kolkata - 700016', micrCode: '700002014' },

          // Uttar Pradesh
          { branchName: 'Lucknow Main (Moti Mahal Marg)', code: 'SBIN0000125', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', address: 'Tarawali Kothi, Moti Mahal Marg, Hazratganj, Lucknow - 226001', micrCode: '226002002' },
          { branchName: 'Lucknow Gomti Nagar', code: 'SBIN0009916', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', address: 'Vibhuti Khand, Gomti Nagar, Lucknow - 226010', micrCode: '226002048' },
          { branchName: 'Noida Sector 61', code: 'SBIN0005222', city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', address: 'Sector 61, Noida - 201301', micrCode: '110002344' },
          { branchName: 'Kanpur Main (The Mall)', code: 'SBIN0000109', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', address: 'The Mall, Kanpur - 208001', micrCode: '208002002' },

          // Rajasthan
          { branchName: 'Jaipur Main (Sanganeri Gate)', code: 'SBIN0000656', city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', address: 'Sanganeri Gate, M.I. Road, Jaipur - 302003', micrCode: '302002002' },
          { branchName: 'Jaipur C-Scheme (Ashok Marg)', code: 'SBIN0004129', city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', address: 'Ashok Marg, C-Scheme, Jaipur - 302001', micrCode: '302002034' },

          // Kerala
          { branchName: 'Kochi Marine Drive', code: 'SBIN0003284', city: 'Kochi', state: 'Kerala', district: 'Ernakulam', address: 'Shanmugham Road, Marine Drive, Kochi - 682031', micrCode: '682002002' },
          { branchName: 'Thiruvananthapuram Main (Statue)', code: 'SBIN0000941', city: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram', address: 'Statue Junction, MG Road, Thiruvananthapuram - 695001', micrCode: '695002002' },

          // Punjab & Chandigarh
          { branchName: 'Chandigarh Main (Sector 17-B)', code: 'SBIN0000628', city: 'Chandigarh', state: 'Chandigarh (UT)', district: 'Chandigarh', address: 'Bank Square, Sector 17-B, Chandigarh - 160017', micrCode: '160002002' },
          { branchName: 'Ludhiana Civil Lines', code: 'SBIN0000674', city: 'Ludhiana', state: 'Punjab', district: 'Ludhiana', address: 'Fountain Chowk, Civil Lines, Ludhiana - 141001', micrCode: '141002002' },

          // Haryana
          { branchName: 'Gurugram Cyber City (DLF Phase 2)', code: 'SBIN0010651', city: 'Gurugram', state: 'Haryana', district: 'Gurugram', address: 'Building 9A, DLF Cyber City, Gurugram - 122002', micrCode: '110002492' },
          { branchName: 'Gurugram Main (Sector 14)', code: 'SBIN0000645', city: 'Gurugram', state: 'Haryana', district: 'Gurugram', address: 'Sector 14, Old Judicial Complex, Gurugram - 122001', micrCode: '110002024' },

          // Madhya Pradesh, Bihar, Andhra Pradesh, Goa
          { branchName: 'Indore Main (High Court Road)', code: 'SBIN0000388', city: 'Indore', state: 'Madhya Pradesh', district: 'Indore', address: 'Near High Court, MG Road, Indore - 452001', micrCode: '452002002' },
          { branchName: 'Bhopal Main (TT Nagar)', code: 'SBIN0001056', city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', address: 'Bhadbhada Road, TT Nagar, Bhopal - 462003', micrCode: '462002002' },
          { branchName: 'Patna Main (Gandhi Maidan)', code: 'SBIN0000152', city: 'Patna', state: 'Bihar', district: 'Patna', address: 'West of Gandhi Maidan, Patna - 800001', micrCode: '800002002' },
          { branchName: 'Visakhapatnam Main (Port Area)', code: 'SBIN0000952', city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', address: 'Old Post Office, Harbour Approach Rd, Visakhapatnam - 530001', micrCode: '530002002' },
          { branchName: 'Panaji Main (Bandodkar Marg)', code: 'SBIN0000565', city: 'Panaji', state: 'Goa', district: 'North Goa', address: 'DB Bandodkar Marg, Panaji - 403001', micrCode: '403002002' }
        ]
      },

      // 2. HDFC BANK
      {
        id: 'hdfc',
        name: 'HDFC Bank',
        shortName: 'HDFC',
        codePrefix: 'HDFC',
        category: 'PRIVATE_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@okhdfcbank',
        logoColor: 'from-blue-800 to-indigo-900',
        branches: [
          // Maharashtra
          { branchName: 'Mumbai Fort (Sandoz House)', code: 'HDFC0000240', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Dr. Annie Besant Road, Fort / Worli, Mumbai - 400018', micrCode: '400240002' },
          { branchName: 'Mumbai Nariman Point (Raheja Centre)', code: 'HDFC0000128', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Raheja Centre, Free Press Journal Marg, Nariman Point, Mumbai - 400021', micrCode: '400240015' },
          { branchName: 'Mumbai BKC (Trade World)', code: 'HDFC0000542', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', address: 'Trade World, C-Wing, Senapati Bapat Marg / BKC, Mumbai - 400051', micrCode: '400240032' },
          { branchName: 'Mumbai Andheri Lokhandwala', code: 'HDFC0000159', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', address: 'Lokhandwala Complex, Andheri West, Mumbai - 400053', micrCode: '400240021' },
          { branchName: 'Pune FC Road (Shivajinagar)', code: 'HDFC0000007', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Fergusson College Road, Shivajinagar, Pune - 411004', micrCode: '411240002' },
          { branchName: 'Pune Viman Nagar (Clover Park)', code: 'HDFC0000826', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Clover Park, Viman Nagar, Pune - 411014', micrCode: '411240018' },
          { branchName: 'Pune Hinjawadi Phase 1', code: 'HDFC0000424', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Infotech Park Phase 1, Hinjawadi, Pune - 411057', micrCode: '411240012' },
          { branchName: 'Nagpur Ramdaspeth', code: 'HDFC0000059', city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', address: 'Central Bazar Road, Ramdaspeth, Nagpur - 440010', micrCode: '440240002' },
          { branchName: 'Thane Naupada', code: 'HDFC0000019', city: 'Thane', state: 'Maharashtra', district: 'Thane', address: 'Naupada, Gokhale Road, Thane West - 400602', micrCode: '400240005' },

          // Delhi (NCT)
          { branchName: 'New Delhi Connaught Place (KG Marg)', code: 'HDFC0000003', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: 'Kasturba Gandhi Marg, Connaught Place, New Delhi - 110001', micrCode: '110240001' },
          { branchName: 'New Delhi South Extension II', code: 'HDFC0000027', city: 'New Delhi', state: 'Delhi (NCT)', district: 'South Delhi', address: 'Part II, South Extension, New Delhi - 110049', micrCode: '110240004' },
          { branchName: 'New Delhi Greater Kailash I', code: 'HDFC0000092', city: 'New Delhi', state: 'Delhi (NCT)', district: 'South Delhi', address: 'M-Block, Greater Kailash 1, New Delhi - 110048', micrCode: '110240009' },
          { branchName: 'Dwarka Sector 11', code: 'HDFC0000249', city: 'New Delhi', state: 'Delhi (NCT)', district: 'South West Delhi', address: 'Plot 3, Sector 11, Dwarka, New Delhi - 110075', micrCode: '110240025' },

          // Karnataka
          { branchName: 'Bengaluru Koramangala 4th Block', code: 'HDFC0000053', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: '100 Feet Road, 4th Block Koramangala, Bengaluru - 560034', micrCode: '560240003' },
          { branchName: 'Bengaluru Indiranagar (CMH Road)', code: 'HDFC0000184', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'CMH Road, Indiranagar, Bengaluru - 560038', micrCode: '560240008' },
          { branchName: 'Bengaluru Whitefield (Prestige Tech Park)', code: 'HDFC0000286', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Prestige Tech Park, Marathahalli-Sarjapur Outer Ring Rd, Bengaluru - 560103', micrCode: '560240014' },
          { branchName: 'Bengaluru Electronic City Phase 1', code: 'HDFC0000360', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Velankani Tech Park, Electronic City Phase 1, Bengaluru - 560100', micrCode: '560240019' },
          { branchName: 'Bengaluru Richmond Road', code: 'HDFC0000523', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Richmond Road, Bengaluru - 560025', micrCode: '560240026' },
          { branchName: 'Mysuru Jayalakshmipuram', code: 'HDFC0000065', city: 'Mysuru', state: 'Karnataka', district: 'Mysuru', address: 'Kalidasa Road, Jayalakshmipuram, Mysuru - 570012', micrCode: '570240002' },

          // Tamil Nadu
          { branchName: 'Chennai Anna Nagar (2nd Avenue)', code: 'HDFC0000017', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: '2nd Avenue, Anna Nagar West, Chennai - 600040', micrCode: '600240003' },
          { branchName: 'Chennai T Nagar (G.N. Chetty Road)', code: 'HDFC0000024', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: 'G.N. Chetty Road, T. Nagar, Chennai - 600017', micrCode: '600240005' },
          { branchName: 'Chennai Nungambakkam High Road', code: 'HDFC0000082', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: 'Nungambakkam High Road, Chennai - 600034', micrCode: '600240008' },
          { branchName: 'Coimbatore RS Puram (DB Road)', code: 'HDFC0000031', city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', address: 'DB Road, RS Puram, Coimbatore - 641002', micrCode: '641240002' },

          // Telangana
          { branchName: 'Hyderabad Banjara Hills (Road No 1)', code: 'HDFC0000045', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Road No 1, Banjara Hills, Hyderabad - 500034', micrCode: '500240002' },
          { branchName: 'Hyderabad Gachibowli Financial District', code: 'HDFC0001997', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Financial District, Nanakramguda, Gachibowli, Hyderabad - 500032', micrCode: '500240039' },
          { branchName: 'Hyderabad Jubilee Hills', code: 'HDFC0000042', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Road No 36, Jubilee Hills, Hyderabad - 500033', micrCode: '500240006' },
          { branchName: 'Secunderabad SD Road', code: 'HDFC0000044', city: 'Secunderabad', state: 'Telangana', district: 'Hyderabad', address: 'Sarojini Devi Road, Secunderabad - 500003', micrCode: '500240003' },

          // Gujarat
          { branchName: 'Ahmedabad Navrangpura (Mithakhali)', code: 'HDFC0000006', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', address: 'Astran, Mithakhali Six Roads, Navrangpura, Ahmedabad - 380009', micrCode: '380240002' },
          { branchName: 'Ahmedabad SG Highway (Bodakdev)', code: 'HDFC0000049', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', address: 'SG Highway, Bodakdev, Ahmedabad - 380054', micrCode: '380240005' },
          { branchName: 'Vadodara Alkapuri', code: 'HDFC0000036', city: 'Vadodara', state: 'Gujarat', district: 'Vadodara', address: 'Race Course Circle, Alkapuri, Vadodara - 390007', micrCode: '390240002' },

          // West Bengal
          { branchName: 'Kolkata Stephen House (BBD Bagh)', code: 'HDFC0000008', city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', address: '4 BBD Bagh, Stephen House, Kolkata - 700001', micrCode: '700240002' },
          { branchName: 'Kolkata Salt Lake Sector 5', code: 'HDFC0000145', city: 'Kolkata', state: 'West Bengal', district: 'North 24 Parganas', address: 'Salt Lake Electronics Complex, Sector 5, Kolkata - 700091', micrCode: '700240009' },

          // Uttar Pradesh & Haryana
          { branchName: 'Noida Sector 18', code: 'HDFC0000088', city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', address: 'K-1, Sector 18, Noida - 201301', micrCode: '110240012' },
          { branchName: 'Noida Sector 62 (Electronic City)', code: 'HDFC0000536', city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', address: 'Sector 62, Noida - 201309', micrCode: '110240045' },
          { branchName: 'Gurugram Cyber City (Building 10)', code: 'HDFC0000572', city: 'Gurugram', state: 'Haryana', district: 'Gurugram', address: 'Building 10, DLF Cyber City, Gurugram - 122002', micrCode: '110240052' },
          { branchName: 'Gurugram DLF Phase 1 (Arjun Marg)', code: 'HDFC0000043', city: 'Gurugram', state: 'Haryana', district: 'Gurugram', address: 'Shopping Mall, Arjun Marg, DLF Phase 1, Gurugram - 122002', micrCode: '110240008' }
        ]
      },

      // 3. ICICI BANK
      {
        id: 'icici',
        name: 'ICICI Bank',
        shortName: 'ICICI',
        codePrefix: 'ICIC',
        category: 'PRIVATE_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@okicici',
        logoColor: 'from-amber-600 to-orange-700',
        branches: [
          // Maharashtra
          { branchName: 'Mumbai BKC (Headquarters)', code: 'ICIC0000004', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', address: 'ICICI Bank Towers, Bandra Kurla Complex, Mumbai - 400051', micrCode: '400229002' },
          { branchName: 'Mumbai Nariman Point (Free Press House)', code: 'ICIC0000003', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: '215 Free Press House, Nariman Point, Mumbai - 400021', micrCode: '400229003' },
          { branchName: 'Mumbai Fort Branch', code: 'ICIC0000018', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Homji Street, Fort, Mumbai - 400001', micrCode: '400229008' },
          { branchName: 'Pune Shivajinagar (Ganeshkhind)', code: 'ICIC0000005', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Modi Baug, Ganeshkhind Road, Shivajinagar, Pune - 411016', micrCode: '411229002' },
          { branchName: 'Pune Hinjawadi Phase 2', code: 'ICIC0000427', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Blue Ridge Township, Hinjawadi Phase 2, Pune - 411057', micrCode: '411229019' },

          // Delhi (NCT)
          { branchName: 'New Delhi Connaught Place (Phelps Bldg)', code: 'ICIC0000007', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: '9A Phelps Building, Connaught Place, New Delhi - 110001', micrCode: '110229002' },
          { branchName: 'New Delhi Greater Kailash I', code: 'ICIC0000049', city: 'New Delhi', state: 'Delhi (NCT)', district: 'South Delhi', address: 'M-11, Greater Kailash 1, New Delhi - 110048', micrCode: '110229011' },

          // Karnataka
          { branchName: 'Bengaluru Commissionarate Road (MG Road)', code: 'ICIC0000002', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Commissionarate Road, MG Road, Bengaluru - 560025', micrCode: '560229002' },
          { branchName: 'Bengaluru Whitefield (EPIP Area)', code: 'ICIC0000047', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'EPIP Area, Whitefield, Bengaluru - 560066', micrCode: '560229012' },
          { branchName: 'Bengaluru Koramangala 80 Ft Rd', code: 'ICIC0000053', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: '80 Feet Road, 4th Block Koramangala, Bengaluru - 560034', micrCode: '560229015' },

          // Telangana & Tamil Nadu
          { branchName: 'Hyderabad Gachibowli Financial Hub', code: 'ICIC0000008', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'ICICI Financial Hub, Gachibowli, Hyderabad - 500032', micrCode: '500229002' },
          { branchName: 'Hyderabad Banjara Hills', code: 'ICIC0000074', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Road No 12, Banjara Hills, Hyderabad - 500034', micrCode: '500229018' },
          { branchName: 'Chennai Nungambakkam High Road', code: 'ICIC0000001', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: '110 Nungambakkam High Road, Chennai - 600034', micrCode: '600229002' },

          // Gujarat & West Bengal
          { branchName: 'Ahmedabad Ashram Road (Jishnu Complex)', code: 'ICIC0000006', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', address: 'Jishnu Complex, Ashram Road, Ahmedabad - 380009', micrCode: '380229002' },
          { branchName: 'Kolkata RN Mukherjee Road', code: 'ICIC0000006', city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', address: '22 RN Mukherjee Road, Kolkata - 700001', micrCode: '700229002' }
        ]
      },

      // 4. AXIS BANK
      {
        id: 'axis',
        name: 'Axis Bank',
        shortName: 'Axis',
        codePrefix: 'UTIB',
        category: 'PRIVATE_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@okaxis',
        logoColor: 'from-rose-700 to-red-800',
        branches: [
          { branchName: 'Mumbai Nariman Point', code: 'UTIB0000004', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Sir P.M. Road / Nariman Point, Mumbai - 400021', micrCode: '400211002' },
          { branchName: 'Mumbai Fort Branch', code: 'UTIB0000008', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Horniman Circle, Fort, Mumbai - 400001', micrCode: '400211004' },
          { branchName: 'Pune FC Road', code: 'UTIB0000037', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Fergusson College Road, Shivajinagar, Pune - 411004', micrCode: '411211002' },
          { branchName: 'New Delhi Statesman House', code: 'UTIB0000007', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: 'Statesman House, 148 Barakhamba Road, New Delhi - 110001', micrCode: '110211002' },
          { branchName: 'Bengaluru MG Road Main', code: 'UTIB0000009', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: '9 MG Road, Bengaluru - 560001', micrCode: '560211002' },
          { branchName: 'Bengaluru Indiranagar 100 Ft Rd', code: 'UTIB0000068', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038', micrCode: '560211008' },
          { branchName: 'Hyderabad Jubilee Hills', code: 'UTIB0000030', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Road No 36, Jubilee Hills, Hyderabad - 500033', micrCode: '500211003' },
          { branchName: 'Chennai Mylapore (Luz Church Rd)', code: 'UTIB0000006', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', address: 'Luz Church Road, Mylapore, Chennai - 600004', micrCode: '600211002' }
        ]
      },

      // 5. KOTAK MAHINDRA BANK
      {
        id: 'kotak',
        name: 'Kotak Mahindra Bank',
        shortName: 'Kotak',
        codePrefix: 'KKBK',
        category: 'PRIVATE_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@kotak',
        logoColor: 'from-red-600 to-rose-700',
        branches: [
          { branchName: 'Mumbai BKC (27 BKC)', code: 'KKBK0000958', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', address: '27 BKC, C 27, G Block, Bandra Kurla Complex, Mumbai - 400051', micrCode: '400485002' },
          { branchName: 'Mumbai Nariman Point', code: 'KKBK0000631', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Maker Chambers VI, Nariman Point, Mumbai - 400021', micrCode: '400485004' },
          { branchName: 'New Delhi KG Marg (Ambadeep)', code: 'KKBK0000172', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: 'Ambadeep Building, 14 KG Marg, New Delhi - 110001', micrCode: '110485002' },
          { branchName: 'Bengaluru Lavelle Road', code: 'KKBK0000422', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: '22 MG Road / Lavelle Road, Bengaluru - 560001', micrCode: '560485002' },
          { branchName: 'Hyderabad Somajiguda', code: 'KKBK0000551', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Rajbhavan Road, Somajiguda, Hyderabad - 500082', micrCode: '500485002' },
          { branchName: 'Pune Camp MG Road', code: 'KKBK0000062', city: 'Pune', state: 'Maharashtra', district: 'Pune', address: 'Camp MG Road, Pune - 411001', micrCode: '411485002' }
        ]
      },

      // 6. PUNJAB NATIONAL BANK (PNB)
      {
        id: 'pnb',
        name: 'Punjab National Bank (PNB)',
        shortName: 'PNB',
        codePrefix: 'PUNB',
        category: 'PUBLIC_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@pnb',
        logoColor: 'from-yellow-700 to-amber-800',
        branches: [
          { branchName: 'New Delhi Sansad Marg (HQ)', code: 'PUNB0000100', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: '7 Bhikaji Cama Place / Sansad Marg, New Delhi - 110001', micrCode: '110024001' },
          { branchName: 'Mumbai Fort Branch', code: 'PUNB0000200', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'PNB House, Sir P.M. Road, Fort, Mumbai - 400001', micrCode: '400024002' },
          { branchName: 'Chandigarh Sector 17-B', code: 'PUNB0001700', city: 'Chandigarh', state: 'Chandigarh (UT)', district: 'Chandigarh', address: 'Bank Square, Sector 17-B, Chandigarh - 160017', micrCode: '160024002' },
          { branchName: 'Bengaluru City Branch (KG Road)', code: 'PUNB0000800', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'KG Road, Gandhinagar, Bengaluru - 560009', micrCode: '560024002' }
        ]
      },

      // 7. BANK OF BARODA (BOB)
      {
        id: 'bob',
        name: 'Bank of Baroda',
        shortName: 'BOB',
        codePrefix: 'BARB',
        category: 'PUBLIC_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@barodampay',
        logoColor: 'from-orange-600 to-amber-700',
        branches: [
          { branchName: 'Vadodara Mandvi (Head Office)', code: 'BARB0MANDVI', city: 'Vadodara', state: 'Gujarat', district: 'Vadodara', address: 'Mandvi, Vadodara, Gujarat - 390006', micrCode: '390012002' },
          { branchName: 'Mumbai Ballard Estate', code: 'BARB0BALLAR', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: '10/12 Mumbai Samachar Marg, Ballard Estate, Mumbai - 400001', micrCode: '400012002' },
          { branchName: 'New Delhi Parliament Street', code: 'BARB0PARLIA', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: '16 Parliament Street, New Delhi - 110001', micrCode: '110012002' },
          { branchName: 'Bengaluru Cantonment', code: 'BARB0CANTON', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Infantry Road, Cantonment, Bengaluru - 560001', micrCode: '560012002' }
        ]
      },

      // 8. CANARA BANK
      {
        id: 'canara',
        name: 'Canara Bank',
        shortName: 'Canara',
        codePrefix: 'CNRB',
        category: 'PUBLIC_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@cnrb',
        logoColor: 'from-sky-600 to-blue-700',
        branches: [
          { branchName: 'Bengaluru JC Road (Head Office)', code: 'CNRB0000001', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: '112 JC Road, Bengaluru - 560002', micrCode: '560015001' },
          { branchName: 'Mumbai Fort Branch', code: 'CNRB0000101', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Calcot House, Tamarind Lane, Fort, Mumbai - 400023', micrCode: '400015002' },
          { branchName: 'New Delhi Chandni Chowk', code: 'CNRB0000301', city: 'New Delhi', state: 'Delhi (NCT)', district: 'North Delhi', address: 'Chandni Chowk, Delhi - 110006', micrCode: '110015002' },
          { branchName: 'Mangaluru Founders Branch', code: 'CNRB0000002', city: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada', address: 'Hampankatta, Mangaluru - 575001', micrCode: '575015002' }
        ]
      },

      // 9. UNION BANK OF INDIA
      {
        id: 'union',
        name: 'Union Bank of India',
        shortName: 'Union Bank',
        codePrefix: 'UBIN',
        category: 'PUBLIC_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@unionbank',
        logoColor: 'from-red-700 to-blue-800',
        branches: [
          { branchName: 'Mumbai Nariman Point (Bhavan)', code: 'UBIN0530018', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: '239 Vidhan Bhavan Marg, Nariman Point, Mumbai - 400021', micrCode: '400026002' },
          { branchName: 'New Delhi CP Extension', code: 'UBIN0530786', city: 'New Delhi', state: 'Delhi (NCT)', district: 'Central Delhi', address: 'Connaught Place Extension, New Delhi - 110001', micrCode: '110026002' },
          { branchName: 'Hyderabad Sultan Bazar', code: 'UBIN0530000', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Koti Sultan Bazar, Hyderabad - 500095', micrCode: '500026002' }
        ]
      },

      // 10. INDUSIND BANK
      {
        id: 'indusind',
        name: 'IndusInd Bank',
        shortName: 'IndusInd',
        codePrefix: 'INDB',
        category: 'PRIVATE_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@indus',
        logoColor: 'from-red-800 to-rose-900',
        branches: [
          { branchName: 'Mumbai Opera House', code: 'INDB0000001', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: '70 Opera House, Mumbai - 400004', micrCode: '400234002' },
          { branchName: 'New Delhi Barakhamba Road', code: 'INDB0000005', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: 'Barakhamba Road, Connaught Place, New Delhi - 110001', micrCode: '110234002' },
          { branchName: 'Bengaluru MG Road', code: 'INDB0000008', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'MG Road, Bengaluru - 560001', micrCode: '560234002' }
        ]
      },

      // 11. FEDERAL BANK
      {
        id: 'federal',
        name: 'Federal Bank',
        shortName: 'Federal',
        codePrefix: 'FDRL',
        category: 'PRIVATE_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@federal',
        logoColor: 'from-blue-700 to-amber-600',
        branches: [
          { branchName: 'Kochi Marine Drive (Federal Towers)', code: 'FDRL0001285', city: 'Kochi', state: 'Kerala', district: 'Ernakulam', address: 'Federal Towers, Marine Drive, Kochi - 682031', micrCode: '682049002' },
          { branchName: 'Mumbai Fort Branch', code: 'FDRL0001150', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', address: 'Sir P.M. Road, Fort, Mumbai - 400001', micrCode: '400049002' },
          { branchName: 'Bengaluru Richmond Road', code: 'FDRL0001099', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Richmond Road, Bengaluru - 560025', micrCode: '560049002' }
        ]
      },

      // 12. IDFC FIRST BANK
      {
        id: 'idfcfirst',
        name: 'IDFC FIRST Bank',
        shortName: 'IDFC FIRST',
        codePrefix: 'IDFB',
        category: 'PRIVATE_SECTOR',
        rbiRegistered: true,
        upiHandleSuffix: '@idfcbank',
        logoColor: 'from-red-900 to-amber-800',
        branches: [
          { branchName: 'Mumbai BKC (Naman Chambers)', code: 'IDFB0040101', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', address: 'Naman Chambers, C-32 G Block, BKC, Mumbai - 400051', micrCode: '400755002' },
          { branchName: 'New Delhi Barakhamba Road', code: 'IDFB0020101', city: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', address: 'Barakhamba Road, Connaught Place, New Delhi - 110001', micrCode: '110755002' },
          { branchName: 'Bengaluru MG Road', code: 'IDFB0040105', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Residency Road / MG Road, Bengaluru - 560025', micrCode: '560755002' }
        ]
      }
    ]
  },

  // UNITED STATES
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    codeLabel: 'ABA Routing Transit Number',
    codePlaceholder: 'e.g. 021000021 or 121000358',
    codeFormatHelp: '9-digit numerical routing transit number',
    accountNumberHelp: '8 to 17 digits US checking/savings account number',
    codeRegex: /^\d{9}$/,
    states: ['New York', 'California', 'Texas', 'Illinois', 'North Carolina'],
    banks: [
      {
        id: 'chase',
        name: 'JPMorgan Chase Bank',
        shortName: 'Chase',
        logoColor: 'from-blue-700 to-indigo-800',
        branches: [
          { branchName: 'New York City (Midtown / HQ)', code: '021000021', city: 'New York City', state: 'New York', address: '383 Madison Avenue, New York, NY 10017' },
          { branchName: 'San Francisco Financial District', code: '121000358', city: 'San Francisco', state: 'California', address: '560 Mission Street, San Francisco, CA 94105' },
          { branchName: 'Chicago Downtown Main', code: '071000013', city: 'Chicago', state: 'Illinois', address: '10 S Dearborn Street, Chicago, IL 60603' },
          { branchName: 'Dallas Main Street', code: '111000614', city: 'Dallas', state: 'Texas', address: '1717 Main Street, Dallas, TX 75201' }
        ]
      },
      {
        id: 'bofa',
        name: 'Bank of America',
        shortName: 'BofA',
        logoColor: 'from-red-600 to-blue-800',
        branches: [
          { branchName: 'Charlotte Main (Headquarters)', code: '053000196', city: 'Charlotte', state: 'North Carolina', address: '100 N Tryon Street, Charlotte, NC 28255' },
          { branchName: 'New York Wall Street', code: '026009593', city: 'New York City', state: 'New York', address: '222 Broadway, New York, NY 10038' },
          { branchName: 'Los Angeles Century City', code: '122000661', city: 'Los Angeles', state: 'California', address: '2049 Century Park East, Los Angeles, CA 90067' }
        ]
      }
    ]
  },

  // UNITED KINGDOM
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    codeLabel: 'Sort Code',
    codePlaceholder: 'e.g. 40-05-15 or 20-00-00',
    codeFormatHelp: '6 digits in XX-XX-XX format',
    accountNumberHelp: '8-digit UK current account number',
    codeRegex: /^\d{2}-?\d{2}-?\d{2}$/,
    states: ['England', 'Scotland'],
    banks: [
      {
        id: 'hsbc_uk',
        name: 'HSBC UK Bank',
        shortName: 'HSBC UK',
        logoColor: 'from-red-600 to-slate-900',
        branches: [
          { branchName: 'London Queen Victoria Street', code: '40-05-15', city: 'London', state: 'England', address: '60 Queen Victoria St, London EC4N 4TR' },
          { branchName: 'Edinburgh George Street', code: '40-19-15', city: 'Edinburgh', state: 'Scotland', address: '76 George St, Edinburgh EH2 3BU' }
        ]
      },
      {
        id: 'barclays',
        name: 'Barclays Bank',
        shortName: 'Barclays',
        logoColor: 'from-sky-600 to-blue-800',
        branches: [
          { branchName: 'London Churchill Place (Canary Wharf)', code: '20-00-00', city: 'London', state: 'England', address: '1 Churchill Place, London E14 5HP' }
        ]
      }
    ]
  },

  // UAE
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    codeLabel: 'IBAN / Swift Code',
    codePlaceholder: 'e.g. EBILAEADXXX',
    codeFormatHelp: 'UAE IBAN (23 chars: AE + 2 digits + 19 alphanumeric) or SWIFT',
    accountNumberHelp: 'Up to 16 digits account number or full UAE IBAN',
    codeRegex: /^(AE\d{2}[A-Z0-9]{19}|[A-Z]{8,11})$/,
    states: ['Dubai', 'Abu Dhabi'],
    banks: [
      {
        id: 'emirates_nbd',
        name: 'Emirates NBD',
        shortName: 'Emirates NBD',
        logoColor: 'from-blue-900 to-amber-600',
        branches: [
          { branchName: 'Dubai Deira Headquarters', code: 'EBILAEADXXX', city: 'Dubai', state: 'Dubai', address: 'Baniyas Road, Deira, Dubai' },
          { branchName: 'Abu Dhabi Corniche Branch', code: 'EBILAEADAUH', city: 'Abu Dhabi', state: 'Abu Dhabi', address: 'Corniche Street, Abu Dhabi' }
        ]
      }
    ]
  },

  // SINGAPORE
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    codeLabel: 'Bank & Branch Code',
    codePlaceholder: 'e.g. 7171-001 or DBSSSGSG',
    codeFormatHelp: '4-digit bank code + 3-digit branch code, or SWIFT',
    accountNumberHelp: '9 to 12 digits Singapore account number',
    codeRegex: /^[A-Z0-9-]{7,11}$/,
    states: ['Central Region'],
    banks: [
      {
        id: 'dbs',
        name: 'DBS Bank / POSB',
        shortName: 'DBS',
        logoColor: 'from-red-600 to-slate-900',
        branches: [
          { branchName: 'Marina Bay Financial Centre HQ', code: '7171-001', city: 'Singapore', state: 'Central Region', address: '12 Marina Boulevard, Marina Bay Financial Centre Tower 3, Singapore 018982' },
          { branchName: 'Raffles Place Main Branch', code: '7171-002', city: 'Singapore', state: 'Central Region', address: '22 Malacca St, #01-00 RB Capital Building, Singapore 048980' }
        ]
      }
    ]
  }
];

// Helper Functions

export function getCountryBanking(countryCode = 'IN'): CountryBankingInfo {
  return COUNTRY_BANK_CATALOG.find(c => c.code === countryCode) || COUNTRY_BANK_CATALOG[0];
}

export function getStatesForCountry(countryCode = 'IN'): string[] {
  const country = getCountryBanking(countryCode);
  if (country.states && country.states.length > 0) {
    return country.states;
  }
  // Derive dynamically from branches if not explicitly set
  const stateSet = new Set<string>();
  country.banks.forEach(b => {
    b.branches.forEach(br => {
      if (br.state) stateSet.add(br.state);
    });
  });
  return Array.from(stateSet).sort();
}

export function getCitiesForState(countryCode = 'IN', stateName?: string): string[] {
  const country = getCountryBanking(countryCode);
  const citySet = new Set<string>();
  country.banks.forEach(b => {
    b.branches.forEach(br => {
      if (!stateName || br.state.toLowerCase() === stateName.toLowerCase()) {
        citySet.add(br.city);
      }
    });
  });
  return Array.from(citySet).sort();
}

export function getBanksForLocation(countryCode = 'IN', stateName?: string, cityName?: string): BankInfo[] {
  const country = getCountryBanking(countryCode);
  if (!stateName && !cityName) return country.banks;

  return country.banks.filter(b => {
    return b.branches.some(br => {
      const matchState = !stateName || br.state.toLowerCase() === stateName.toLowerCase();
      const matchCity = !cityName || br.city.toLowerCase() === cityName.toLowerCase();
      return matchState && matchCity;
    });
  });
}

export function getBranchesForLocation(countryCode = 'IN', stateName?: string, cityName?: string, bankId?: string): BankBranch[] {
  const country = getCountryBanking(countryCode);
  const results: BankBranch[] = [];

  const targetBanks = bankId ? country.banks.filter(b => b.id === bankId) : country.banks;
  targetBanks.forEach(b => {
    b.branches.forEach(br => {
      const matchState = !stateName || br.state.toLowerCase() === stateName.toLowerCase();
      const matchCity = !cityName || br.city.toLowerCase() === cityName.toLowerCase();
      if (matchState && matchCity) {
        results.push(br);
      }
    });
  });

  return results;
}

export function searchBanks(query: string, countryCode = 'IN'): BankInfo[] {
  const country = getCountryBanking(countryCode);
  const q = query.trim().toLowerCase();
  if (!q) return country.banks;
  return country.banks.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.shortName.toLowerCase().includes(q) ||
    (b.codePrefix && b.codePrefix.toLowerCase().includes(q))
  );
}

export function searchBranches(query: string, countryCode = 'IN'): Array<{ bank: BankInfo; branch: BankBranch }> {
  const country = getCountryBanking(countryCode);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: Array<{ bank: BankInfo; branch: BankBranch }> = [];
  country.banks.forEach(b => {
    b.branches.forEach(br => {
      if (
        br.code.toLowerCase().includes(q) ||
        br.branchName.toLowerCase().includes(q) ||
        br.city.toLowerCase().includes(q) ||
        br.state.toLowerCase().includes(q) ||
        (br.address && br.address.toLowerCase().includes(q)) ||
        (br.district && br.district.toLowerCase().includes(q)) ||
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q)
      ) {
        results.push({ bank: b, branch: br });
      }
    });
  });

  return results;
}

export function detectBankFromIfsc(code: string, countryCode = 'IN'): { bank?: BankInfo; branch?: BankBranch } | null {
  const clean = code.trim().toUpperCase();
  if (!clean) return null;
  const country = getCountryBanking(countryCode);

  for (const bank of country.banks) {
    if (bank.codePrefix && clean.startsWith(bank.codePrefix)) {
      const matchBranch = bank.branches.find(b => b.code.toUpperCase() === clean);
      return { bank, branch: matchBranch };
    }
    const matchBranch = bank.branches.find(b => b.code.toUpperCase() === clean);
    if (matchBranch) {
      return { bank, branch: matchBranch };
    }
  }
  return null;
}

export function lookupIfsc(code: string): { bank: BankInfo; branch: BankBranch; country: CountryBankingInfo } | null {
  const clean = code.trim().toUpperCase();
  if (!clean) return null;

  for (const country of COUNTRY_BANK_CATALOG) {
    for (const bank of country.banks) {
      const match = bank.branches.find(b => b.code.toUpperCase() === clean);
      if (match) {
        return { bank, branch: match, country };
      }
    }
  }
  return null;
}
