import { Product, CommunityPhoto } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: '018 Platinum Sunset Wool-Blend Cap',
    category: 'Caps',
    price: 420,
    originalPrice: 480,
    rating: 4.8,
    reviewsCount: 34,
    sizes: ['1 SIZE (Adjustable Strap)'],
    colors: ['Desert Sand / Ice Cream Pastel', 'Jet Black', 'Off-White'],
    description: 'Premium 6-panel flat/curved brim wool-blend cap with custom artisan embroidered icon. Structured front crown with breathable eyelets and antique brass closure buckle.',
    features: [
      'Structured 6-panel silhouette with wool-blend warmth',
      'Artisan high-density pastel embroidery on crown',
      'Embossed 018 Bokone Bophirima inner taping',
      'Adjustable tuck-in leather backstrap with antique brass hardware',
      'Designed & finished in Klerksdorp, North West'
    ],
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 18,
    sku: '018-CAP-PLT-001',
    tag: 'NEW DROP',
    isNew: true,
    createdAt: '2026-03-01'
  },
  {
    id: 'prod-2',
    title: '018 3D Embroidered Monogram Visor Trucker Cap',
    category: 'Caps',
    price: 380,
    rating: 4.9,
    reviewsCount: 52,
    sizes: ['1 SIZE (Snapback)'],
    colors: ['Clean Studio White', 'Charcoal / 018 Orange', 'All Black'],
    description: 'Structured 5-panel curved visor trucker cap with 3D puff monogram embroidery. High-tensile ventilation mesh back and moisture-wicking sweatband.',
    features: [
      '3D Raised foam puff embroidery on structured foam front',
      'Breathable airflow mesh back for South African summer heat',
      'Dual tone 018 underbill contrast print',
      'Reinforced classic snapback closure',
      'Woven 018 Bokone side label'
    ],
    image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 24,
    sku: '018-CAP-TRK-002',
    tag: 'BESTSELLER',
    isBestseller: true,
    createdAt: '2026-02-15'
  },
  {
    id: 'prod-3',
    title: 'Bokone Monogram Jacquard Knit Polo',
    category: 'Polos & Knits',
    price: 950,
    originalPrice: 1100,
    rating: 5.0,
    reviewsCount: 41,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Black / Monogram Print', 'Off-White / 018 Orange', 'Sand Dune'],
    description: 'Our signature statement piece. Double-knit jacquard fabric engineered with repeating 018 monogram typographic motifs. Ribbed collar and cuffs with mother-of-pearl buttons.',
    features: [
      'Engineered 100% combed cotton jacquard double-knit (320 GSM)',
      'All-over high-definition 018 graphic typography weave',
      'Double-ribbed collar that holds shape forever',
      'Custom laser-engraved 018 Bokone buttons',
      'Knit from scratch in North West Province'
    ],
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 12,
    sku: '018-POLO-JAC-003',
    tag: 'BESTSELLER',
    isBestseller: true,
    createdAt: '2026-02-28'
  },
  {
    id: 'prod-4',
    title: 'Oak Classic Cardigan 018 - Heritage Edition',
    category: 'Luxury Knitwear',
    price: 1200,
    originalPrice: 1450,
    rating: 4.9,
    reviewsCount: 29,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream White / Navy & Orange Trims', 'Charcoal Heather', 'Oatmeal'],
    description: 'Heritage varsity-cut knit cardigan with chenille 018 crest emblem. Luxurious heavyweight yarn blend delivering unrivaled drape and warmth for cool Klerksdorp evenings.',
    features: [
      'Heavyweight 5-gauge chunky gauge cable knit',
      'Hand-sewn tactile chenille 018 felt crest on chest',
      'Subtle North West flag color accent ribbing along placket',
      'Tortoiseshell horn buttons',
      'Ribbed welt front pockets'
    ],
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 9,
    sku: '018-CARD-OAK-004',
    tag: 'NEW DROP',
    isNew: true,
    createdAt: '2026-03-05'
  },
  {
    id: 'prod-5',
    title: 'Contour Monogram Knit Dress',
    category: 'Dresses',
    price: 2000,
    rating: 5.0,
    reviewsCount: 19,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Monogram Noir / White', 'Sunset Terracotta', 'Emerald Shadow'],
    description: 'Body-contouring luxury midi dress knit with 018 bespoke typographic repeat. Elegant high crew neckline with short raglan sleeves. Flattering compression knit.',
    features: [
      'Bespoke contour jacquard rib sculpting knit',
      'Mid-calf length with subtle side walking slit',
      'Non-sheer 4-way stretch high-durability yarn',
      'Custom contrast ribbed collar and sleeve cuffs',
      'Worn boldly from day meetings to evening lounges'
    ],
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 7,
    sku: '018-DRESS-CNT-005',
    tag: 'LIMITED',
    createdAt: '2026-01-20'
  },
  {
    id: 'prod-6',
    title: '018 Bokone Stripe Knit Polo',
    category: 'Polos & Knits',
    price: 850,
    rating: 4.7,
    reviewsCount: 22,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Sunset Orange / Cream Stripes', 'Forest Green / Stone', 'Black / White'],
    description: 'Retro-inspired vertical textured knit polo with vibrant Bokone Bophirima sunset orange and warm sandstone vertical bands. Soft open Johnny collar.',
    features: [
      'Airy waffle-knit cotton blend structure',
      'Retro casual open collar (no buttons)',
      'Subtle 018 circular rubber badge at hem',
      'Breathable, pre-shrunk fabric',
      'Pairs seamlessly with light linen trousers'
    ],
    image: 'https://images.unsplash.com/photo-1625910513393-35dc90ebf9bc?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 15,
    sku: '018-POLO-STP-006',
    createdAt: '2026-02-10'
  },
  {
    id: 'prod-7',
    title: '018 Heavyweight 460GSM Signature Hoodie',
    category: 'Hoodies & Sweats',
    price: 1100,
    originalPrice: 1300,
    rating: 4.9,
    reviewsCount: 67,
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: ['Jet Black', 'Bokone Orange', 'Heather Concrete'],
    description: 'Ultra-heavyweight 460 GSM French terry hoodie. Double-layered hood without drawstrings for clean architectural streetwear styling. Front kangaroo pocket with reinforced bartacks.',
    features: [
      '460 GSM 100% French Terry Cotton',
      'Overlock seam construction for lifetime durability',
      'Tone-on-tone 018 Bokone high-density chest print',
      'Thumbhole cuffs on thick 2x2 ribbing',
      'Custom brushed fleece inner lining for winter'
    ],
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 28,
    sku: '018-HD-HVY-007',
    tag: 'BESTSELLER',
    isBestseller: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'prod-8',
    title: 'Weekend Combo Pack (Cardigan + Cap + Socks)',
    category: 'Combos',
    price: 1450,
    originalPrice: 2150,
    rating: 5.0,
    reviewsCount: 88,
    sizes: ['S / One Size Cap', 'M / One Size Cap', 'L / One Size Cap', 'XL / One Size Cap'],
    colors: ['Heritage Combo (Cream/Orange)', 'Monochrome Noir Pack'],
    description: 'Special 018 VIP Bundle. Includes the Oak Classic Cardigan, Sunset Wool-Blend Cap, and 2 pairs of Jacquard 018 Ribbed Crew Socks. Instant R700 saving.',
    features: [
      '1x Oak Classic Heritage Cardigan (R1,200 value)',
      '1x Platinum Sunset Wool-Blend Cap (R420 value)',
      '2x Jacquard 018 Cushioned Athletic Socks (R530 value)',
      'Packaged in custom 018 collector matte black gift box',
      'Free nationwide door-to-door courier included'
    ],
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 6,
    sku: '018-CMB-WKD-008',
    tag: 'SAVE R700',
    createdAt: '2026-03-02'
  },
  {
    id: 'prod-9',
    title: '018 Tactical Monogram Crossbody Bag',
    category: 'Bags',
    price: 650,
    rating: 4.8,
    reviewsCount: 16,
    sizes: ['1 SIZE (Adjustable Strap)'],
    colors: ['Matte Black / Orange Accent', 'Desert Camo'],
    description: 'Weatherproof ripstop nylon crossbody bag with rubberized 018 badge. Multiple quick-access zipper compartments for phone, wallet, keys, and accessories.',
    features: [
      'Cordura 500D water-repellent ballistic nylon',
      'YKK AquaGuard waterproof zippers',
      'Magnetic FIDLOCK-style quick-release buckle',
      'Hidden passport and cash security rear pocket',
      'Interior key carabiner & organizer dividers'
    ],
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 14,
    sku: '018-BAG-CRS-009',
    createdAt: '2026-02-20'
  },
  {
    id: 'prod-10',
    title: '018 Jacquard Winter Fisherman Beanie',
    category: 'Headwear & Beanies',
    price: 320,
    rating: 4.9,
    reviewsCount: 45,
    sizes: ['1 SIZE (Stretch Fit)'],
    colors: ['Signal Orange', 'Jet Black', 'Sand Dune', 'Forest Green'],
    description: 'Ribbed fisherman-fit beanie with fold-over cuff and woven 018 Bokone Bophirima heritage patch. 100% hypoallergenic soft acrylic yarn.',
    features: [
      'Classic shallow skull-cap / fisherman fit',
      'Dense 7-gauge rib knit for optimal heat retention',
      'Woven high-density 018 area code emblem',
      'Snug fit that maintains elasticity wash after wash'
    ],
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 30,
    sku: '018-BN-JAC-010',
    createdAt: '2026-01-10'
  },
  {
    id: 'prod-11',
    title: '018 Heavyweight Boxy Fit Graphic Tee',
    category: 'T-Shirts',
    price: 490,
    rating: 4.8,
    reviewsCount: 39,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Vintage Washed Black', 'Off-White', 'Bokone Orange'],
    description: '280 GSM heavyweight streetwear t-shirt with drop shoulders and thick 1.25" neck ribbing. Screen-printed with archival 018 Bokone Bophirima typography.',
    features: [
      '280 GSM 100% Carded Combed Cotton',
      'Boxy relaxed oversized streetwear cut',
      'Distressed mineral enzyme vintage wash',
      'Soft-hand screen print on front chest and back'
    ],
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 25,
    sku: '018-TEE-GPH-011',
    createdAt: '2026-02-18'
  },
  {
    id: 'prod-12',
    title: 'North West Signature Luxury Trench Knit Coat',
    category: 'Luxury Knitwear',
    price: 2400,
    rating: 5.0,
    reviewsCount: 14,
    sizes: ['S/M', 'L/XL'],
    colors: ['Charcoal Heather', 'Camel Tan'],
    description: 'Full-length luxury knit trench coat with removable waist belt, deep storm flap pockets, and jacquard 018 inner lining.',
    features: [
      'Premium wool & modal blend heavy drape knit',
      'Detachable double-knit waist tie',
      'Unstructured relaxed shoulders for versatile layering',
      'Crafted in limited small-batch quantity'
    ],
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    secondaryImages: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockQuantity: 4,
    sku: '018-CT-TRN-012',
    tag: 'LIMITED',
    createdAt: '2026-03-08'
  }
];

export const INITIAL_COMMUNITY_PHOTOS: CommunityPhoto[] = [
  {
    id: 'comm-1',
    userName: 'Kagiso M.',
    handle: '@kagiso_018',
    location: 'Klerksdorp, North West',
    caption: 'Wear what we dial. Oak Classic cardigan paired with the sunset cap at our weekend hangout! 🇿🇦🔥',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    productTagged: 'Oak Classic Cardigan 018 - Heritage Edition',
    likes: 142,
    createdAt: '2026-03-12',
    source: 'gallery'
  },
  {
    id: 'comm-2',
    userName: 'Lerato Tau',
    handle: '@lerato_bokone',
    location: 'Wilkoppies, Klerksdorp',
    caption: 'BOKONE, WORN BOLDLY. The knit dress fits like bespoke couture! Proudly 018 heritage ❤️✨',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    productTagged: 'Contour Monogram Knit Dress',
    likes: 219,
    createdAt: '2026-03-13',
    source: 'camera'
  },
  {
    id: 'comm-3',
    userName: 'Sipho & Friends',
    handle: '@sipho_lifestyle',
    location: 'Potchefstroom, NW',
    caption: 'Braai vibes with the crew rocking full 018 Bokone pieces. Unbeatable quality texturing.',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    productTagged: 'Bokone Monogram Jacquard Knit Polo',
    likes: 384,
    createdAt: '2026-03-14',
    source: 'gallery'
  },
  {
    id: 'comm-4',
    userName: 'Tshepo Nkosi',
    handle: '@tshepo_nw',
    location: 'Johannesburg, Gauteng',
    caption: 'Taking the 018 North West pride to Jozi streets. The 460GSM hoodie is next level.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    productTagged: '018 Heavyweight 460GSM Signature Hoodie',
    likes: 178,
    createdAt: '2026-03-14',
    source: 'camera'
  }
];

export const SOUTH_AFRICA_PROVINCES = [
  'North West',
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Mpumalanga',
  'Limpopo',
  'Northern Cape'
];
