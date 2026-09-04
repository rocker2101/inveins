export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: 'Tees' | 'Shirts' | 'Joggers' | 'Gym Compression' | 'Outerwear' | 'Custom B2B';
  badge?: 'NEW' | 'LIMITED' | 'SOLD OUT' | 'BESTSELLER' | 'HOT';
  tagline: string;
  description: string;
  availableStock: number;
  images: string[];
  sizes: string[];
  details: string[];
  materialCare: string[];
  shippingInfo: string;
  returnsInfo: string;
  fit?: 'Oversized' | 'Architectural' | 'Relaxed Straight' | 'Structured' | 'Slim Fit' | 'Compression Fit';
  occasion?: 'Everyday Uniform' | 'Studio & Work' | 'Weekend & Lounge' | 'Gym & Active';
  completeLookWith?: string;
  wholesalePrice?: string;
}

export const PRODUCTS: Product[] = [
  // ==================== 1. HEAVYWEIGHT & ACID WASH TEES ====================
  {
    id: 'imported-oversized-acid-wash-french-terry-tshirt',
    name: 'IMPORTED Oversized Acid Wash French Terry T-Shirt',
    price: 250,
    currency: '₹',
    category: 'Tees',
    badge: 'HOT',
    tagline: '280 GSM heavy French Terry with artisan acid wash treatment and dropped shoulders.',
    description: 'Direct from INVEINS Kanpur studio: Heavyweight imported French Terry cotton crafted for an architectural, boxy drape. Individually acid-washed for a vintage industrial character with double-needle collar reinforcement.',
    availableStock: 35,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      'Fabric: 100% Combed French Terry Cotton',
      'Fabric Weight: 280 GSM heavyweight jersey',
      'Treatment: Hand artisan acid-wash with zero surface cling',
      'Fit: Oversized architectural drop-shoulder silhouette'
    ],
    materialCare: [
      '100% French Terry Cotton',
      'Machine wash inside out in cold water',
      'Dry in shade to preserve acid stonewash tone'
    ],
    shippingInfo: 'Dispatched from Kanpur Studio within 24 hours. Complimentary express air delivery on orders above ₹999.',
    returnsInfo: '7-day hassle-free doorstep size exchange.',
    fit: 'Oversized',
    occasion: 'Everyday Uniform',
    completeLookWith: 'imported-french-terry-straight-fit-baggy-lowers',
    wholesalePrice: '₹250 / piece (MOQ: 20 pcs)'
  },
  {
    id: 'men-french-terry-printed-t-shirt',
    name: 'Men French Terry Printed T-Shirt',
    price: 249,
    currency: '₹',
    category: 'Tees',
    badge: 'NEW',
    tagline: 'High-density screen print on 260 GSM breathable French Terry loopknit.',
    description: 'Engineered with custom loopknit French Terry that breathes effortlessly in Indian weather while retaining boxy structure. Minimalist chest typography and twin-needle reinforced hems.',
    availableStock: 28,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590892653/YZ/QL/EJ/180956315/oversized-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590995562/FC/PL/TA/180956315/men-cotton-printed-t-shirt-500x500.jpg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      'Fabric: Pure Cotton French Terry',
      'GSM: 260 GSM custom loopknit weave',
      'Print: High-density non-crack plastisol typographic print',
      'Collar: Ribbed lay-flat crew collar'
    ],
    materialCare: ['100% Cotton', 'Do not iron over print', 'Machine wash cold'],
    shippingInfo: 'Fast Pan-India delivery from Kanpur.',
    returnsInfo: '7-day doorstep size exchange.',
    fit: 'Architectural',
    occasion: 'Everyday Uniform',
    completeLookWith: 'organic-antibacterial-bamboo-pant'
  },
  {
    id: 'oversized-streetwear-t-shirt',
    name: 'INVEINS Signature Oversized T-Shirt',
    price: 199,
    currency: '₹',
    category: 'Tees',
    badge: 'BESTSELLER',
    tagline: '240 GSM bio-washed combed cotton with relaxed urban drape.',
    description: 'The definitive daily rotation staple. Custom-dyed in muted architectural neutrals with dropped shoulder seams and wide sleeves that drape naturally.',
    availableStock: 45,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    details: [
      '240 GSM organic bio-washed combed cotton',
      'Pre-shrunk architectural boxy cut',
      'Reinforced shoulder seam taping'
    ],
    materialCare: ['100% Organic Cotton', 'Machine wash cold', 'Hang dry'],
    shippingInfo: 'Ships within 24 hours from Kanpur.',
    returnsInfo: '7-day easy exchange.',
    fit: 'Oversized',
    occasion: 'Everyday Uniform',
    completeLookWith: 'imported-french-terry-straight-fit-baggy-lowers'
  },
  {
    id: 'men-cotton-printed-t-shirt',
    name: 'Men Graphic Cotton Printed T-Shirt',
    price: 240,
    currency: '₹',
    category: 'Tees',
    tagline: 'Modern brutalist typography on 220 GSM super-combed cotton.',
    description: 'Graphic expression meeting wearable minimalism. Silkscreen typographic layout on breathable super-combed cotton built for studio, commute, and leisure.',
    availableStock: 22,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590995562/FC/PL/TA/180956315/men-cotton-printed-t-shirt-500x500.jpg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590924186/XH/ZE/ND/180956315/half-sleeves-t-shirt-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      '220 GSM super-combed cotton',
      'High-grade eco-friendly pigment ink',
      'Regular-relaxed silhouette'
    ],
    materialCare: ['Machine wash cold inside out', 'Do not bleach'],
    shippingInfo: 'Pan-India air express shipping.',
    returnsInfo: '7-day returns.',
    fit: 'Architectural',
    occasion: 'Weekend & Lounge'
  },
  {
    id: 'half-sleeves-crew-t-shirt',
    name: 'Everyday Half Sleeves Crew T-Shirt',
    price: 249,
    currency: '₹',
    category: 'Tees',
    tagline: 'Pure combed cotton 200 GSM everyday base layer.',
    description: 'Clean minimalist lines, soft hand feel, and zero shrinkage. Designed to be worn on its own or layered under overshirts and jackets.',
    availableStock: 50,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590924186/XH/ZE/ND/180956315/half-sleeves-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599815926/TI/QI/MM/180956315/cotton-men-t-shirt-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: ['200 GSM pure cotton', 'Bio-wash finish', 'Anti-pilling weave'],
    materialCare: ['Machine wash warm', 'Tumble dry low'],
    shippingInfo: 'Ships within 24 hours.',
    returnsInfo: '7-day returns.',
    fit: 'Structured',
    occasion: 'Everyday Uniform'
  },
  {
    id: 'men-plain-essential-t-shirt',
    name: 'Men Plain Heavy Cotton T-Shirt',
    price: 199,
    currency: '₹',
    category: 'Tees',
    tagline: 'Single jersey pure combed cotton staple tee.',
    description: 'Understated elegance with pure cotton construction. The foundation piece of your weekly wardrobe rotation.',
    availableStock: 40,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590892639/KU/UZ/NN/180956315/oversized-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: ['190-210 GSM combed cotton', 'Comfort rib collar', 'Standard fit'],
    materialCare: ['Machine wash cold'],
    shippingInfo: 'Express delivery.',
    returnsInfo: '7-day easy exchange.',
    fit: 'Structured',
    occasion: 'Everyday Uniform'
  },
  {
    id: 'men-custom-dtf-t-shirt',
    name: 'Men Custom DTF Graphic T-Shirt',
    price: 249,
    currency: '₹',
    category: 'Tees',
    badge: 'NEW',
    tagline: 'High-definition Direct-to-Film print on 220 GSM bio-washed jersey.',
    description: 'Produced on our in-house industrial DTF printing lines in Kanpur. Features vibrant multi-color graphic artwork with sharp detailing and maximum wash endurance.',
    availableStock: 30,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590913001/UL/GD/WC/180956315/men-custom-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/600075312/FP/XU/CU/180956315/men-sublimation-t-shirt-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: ['Ultra-dense DTF color print', '220 GSM combed cotton', 'Pre-shrunk'],
    materialCare: ['Wash inside out in cold water', 'Iron on reverse side'],
    shippingInfo: 'Ships within 24 hours.',
    returnsInfo: '7-day returns.',
    fit: 'Architectural',
    occasion: 'Everyday Uniform'
  },
  {
    id: 'men-sublimation-t-shirt',
    name: 'Men Sublimation Performance T-Shirt',
    price: 199,
    currency: '₹',
    category: 'Tees',
    tagline: 'Vibrant all-over dye sublimation on breathable moisture-wicking micro-poly.',
    description: 'High-output training and casual wear tee utilizing molecular sublimation dye transfer for color that never fades, cracks, or peals.',
    availableStock: 25,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/600075312/FP/XU/CU/180956315/men-sublimation-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590913001/UL/GD/WC/180956315/men-custom-t-shirt-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: ['180 GSM micro-poly weave', 'Dry-fit sweat evaporation', 'Seamless printing'],
    materialCare: ['Quick dry', 'Machine wash cold'],
    shippingInfo: 'Pan-India shipping.',
    returnsInfo: '7-day returns.',
    fit: 'Slim Fit',
    occasion: 'Gym & Active'
  },
  {
    id: 'ladies-printed-t-shirt',
    name: 'Women Relaxed Printed T-Shirt',
    price: 150,
    currency: '₹',
    category: 'Tees',
    badge: 'NEW',
    tagline: 'Dropped shoulder women cut in ultra-soft 200 GSM ring-spun cotton.',
    description: 'Tailored specifically with a relaxed women silhouette, wider neckline, and breathable ring-spun cotton for effortless everyday styling.',
    availableStock: 20,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599688992/DK/LH/TQ/180956315/ladies-printed-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599695179/XD/KD/ID/180956315/women-t-shirt-500x500.jpeg'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    details: ['200 GSM ring-spun soft cotton', 'Relaxed boyfriend cut', 'Pre-washed'],
    materialCare: ['Machine wash cold', 'Tumble dry low'],
    shippingInfo: 'Fast delivery across India.',
    returnsInfo: '7-day exchange.',
    fit: 'Oversized',
    occasion: 'Weekend & Lounge',
    completeLookWith: 'organic-antibacterial-bamboo-pant'
  },
  {
    id: 'women-minimal-t-shirt',
    name: 'Women Minimal Combed Cotton T-Shirt',
    price: 159,
    currency: '₹',
    category: 'Tees',
    tagline: 'Clean silhouette in 100% breathable organic cotton.',
    description: 'Designed as a foundational essential. Clean stitching, tailored shoulders, and premium hand-feel.',
    availableStock: 25,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599695179/XD/KD/ID/180956315/women-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599688992/DK/LH/TQ/180956315/ladies-printed-t-shirt-500x500.jpeg'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    details: ['100% Combed Cotton', 'Pre-shrunk', 'Soft enzyme wash'],
    materialCare: ['Machine wash cold'],
    shippingInfo: 'Ships within 24 hours.',
    returnsInfo: '7-day returns.',
    fit: 'Structured',
    occasion: 'Everyday Uniform'
  },

  // ==================== 2. GYM COMPRESSION & ACTIVEWEAR ====================
  {
    id: 'black-spandex-blend-gym-compression-t-shirt',
    name: 'Black Spandex Blend Gym Compression T-Shirt',
    price: 299,
    currency: '₹',
    category: 'Gym Compression',
    badge: 'HOT',
    tagline: 'Form-locking 4-way stretch Spandex recovery blend with ergonomic flatlock seams.',
    description: 'The flagship INVEINS compression piece from our IndiaMART performance line. Engineered with 88% Polyester and 12% Spandex to lock muscle groups into place, reduce vibration fatigue, and accelerate thermal evaporation during intense sessions.',
    availableStock: 50,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2025/12/571500385/RH/RN/IE/180956315/premium-gym-compression-tshirt-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/597809055/YN/BI/ZA/180956315/black-spandex-blend-gym-compression-t-shirt-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599821602/XA/OW/NH/180956315/compression-t-shirt-black-500x500.png'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      'Material: 88% High-Tenacity Poly / 12% Spandex',
      'Compression Rating: Form-locking 4-way stretch',
      'Seams: 4-needle flatlock anti-chafing construction',
      'Moisture Management: Rapid sweat wicking micro-channels'
    ],
    materialCare: [
      '88% Polyester, 12% Spandex',
      'Machine wash cold with similar colors',
      'Do not bleach, do not iron over elastane'
    ],
    shippingInfo: 'Dispatched from Kanpur Studio within 24 hours. Free express shipping on orders over ₹999.',
    returnsInfo: '7-day easy size exchange.',
    fit: 'Compression Fit',
    occasion: 'Gym & Active',
    completeLookWith: 'black-spandex-blend-gym-tighty',
    wholesalePrice: '₹299 / piece (MOQ: 25 pcs)'
  },
  {
    id: 'black-poly-cotton-gym-compression-t-shirt',
    name: 'Black Poly Cotton Gym Compression T-Shirt',
    price: 299,
    currency: '₹',
    category: 'Gym Compression',
    badge: 'BESTSELLER',
    tagline: 'Hybrid poly-cotton knit combining cotton natural hand-feel with elastomeric compression.',
    description: 'Engineered for athletes who prefer the skin-touch of natural cotton combined with compression recovery. Breathable, durable, and highly odor-resistant.',
    availableStock: 35,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2025/10/554969589/VS/XL/CT/180956315/ct-500x500.webp',
      'https://5.imimg.com/data5/SELLER/Default/2025/10/554969987/GT/HY/NH/180956315/ct-500x500.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      'Poly-Cotton compression hybrid blend',
      'Flat-locked anti-friction seams',
      'High breathability during high heart-rate sets'
    ],
    materialCare: ['Machine wash cold', 'Air dry in shade'],
    shippingInfo: 'Fast delivery across India.',
    returnsInfo: '7-day returns.',
    fit: 'Compression Fit',
    occasion: 'Gym & Active',
    completeLookWith: 'black-spandex-blend-gym-tighty'
  },
  {
    id: 'black-spandex-blend-gym-tighty',
    name: 'Black Spandex Blend Gym Tighty / Tights',
    price: 309,
    currency: '₹',
    category: 'Gym Compression',
    badge: 'HOT',
    tagline: 'High-stretch active compression tights with reinforced gusset and wide waistband.',
    description: 'Full-support compression tights designed for running, weightlifting, and mobility drills. Reinforced double-stitched crotch gusset ensures full squat depth with zero restriction.',
    availableStock: 40,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/2/583276108/CI/AA/WY/180956315/gym-tighty-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2025/12/571500385/RH/RN/IE/180956315/premium-gym-compression-tshirt-500x500.png'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      '88% Poly / 12% Spandex resilient knit',
      'Ergonomic athletic compression fit',
      'Non-roll 2-inch jacquard elastic waistband',
      'Ergonomic paneling for quad & hamstring support'
    ],
    materialCare: ['Machine wash cold', 'Hang dry'],
    shippingInfo: 'Ships within 24 hours from Kanpur.',
    returnsInfo: '7-day easy exchange.',
    fit: 'Compression Fit',
    occasion: 'Gym & Active',
    completeLookWith: 'black-spandex-blend-gym-compression-t-shirt'
  },
  {
    id: 'red-spandex-blend-gym-compression-t-shirt',
    name: 'Red Spandex Blend Gym Compression T-Shirt',
    price: 299,
    currency: '₹',
    category: 'Gym Compression',
    badge: 'NEW',
    tagline: 'Vibrant crimson athletic compression with high muscular feedback.',
    description: 'High-visibility performance compression top cut from custom dyed crimson Spandex-Poly knit. Retains muscle warmth between lifting sets.',
    availableStock: 25,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/1/572829381/PR/ZA/TG/180956315/red-colour-gym-compression-tshirt-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/600078431/TJ/DA/EN/180956315/red-poly-cotton-gym-compression-t-shirt-500x500.png'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      'High-recovery red elastane blend',
      'Flatlock anti-abrasion stitching',
      'Quick-drying sweat dissipation'
    ],
    materialCare: ['Machine wash cold inside out'],
    shippingInfo: 'Express Pan-India shipping.',
    returnsInfo: '7-day exchange.',
    fit: 'Compression Fit',
    occasion: 'Gym & Active'
  },
  {
    id: 'red-poly-cotton-gym-compression-t-shirt',
    name: 'Red Poly Cotton Athletic Compression T-Shirt',
    price: 299,
    currency: '₹',
    category: 'Gym Compression',
    tagline: 'Durable hybrid crimson compression with soft cotton exterior feel.',
    description: 'Built for intense outdoor conditioning and studio workouts. Combines moisture management with skin-friendly cotton texture.',
    availableStock: 20,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/600078431/TJ/DA/EN/180956315/red-poly-cotton-gym-compression-t-shirt-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/1/572829381/PR/ZA/TG/180956315/red-colour-gym-compression-tshirt-500x500.png'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: ['Poly-Cotton performance blend', 'Double-needle seam structure', 'Athletic cut'],
    materialCare: ['Machine wash cold'],
    shippingInfo: 'Express delivery from Kanpur.',
    returnsInfo: '7-day returns.',
    fit: 'Compression Fit',
    occasion: 'Gym & Active'
  },
  {
    id: 'mens-tactical-compression-t-shirt',
    name: 'Mens Tactical Compression T-Shirt',
    price: 299,
    currency: '₹',
    category: 'Gym Compression',
    badge: 'HOT',
    tagline: 'Stealth black core compression base layer with reinforced chest taping.',
    description: 'Designed as the definitive active uniform. Ergonomic shoulder yoke allows unhindered overhead mobility for pull-ups, presses, and sprints.',
    availableStock: 35,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2025/10/554969987/GT/HY/NH/180956315/ct-500x500.webp',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599817322/GM/MN/JT/180956315/gym-compression-t-shirts-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: ['High elastane support', 'Sweat evaporation grid', 'Flat seams'],
    materialCare: ['Cold gentle cycle'],
    shippingInfo: 'Dispatched within 24 hours.',
    returnsInfo: '7-day easy exchange.',
    fit: 'Compression Fit',
    occasion: 'Gym & Active'
  },

  // ==================== 3. BOTTOMS, JOGGERS & LOWERS ====================
  {
    id: 'imported-french-terry-straight-fit-baggy-lowers',
    name: 'Imported FRENCH TERRY Straight Fit Baggy Lowers',
    price: 349,
    currency: '₹',
    category: 'Joggers',
    badge: 'HOT',
    tagline: '320 GSM heavy French Terry cotton, straight-leg street drape with deep utility pockets.',
    description: 'Direct from INVEINS Kanpur catalogue: Crafted from imported 320 GSM French Terry loopknit. Features an elasticated waistband, deep hand pockets, and a clean straight-leg profile that sits cleanly over sneakers without bunching.',
    availableStock: 45,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/598353258/QJ/JQ/UG/180956315/untitled-design-2026-04-09t132323-463-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/598353245/EP/LM/HF/180956315/untitled-design-2026-04-09t132624-163-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/598353249/IR/QW/TO/180956315/untitled-design-2026-04-09t132538-410-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/598353252/LD/RH/UE/180956315/untitled-design-2026-04-09t132457-646-500x500.png'
    ],
    sizes: ['28', '30', '32', '34', '36'],
    details: [
      'Fabric: 100% Imported French Terry Cotton',
      'Weight: 320 GSM heavyweight loopknit',
      'Pockets: 2 Deep slant pockets + back stash pocket',
      'Waist: Premium elasticated comfort waistband with tonal drawcord',
      'Fit: Straight-leg baggy streetwear cut'
    ],
    materialCare: [
      '100% Cotton French Terry',
      'Machine wash cold inside out',
      'Hang dry in shade'
    ],
    shippingInfo: 'Dispatched from Kanpur Studio within 24 hours. Complimentary shipping above ₹999.',
    returnsInfo: '7-day hassle-free doorstep size exchange.',
    fit: 'Relaxed Straight',
    occasion: 'Everyday Uniform',
    completeLookWith: 'imported-oversized-acid-wash-french-terry-tshirt',
    wholesalePrice: '₹349 / piece (MOQ: 10 pcs)'
  },
  {
    id: 'organic-antibacterial-bamboo-pant',
    name: 'ORGANIC Antibacterial Bamboo Comfort Pant',
    price: 320,
    currency: '₹',
    category: 'Joggers',
    badge: 'BESTSELLER',
    tagline: 'Eco-luxury organic bamboo fiber with natural thermal regulation and antimicrobial properties.',
    description: 'Crafted from sustainable organic bamboo viscose blended with combed cotton. Naturally antibacterial, ultra-soft to the touch, and tailored for studio, work, and elevated lounge settings.',
    availableStock: 30,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/597798749/ER/ZL/ZC/180956315/men-cotton-linen-pant-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/591136265/VG/HI/AO/180956315/women-cotton-linen-pant-500x500.jpg'
    ],
    sizes: ['28', '30', '32', '34', '36'],
    details: [
      '70% Organic Bamboo Viscose / 30% Combed Cotton',
      'Natural odor suppression and antibacterial properties',
      'Tailored straight-leg silhouette with internal drawcord',
      'Deep reinforced pockets'
    ],
    materialCare: ['Hand wash or delicate machine wash cold', 'Dry flat in shade'],
    shippingInfo: 'Express air delivery across India.',
    returnsInfo: '7-day doorstep exchange.',
    fit: 'Relaxed Straight',
    occasion: 'Studio & Work',
    completeLookWith: 'imported-premium-polo-tshirt'
  },
  {
    id: 'women-cotton-linen-pant',
    name: 'Women Organic Cotton Linen Trousers',
    price: 319,
    currency: '₹',
    category: 'Joggers',
    badge: 'NEW',
    tagline: 'Breathable linen-cotton blend with elasticated high-waist and clean straight leg.',
    description: 'Designed for effortless warm-weather elegance. Cut from high-density organic linen-cotton that softens with every wash without losing structural silhouette.',
    availableStock: 25,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/591136265/VG/HI/AO/180956315/women-cotton-linen-pant-500x500.jpg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/597798749/ER/ZL/ZC/180956315/men-cotton-linen-pant-500x500.jpeg'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    details: ['Organic Linen & Combed Cotton', 'High-waist elasticated comfort band', 'Straight taper'],
    materialCare: ['Gentle cycle cold', 'Hang dry'],
    shippingInfo: 'Pan-India shipping from Kanpur.',
    returnsInfo: '7-day returns.',
    fit: 'Relaxed Straight',
    occasion: 'Weekend & Lounge'
  },

  // ==================== 4. POLOS & SHIRTS ====================
  {
    id: 'imported-premium-polo-tshirt',
    name: 'Imported Premium Piqué Polo T-Shirt',
    price: 249,
    currency: '₹',
    category: 'Shirts',
    badge: 'HOT',
    tagline: '240 GSM imported double-knit piqué with structured ribbed collar and horn buttons.',
    description: 'Elevated smart-casual classic. High-density imported piqué knit with anti-curl structured collar and tailored 2-button placket.',
    availableStock: 35,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2025/12/568584706/HF/TZ/IE/180956315/polo-men-t-shirt-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590918756/UV/EU/ME/180956315/premium-polo-t-shirts-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      '240 GSM double-knit combed piqué cotton',
      'Reinforced collar band that will not curl',
      'Side vent detailing for mobility'
    ],
    materialCare: ['Machine wash cold inside out', 'Do not tumble dry'],
    shippingInfo: 'Fast delivery from Kanpur.',
    returnsInfo: '7-day exchange.',
    fit: 'Structured',
    occasion: 'Studio & Work',
    completeLookWith: 'organic-antibacterial-bamboo-pant'
  },
  {
    id: 'men-polyester-collar-polo-t-shirt',
    name: 'Men Technical Polyester Collar Polo T-Shirt',
    price: 289,
    currency: '₹',
    category: 'Shirts',
    tagline: 'Breathable quick-drying athletic collar polo with UV defense.',
    description: 'Engineered for golf, sports club, and hot-weather studio shifts. Moisture-wicking technical fabric maintains crisp collar aesthetics throughout the day.',
    availableStock: 30,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590918022/XC/BN/SZ/180956315/men-collar-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2025/12/568584706/HF/TZ/IE/180956315/polo-men-t-shirt-500x500.png'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: ['100% Breathable Tech Poly', 'Anti-odor micro finish', 'Structured placket'],
    materialCare: ['Machine wash cold', 'Quick dry'],
    shippingInfo: 'Ships within 24 hours.',
    returnsInfo: '7-day returns.',
    fit: 'Structured',
    occasion: 'Studio & Work'
  },
  {
    id: 'luxury-imported-polo-tshirt',
    name: 'Luxury Imported Heavy Piqué Polo',
    price: 350,
    currency: '₹',
    category: 'Shirts',
    badge: 'LIMITED',
    tagline: '260 GSM heavyweight textured weave with matte tonal collar.',
    description: 'Our most premium collar shirt. Heavy organic cotton with subtle textured weave, reinforced cuffs, and refined chest drape.',
    availableStock: 20,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590918756/UV/EU/ME/180956315/premium-polo-t-shirts-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2025/12/568584706/HF/TZ/IE/180956315/polo-men-t-shirt-500x500.png'
    ],
    sizes: ['M', 'L', 'XL'],
    details: ['260 GSM textured piqué', 'Horn button hardware', 'Clean drop sleeves'],
    materialCare: ['Cold delicate cycle'],
    shippingInfo: 'Express delivery from Kanpur.',
    returnsInfo: '7-day easy exchange.',
    fit: 'Structured',
    occasion: 'Studio & Work',
    completeLookWith: 'organic-antibacterial-bamboo-pant'
  },

  // ==================== 5. HOODIES & SWEATSHIRTS ====================
  {
    id: 'cotton-men-drop-shoulder-pullover-hoodie',
    name: 'Cotton Men Drop-Shoulder Pullover Hoodie',
    price: 499,
    currency: '₹',
    category: 'Outerwear',
    badge: 'HOT',
    tagline: '430 GSM ultra-heavy cotton brushed loopknit weight with double-lined hood.',
    description: 'The heavyweight centerpiece of the INVEINS collection. Crafted from 430 GSM brushed loopknit cotton with an architectural double-lined hood that holds its shape, dropped shoulder drape, and kangaroo pocket.',
    availableStock: 30,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2025/11/558588332/BC/ML/IF/180956315/inveins-offgrid-tees-drop-shoulder-pullover-hoodie-for-men-430-gsm-cotton-brushed-loopknit-weight-72-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599800133/BP/QN/VP/180956315/man-hoodies-500x500.png'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      '430 GSM ultra-heavyweight brushed loopknit cotton',
      'Double-ply structured hood (no drawcord clutter)',
      'Heavy 2x2 ribbing on cuffs and hem',
      'Kangaroo hand pocket with bartack reinforcement'
    ],
    materialCare: ['100% Heavy Brushed Cotton', 'Machine wash cold inside out', 'Hang dry'],
    shippingInfo: 'Complimentary Pan-India shipping.',
    returnsInfo: '7-day exchange.',
    fit: 'Oversized',
    occasion: 'Weekend & Lounge',
    completeLookWith: 'imported-french-terry-straight-fit-baggy-lowers'
  },
  {
    id: 'men-fleece-pullover-hoodie',
    name: 'Men Architectural Fleece Pullover Hoodie',
    price: 299,
    currency: '₹',
    category: 'Outerwear',
    badge: 'NEW',
    tagline: '380 GSM fleece interior with structured boxy street silhouette.',
    description: 'Designed for effortless cold-weather rotation. Ultra-dense cotton fleece provides insulation with an intentional urban silhouette.',
    availableStock: 25,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/599800133/BP/QN/VP/180956315/man-hoodies-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2025/11/558588332/BC/ML/IF/180956315/inveins-offgrid-tees-drop-shoulder-pullover-hoodie-for-men-430-gsm-cotton-brushed-loopknit-weight-72-500x500.png'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: ['380 GSM fleece-backed cotton', 'Deep lined hood', 'Pre-shrunk'],
    materialCare: ['Machine wash cold'],
    shippingInfo: 'Ships within 24 hours.',
    returnsInfo: '7-day returns.',
    fit: 'Oversized',
    occasion: 'Everyday Uniform'
  },
  {
    id: 'women-black-cotton-blend-sweatshirt',
    name: 'Women Black Cotton Blend Sweatshirt',
    price: 299,
    currency: '₹',
    category: 'Outerwear',
    badge: 'BESTSELLER',
    tagline: '320 GSM brushed cotton blend with relaxed drop-shoulder silhouette.',
    description: 'Minimalist luxury pullover sweatshirt. Clean crew collar, dropped shoulder seams, and dense fleece backing that feels soft against bare skin.',
    availableStock: 30,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2025/12/567869877/UJ/FX/YD/180956315/luxury-sweatshirt-500x500.png',
      'https://5.imimg.com/data5/SELLER/Default/2026/1/576415124/MH/DJ/PL/180956315/maroon-sweatshirt-500x500.jpeg'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    details: ['320 GSM Cotton-Poly loopknit', 'Pre-washed anti-shrinkage', 'Ribbed collar and cuffs'],
    materialCare: ['Machine wash cold', 'Dry flat'],
    shippingInfo: 'Fast shipping across India.',
    returnsInfo: '7-day returns.',
    fit: 'Oversized',
    occasion: 'Weekend & Lounge',
    completeLookWith: 'organic-antibacterial-bamboo-pant'
  },
  {
    id: 'men-pink-cotton-blend-sweatshirt',
    name: 'Men Dusty Pink Cotton Blend Sweatshirt',
    price: 229,
    currency: '₹',
    category: 'Outerwear',
    badge: 'NEW',
    tagline: 'Pigment-washed dusty pink 320 GSM architectural crewneck.',
    description: 'Understated earthen pink shade achieved with pigment dye washing. Warm, structural, and versatile for layering over tees.',
    availableStock: 20,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/1/576415124/MH/DJ/PL/180956315/maroon-sweatshirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2025/12/567869877/UJ/FX/YD/180956315/luxury-sweatshirt-500x500.png'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: ['320 GSM cotton blend', 'Pigment dye wash', 'Twin-needle seams'],
    materialCare: ['Wash inside out cold'],
    shippingInfo: 'Express delivery.',
    returnsInfo: '7-day exchange.',
    fit: 'Architectural',
    occasion: 'Weekend & Lounge'
  },

  // ==================== 6. B2B & CUSTOM APPAREL SERVICES ====================
  {
    id: 'imported-jersey-customization-service',
    name: 'Imported Jersey Customization Service',
    price: 249,
    currency: '₹',
    category: 'Custom B2B',
    badge: 'HOT',
    tagline: 'Custom team & athletic match jerseys in breathable Polyester Spandex.',
    description: 'Custom sports match jersey manufacturing directly from Kanpur factory. Complete custom numbers, sponsor badges, player names, and sublimated crests with athletic cut.',
    availableStock: 100,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/4/598343279/DS/SE/FU/180956315/imported-jersey-customization-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/598345344/SC/OK/MS/180956315/imported-jersey-customization-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/4/598345903/PX/UO/JW/180956315/imported-jersey-customization-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      'Sport: Football / Cricket / Athletic Match Jersey',
      'Fabric: Premium Polyester Spandex with anti-sweat mesh',
      'Customization: Numbers, Names, Club Logos, Sponsor Graphics',
      'MOQ: 10 Pieces for custom bulk batch'
    ],
    materialCare: ['Machine wash cold', 'Quick dry'],
    shippingInfo: 'Direct factory dispatch from Kanpur. Fast turnaround.',
    returnsInfo: 'Quality replacement guarantee on manufacturing defects.',
    fit: 'Slim Fit',
    occasion: 'Gym & Active',
    wholesalePrice: '₹249 / piece (MOQ: 10 pcs)'
  },
  {
    id: 'mens-t-shirt-dtf-printing-service',
    name: 'Mens T-Shirt DTF Printing Service (Custom Apparel)',
    price: 249,
    currency: '₹',
    category: 'Custom B2B',
    badge: 'HOT',
    tagline: 'High-definition industrial Direct-to-Film print service on INVEINS heavyweight blanks.',
    description: 'Equip your brand, gym, event, or corporate merchandise with factory-grade DTF printing from our Kanpur manufacturing facility. Unlimited color spectrum, sharp photographic detail, and supreme wash fastness.',
    availableStock: 500,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590885404/MA/PR/OG/180956315/t-shirt-printing-services-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590934041/EV/YM/MP/180956315/embroidery-500x500.jpeg'
    ],
    sizes: ['Free Size / Custom'],
    details: [
      'Service: Industrial Direct-to-Film (DTF) transfer printing',
      'Supported Fabrics: 100% Cotton, French Terry, Polyesters, Fleece',
      'Print Resolution: 1440 DPI photographic definition with white underbase',
      'Fastness: 50+ wash cycles without cracking or peeling'
    ],
    materialCare: ['Do not iron over print'],
    shippingInfo: 'Bulk logistics dispatched across India with GST invoice.',
    returnsInfo: 'Production sample verification before full run.',
    fit: 'Structured',
    occasion: 'Studio & Work',
    wholesalePrice: 'Contact for custom bulk quotation'
  },
  {
    id: 'men-t-shirt-machine-embroidery-service',
    name: 'Men T-Shirt Machine Embroidery Service',
    price: 25,
    currency: '₹',
    category: 'Custom B2B',
    badge: 'NEW',
    tagline: 'High-precision multi-head computerized machine embroidery for luxury streetwear branding.',
    description: 'Computerized multi-head machine embroidery on heavyweight t-shirts, hoodies, and overshirts. High thread density, 3D puff embroidery, and micro-crest stitching for fashion labels and corporate orders.',
    availableStock: 500,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590934041/EV/YM/MP/180956315/embroidery-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590885404/MA/PR/OG/180956315/t-shirt-printing-services-500x500.jpeg'
    ],
    sizes: ['Free Size / Custom'],
    details: [
      'Technology: High-speed computerized multi-needle embroidery',
      'Thread: Premium colorfast Madeira polyester and metallic threads',
      'Styles: Flat stitch, 3D foam puff, patch appliqué',
      'Location: Kanpur textile cluster manufacturing'
    ],
    materialCare: ['Standard wash'],
    shippingInfo: 'Factory direct shipment with tracking.',
    returnsInfo: 'Approval on digitizing swatch provided.',
    fit: 'Structured',
    occasion: 'Studio & Work',
    wholesalePrice: 'Contact for volume pricing'
  },
  {
    id: 'promotional-bio-washed-tshirt',
    name: 'Promotional 200 GSM Bio-Washed T-Shirt',
    price: 149,
    currency: '₹',
    category: 'Custom B2B',
    tagline: '200 GSM 100% cotton bio-washed promotional t-shirts available in 10 vibrant colors.',
    description: 'High-durability promotional and event t-shirts. 100% bio-washed cotton available in Maroon, Yellow, Orange, Black, Red, Green, Royal Blue, White, Navy Blue, and Grey.',
    availableStock: 200,
    images: [
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590929152/YX/IC/TZ/180956315/promotional-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590929116/FL/UW/RN/180956315/promotional-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590929119/VV/YE/TQ/180956315/promotional-t-shirt-500x500.jpeg',
      'https://5.imimg.com/data5/SELLER/Default/2026/3/590929126/BU/XM/JF/180956315/promotional-t-shirt-500x500.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      'Fabric: 100% Pure Bio-Washed Cotton',
      'GSM: 200 GSM heavy promotional grade',
      '10 Available Solid Colors for branding',
      'Ready for screen printing, DTF, or embroidery'
    ],
    materialCare: ['Machine wash warm'],
    shippingInfo: 'Bulk orders dispatched within 2-3 days.',
    returnsInfo: 'Quality replacement guaranteed.',
    fit: 'Structured',
    occasion: 'Everyday Uniform',
    wholesalePrice: '₹149 / piece (MOQ: 50 pcs)'
  }
];
