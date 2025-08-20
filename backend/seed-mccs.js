/**
 * seed-mccs.js
 * This script seeds standard MCC (Merchant Category Code) data into the database
 */

const jptsAdapter = require('./jpts-adapter');

// Initialize the jPTS adapter
const jpts = jptsAdapter.init();
const logger = jptsAdapter.logger;

// Standard MCC codes with descriptions, categories, and risk levels
const mccData = [
  { code: '0742', description: 'Veterinary Services', category: 'Professional Services', risk_level: 'low' },
  { code: '0763', description: 'Agricultural Cooperatives', category: 'Agriculture', risk_level: 'low' },
  { code: '0780', description: 'Landscaping Services', category: 'Services', risk_level: 'low' },
  { code: '1520', description: 'General Contractors - Residential and Commercial', category: 'Construction', risk_level: 'medium' },
  { code: '1711', description: 'Heating, Plumbing, A/C', category: 'Construction', risk_level: 'medium' },
  { code: '1731', description: 'Electrical Contractors', category: 'Construction', risk_level: 'medium' },
  { code: '1740', description: 'Masonry, Stonework, and Plaster', category: 'Construction', risk_level: 'medium' },
  { code: '1750', description: 'Carpentry Contractors', category: 'Construction', risk_level: 'medium' },
  { code: '1761', description: 'Roofing/Siding, Sheet Metal', category: 'Construction', risk_level: 'medium' },
  { code: '1771', description: 'Concrete Work Contractors', category: 'Construction', risk_level: 'medium' },
  { code: '2741', description: 'Miscellaneous Publishing and Printing', category: 'Publishing', risk_level: 'low' },
  { code: '2791', description: 'Typesetting, Plate Making, & Related Services', category: 'Publishing', risk_level: 'low' },
  { code: '2842', description: 'Specialty Cleaning', category: 'Services', risk_level: 'low' },
  { code: '3000', description: 'Airlines', category: 'Transportation', risk_level: 'medium' },
  { code: '3351', description: 'Car Rental', category: 'Transportation', risk_level: 'medium' },
  { code: '3501', description: 'Hotels, Motels, Resorts', category: 'Hospitality', risk_level: 'medium' },
  { code: '4011', description: 'Railroads', category: 'Transportation', risk_level: 'low' },
  { code: '4111', description: 'Local/Suburban Commuter Transport', category: 'Transportation', risk_level: 'low' },
  { code: '4121', description: 'Taxicabs/Limousines', category: 'Transportation', risk_level: 'medium' },
  { code: '4131', description: 'Bus Lines', category: 'Transportation', risk_level: 'low' },
  { code: '4214', description: 'Motor Freight Carriers and Trucking', category: 'Transportation', risk_level: 'low' },
  { code: '4215', description: 'Courier Services', category: 'Transportation', risk_level: 'low' },
  { code: '4411', description: 'Steamship/Cruise Lines', category: 'Transportation', risk_level: 'medium' },
  { code: '4457', description: 'Boat Rentals and Leases', category: 'Transportation', risk_level: 'medium' },
  { code: '4511', description: 'Airlines & Air Carriers', category: 'Transportation', risk_level: 'medium' },
  { code: '4722', description: 'Travel Agencies & Tour Operators', category: 'Travel', risk_level: 'medium' },
  { code: '4784', description: 'Tolls/Bridge Fees', category: 'Transportation', risk_level: 'low' },
  { code: '4789', description: 'Transportation Services - Not Elsewhere Classified', category: 'Transportation', risk_level: 'low' },
  { code: '4812', description: 'Telecommunication Equipment and Telephone Sales', category: 'Telecommunications', risk_level: 'medium' },
  { code: '4814', description: 'Telecommunication Services', category: 'Telecommunications', risk_level: 'medium' },
  { code: '4815', description: 'Monthly Summary Telephone Charges', category: 'Telecommunications', risk_level: 'low' },
  { code: '4816', description: 'Computer Network Services', category: 'Technology', risk_level: 'medium' },
  { code: '4821', description: 'Telegraph Services', category: 'Telecommunications', risk_level: 'low' },
  { code: '4899', description: 'Cable, Satellite, & Other Pay Television/Radio', category: 'Entertainment', risk_level: 'medium' },
  { code: '4900', description: 'Utilities - Electric, Gas, Water, Sanitary', category: 'Utilities', risk_level: 'low' },
  { code: '5013', description: 'Motor Vehicle Supplies and New Parts', category: 'Automotive', risk_level: 'medium' },
  { code: '5021', description: 'Office and Commercial Furniture', category: 'Office Supplies', risk_level: 'low' },
  { code: '5039', description: 'Construction Materials - Not Elsewhere Classified', category: 'Construction', risk_level: 'medium' },
  { code: '5044', description: 'Office, Photographic, Photocopy, & Microfilm Equipment', category: 'Office Supplies', risk_level: 'medium' },
  { code: '5045', description: 'Computers & Computer Peripheral Equipment & Software', category: 'Technology', risk_level: 'medium' },
  { code: '5046', description: 'Commercial Equipment - Not Elsewhere Classified', category: 'Business Equipment', risk_level: 'medium' },
  { code: '5047', description: 'Medical, Dental, Ophthalmic, & Hospital Equipment & Supplies', category: 'Healthcare', risk_level: 'medium' },
  { code: '5051', description: 'Metal Service Centers & Offices', category: 'Industrial', risk_level: 'medium' },
  { code: '5065', description: 'Electrical Parts & Equipment', category: 'Industrial', risk_level: 'medium' },
  { code: '5072', description: 'Hardware, Equipment, & Supplies', category: 'Industrial', risk_level: 'medium' },
  { code: '5074', description: 'Plumbing & Heating Equipment & Supplies', category: 'Construction', risk_level: 'medium' },
  { code: '5085', description: 'Industrial Supplies - Not Elsewhere Classified', category: 'Industrial', risk_level: 'medium' },
  { code: '5094', description: 'Precious Stones & Metals, Watches & Jewelry', category: 'Retail', risk_level: 'high' },
  { code: '5099', description: 'Durable Goods - Not Elsewhere Classified', category: 'Retail', risk_level: 'medium' },
  { code: '5111', description: 'Stationery, Office Supplies, Printing & Writing Paper', category: 'Office Supplies', risk_level: 'low' },
  { code: '5122', description: 'Drugs, Drug Proprietaries, & Druggist Sundries', category: 'Healthcare', risk_level: 'medium' },
  { code: '5131', description: 'Piece Goods, Notions, & Other Dry Goods', category: 'Retail', risk_level: 'medium' },
  { code: '5137', description: "Men's, Women's, & Children's Uniforms & Commercial Clothing", category: 'Retail', risk_level: 'medium' },
  { code: '5139', description: 'Commercial Footwear', category: 'Retail', risk_level: 'medium' },
  { code: '5169', description: 'Chemicals & Allied Products - Not Elsewhere Classified', category: 'Industrial', risk_level: 'high' },
  { code: '5172', description: 'Petroleum & Petroleum Products', category: 'Energy', risk_level: 'high' },
  { code: '5192', description: 'Books, Periodicals, & Newspapers', category: 'Retail', risk_level: 'low' },
  { code: '5193', description: "Florists' Supplies, Nursery Stock, & Flowers", category: 'Retail', risk_level: 'low' },
  { code: '5198', description: 'Paints, Varnishes, & Supplies', category: 'Industrial', risk_level: 'medium' },
  { code: '5199', description: 'Nondurable Goods - Not Elsewhere Classified', category: 'Retail', risk_level: 'medium' },
  { code: '5200', description: 'Home Supply Warehouse Stores', category: 'Retail', risk_level: 'low' },
  { code: '5211', description: 'Lumber & Building Materials Stores', category: 'Retail', risk_level: 'low' },
  { code: '5231', description: 'Glass, Paint, & Wallpaper Stores', category: 'Retail', risk_level: 'low' },
  { code: '5251', description: 'Hardware Stores', category: 'Retail', risk_level: 'low' },
  { code: '5261', description: 'Lawn & Garden Supply Stores', category: 'Retail', risk_level: 'low' },
  { code: '5271', description: 'Mobile Home Dealers', category: 'Retail', risk_level: 'medium' },
  { code: '5300', description: 'Wholesale Clubs', category: 'Retail', risk_level: 'low' },
  { code: '5309', description: 'Duty Free Stores', category: 'Retail', risk_level: 'medium' },
  { code: '5310', description: 'Discount Stores', category: 'Retail', risk_level: 'low' },
  { code: '5311', description: 'Department Stores', category: 'Retail', risk_level: 'low' },
  { code: '5331', description: 'Variety Stores', category: 'Retail', risk_level: 'low' },
  { code: '5399', description: 'Miscellaneous General Merchandise', category: 'Retail', risk_level: 'low' },
  { code: '5411', description: 'Grocery Stores & Supermarkets', category: 'Food & Beverage', risk_level: 'low' },
  { code: '5422', description: 'Freezer & Locker Meat Provisioners', category: 'Food & Beverage', risk_level: 'low' },
  { code: '5441', description: 'Candy, Nut, & Confectionery Stores', category: 'Food & Beverage', risk_level: 'low' },
  { code: '5451', description: 'Dairy Products Stores', category: 'Food & Beverage', risk_level: 'low' },
  { code: '5462', description: 'Bakeries', category: 'Food & Beverage', risk_level: 'low' },
  { code: '5499', description: 'Miscellaneous Food Stores - Convenience Stores & Specialty Markets', category: 'Food & Beverage', risk_level: 'low' },
  { code: '5511', description: 'Car & Truck Dealers (New & Used)', category: 'Automotive', risk_level: 'medium' },
  { code: '5521', description: 'Car & Truck Dealers (Used Only)', category: 'Automotive', risk_level: 'medium' },
  { code: '5531', description: 'Auto & Home Supply Stores', category: 'Automotive', risk_level: 'low' },
  { code: '5532', description: 'Automotive Tire Stores', category: 'Automotive', risk_level: 'low' },
  { code: '5533', description: 'Automotive Parts & Accessories Stores', category: 'Automotive', risk_level: 'low' },
  { code: '5541', description: 'Service Stations', category: 'Automotive', risk_level: 'low' },
  { code: '5542', description: 'Automated Fuel Dispensers', category: 'Automotive', risk_level: 'medium' },
  { code: '5551', description: 'Boat Dealers', category: 'Retail', risk_level: 'medium' },
  { code: '5561', description: 'Motorcycle Dealers', category: 'Automotive', risk_level: 'medium' },
  { code: '5571', description: 'Motorcycle Shops & Dealers', category: 'Automotive', risk_level: 'medium' },
  { code: '5592', description: 'Motor Home Dealers', category: 'Automotive', risk_level: 'medium' },
  { code: '5598', description: 'Snowmobile Dealers', category: 'Automotive', risk_level: 'medium' },
  { code: '5599', description: 'Miscellaneous Automotive, Aircraft, & Farm Equipment Dealers', category: 'Automotive', risk_level: 'medium' },
  { code: '5611', description: "Men's & Boys' Clothing & Accessories Stores", category: 'Retail', risk_level: 'low' },
  { code: '5621', description: "Women's Ready-To-Wear Stores", category: 'Retail', risk_level: 'low' },
  { code: '5631', description: "Women's Accessory & Specialty Shops", category: 'Retail', risk_level: 'low' },
  { code: '5641', description: "Children's & Infants' Wear Stores", category: 'Retail', risk_level: 'low' },
  { code: '5651', description: 'Family Clothing Stores', category: 'Retail', risk_level: 'low' },
  { code: '5655', description: 'Sports & Riding Apparel Stores', category: 'Retail', risk_level: 'low' },
  { code: '5661', description: 'Shoe Stores', category: 'Retail', risk_level: 'low' },
  { code: '5681', description: 'Furriers & Fur Shops', category: 'Retail', risk_level: 'medium' },
  { code: '5691', description: "Men's & Women's Clothing Stores", category: 'Retail', risk_level: 'low' },
  { code: '5697', description: 'Tailors, Alterations', category: 'Services', risk_level: 'low' },
  { code: '5698', description: 'Wig & Toupee Stores', category: 'Retail', risk_level: 'low' },
  { code: '5699', description: 'Miscellaneous Apparel & Accessory Shops', category: 'Retail', risk_level: 'low' },
  { code: '5712', description: 'Furniture, Home Furnishings, & Equipment Stores, Except Appliances', category: 'Retail', risk_level: 'low' },
  { code: '5713', description: 'Floor Covering Stores', category: 'Retail', risk_level: 'low' },
  { code: '5714', description: 'Drapery, Window Covering, & Upholstery Stores', category: 'Retail', risk_level: 'low' },
  { code: '5718', description: 'Fireplace, Fireplace Screens, & Accessories Stores', category: 'Retail', risk_level: 'low' },
  { code: '5719', description: 'Miscellaneous Home Furnishing Specialty Stores', category: 'Retail', risk_level: 'low' },
  { code: '5722', description: 'Household Appliance Stores', category: 'Retail', risk_level: 'low' },
  { code: '5732', description: 'Electronics Stores', category: 'Retail', risk_level: 'medium' },
  { code: '5733', description: 'Music Stores - Musical Instruments, Pianos, & Sheet Music', category: 'Retail', risk_level: 'low' },
  { code: '5734', description: 'Computer Software Stores', category: 'Technology', risk_level: 'medium' },
  { code: '5735', description: 'Record Stores', category: 'Retail', risk_level: 'low' },
  { code: '5811', description: 'Caterers', category: 'Food & Beverage', risk_level: 'medium' },
  { code: '5812', description: 'Eating Places & Restaurants', category: 'Food & Beverage', risk_level: 'medium' },
  { code: '5813', description: 'Drinking Places (Alcoholic Beverages)', category: 'Food & Beverage', risk_level: 'medium' },
  { code: '5814', description: 'Fast Food Restaurants', category: 'Food & Beverage', risk_level: 'medium' },
  { code: '5912', description: 'Drug Stores & Pharmacies', category: 'Healthcare', risk_level: 'medium' },
  { code: '5921', description: 'Package Stores - Beer, Wine, & Liquor', category: 'Food & Beverage', risk_level: 'medium' },
  { code: '5931', description: 'Used Merchandise & Secondhand Stores', category: 'Retail', risk_level: 'medium' },
  { code: '5932', description: 'Antique Shops', category: 'Retail', risk_level: 'low' },
  { code: '5933', description: 'Pawn Shops', category: 'Retail', risk_level: 'high' },
  { code: '5935', description: 'Wrecking & Salvage Yards', category: 'Industrial', risk_level: 'medium' },
  { code: '5937', description: 'Antique Reproductions', category: 'Retail', risk_level: 'low' },
  { code: '5940', description: 'Bicycle Shops', category: 'Retail', risk_level: 'low' },
  { code: '5941', description: 'Sporting Goods Stores', category: 'Retail', risk_level: 'low' },
  { code: '5942', description: 'Book Stores', category: 'Retail', risk_level: 'low' },
  { code: '5943', description: 'Stationery Stores, Office, & School Supply Stores', category: 'Office Supplies', risk_level: 'low' },
  { code: '5944', description: 'Jewelry, Watch, Clock, & Silverware Stores', category: 'Retail', risk_level: 'high' },
  { code: '5945', description: 'Hobby, Toy, & Game Shops', category: 'Retail', risk_level: 'low' },
  { code: '5946', description: 'Camera & Photographic Supply Stores', category: 'Retail', risk_level: 'medium' },
  { code: '5947', description: 'Gift, Card, Novelty, & Souvenir Shops', category: 'Retail', risk_level: 'low' },
  { code: '5948', description: 'Luggage & Leather Goods Stores', category: 'Retail', risk_level: 'low' },
  { code: '5949', description: 'Sewing, Needlework, Fabric, & Piece Goods Stores', category: 'Retail', risk_level: 'low' },
  { code: '5950', description: 'Glassware, Crystal Stores', category: 'Retail', risk_level: 'low' },
  { code: '5960', description: 'Direct Marketing - Insurance Services', category: 'Insurance', risk_level: 'medium' },
  { code: '5962', description: 'Direct Marketing - Travel-Related Arrangement Services', category: 'Travel', risk_level: 'high' },
  { code: '5963', description: 'Door-To-Door Sales', category: 'Retail', risk_level: 'high' },
  { code: '5964', description: 'Direct Marketing - Catalog Merchant', category: 'Retail', risk_level: 'medium' },
  { code: '5965', description: 'Direct Marketing - Combination Catalog & Retail Merchant', category: 'Retail', risk_level: 'medium' },
  { code: '5966', description: 'Direct Marketing - Outbound Telemarketing', category: 'Services', risk_level: 'high' },
  { code: '5967', description: 'Direct Marketing - Inbound Telemarketing', category: 'Services', risk_level: 'high' },
  { code: '5968', description: 'Direct Marketing - Continuity/Subscription Merchant', category: 'Services', risk_level: 'high' },
  { code: '5969', description: 'Direct Marketing - Other Direct Marketers', category: 'Retail', risk_level: 'medium' },
  { code: '5970', description: "Artist's Supply & Craft Shops", category: 'Retail', risk_level: 'low' },
  { code: '5971', description: 'Art Dealers & Galleries', category: 'Retail', risk_level: 'medium' },
  { code: '5972', description: 'Stamp & Coin Stores', category: 'Retail', risk_level: 'medium' },
  { code: '5973', description: 'Religious Goods Stores', category: 'Retail', risk_level: 'low' },
  { code: '5975', description: 'Hearing Aids Sales & Supplies', category: 'Healthcare', risk_level: 'medium' },
  { code: '5976', description: 'Orthopedic Goods - Prosthetic Devices', category: 'Healthcare', risk_level: 'medium' },
  { code: '5977', description: 'Cosmetic Stores', category: 'Retail', risk_level: 'low' },
  { code: '5978', description: 'Typewriter Stores', category: 'Office Supplies', risk_level: 'low' },
  { code: '5983', description: 'Fuel Dealers - Fuel Oil, Wood, Coal, & Liquefied Petroleum', category: 'Energy', risk_level: 'medium' },
  { code: '5992', description: 'Florists', category: 'Retail', risk_level: 'low' },
  { code: '5993', description: 'Cigar Stores & Stands', category: 'Retail', risk_level: 'medium' },
  { code: '5994', description: 'News Dealers & Newsstands', category: 'Retail', risk_level: 'low' },
  { code: '5995', description: 'Pet Shops, Pet Food, & Supplies', category: 'Retail', risk_level: 'low' },
  { code: '5996', description: 'Swimming Pools - Sales & Supplies', category: 'Retail', risk_level: 'low' },
  { code: '5997', description: 'Electric Razor Stores', category: 'Retail', risk_level: 'low' },
  { code: '5998', description: 'Tent & Awning Shops', category: 'Retail', risk_level: 'low' },
  { code: '5999', description: 'Miscellaneous & Specialty Retail Stores', category: 'Retail', risk_level: 'medium' },
  { code: '6010', description: 'Financial Institutions - Manual Cash Disbursements', category: 'Financial', risk_level: 'high' },
  { code: '6011', description: 'Financial Institutions - Automated Cash Disbursements', category: 'Financial', risk_level: 'medium' },
  { code: '6012', description: 'Financial Institutions - Merchandise & Services', category: 'Financial', risk_level: 'medium' },
  { code: '6051', description: 'Non-Financial Institutions - Foreign Currency, Money Orders, Stored Value Cards, & Travelers Checks', category: 'Financial', risk_level: 'high' },
  { code: '6211', description: 'Securities - Brokers & Dealers', category: 'Financial', risk_level: 'high' },
  { code: '6300', description: 'Insurance Sales & Underwriting', category: 'Insurance', risk_level: 'medium' },
  { code: '7011', description: 'Lodging - Hotels, Motels, & Resorts', category: 'Hospitality', risk_level: 'medium' },
  { code: '7032', description: 'Recreational & Sporting Camps', category: 'Hospitality', risk_level: 'medium' },
  { code: '7033', description: 'Trailer Parks & Campgrounds', category: 'Hospitality', risk_level: 'medium' },
  { code: '7210', description: 'Laundry, Cleaning, & Garment Services', category: 'Services', risk_level: 'low' },
  { code: '7216', description: 'Dry Cleaners', category: 'Services', risk_level: 'low' },
  { code: '7217', description: 'Carpet & Upholstery Cleaning', category: 'Services', risk_level: 'low' },
  { code: '7221', description: 'Photographic Studios', category: 'Services', risk_level: 'low' },
  { code: '7230', description: 'Beauty & Barber Shops', category: 'Services', risk_level: 'low' },
  { code: '7251', description: 'Shoe Repair Shops, Shoe Shine Parlors, & Hat Cleaning Shops', category: 'Services', risk_level: 'low' },
  { code: '7261', description: 'Funeral Services & Crematories', category: 'Services', risk_level: 'medium' },
  { code: '7273', description: 'Dating Services', category: 'Services', risk_level: 'high' },
  { code: '7276', description: 'Tax Preparation Services', category: 'Professional Services', risk_level: 'medium' },
  { code: '7277', description: 'Counseling Services - Debt, Marriage, & Personal', category: 'Professional Services', risk_level: 'medium' },
  { code: '7278', description: 'Buying & Shopping Services & Clubs', category: 'Services', risk_level: 'medium' },
  { code: '7296', description: 'Clothing Rental', category: 'Services', risk_level: 'low' },
  { code: '7297', description: 'Massage Parlors', category: 'Services', risk_level: 'high' },
  { code: '7298', description: 'Health & Beauty Spas', category: 'Services', risk_level: 'medium' },
  { code: '7299', description: 'Miscellaneous Personal Services', category: 'Services', risk_level: 'medium' },
  { code: '7311', description: 'Advertising Services', category: 'Professional Services', risk_level: 'medium' },
  { code: '7321', description: 'Consumer Credit Reporting Agencies', category: 'Financial', risk_level: 'medium' },
  { code: '7333', description: 'Commercial Photography, Art, & Graphics', category: 'Professional Services', risk_level: 'low' },
  { code: '7338', description: 'Quick Copy, Repro, & Blueprint', category: 'Professional Services', risk_level: 'low' },
  { code: '7339', description: 'Stenographic & Secretarial Support Services', category: 'Professional Services', risk_level: 'low' },
  { code: '7342', description: 'Exterminating & Disinfecting Services', category: 'Services', risk_level: 'low' },
  { code: '7349', description: 'Cleaning & Maintenance', category: 'Services', risk_level: 'low' },
  { code: '7361', description: 'Employment Agencies & Temporary Help Services', category: 'Professional Services', risk_level: 'medium' },
  { code: '7372', description: 'Computer Programming', category: 'Technology', risk_level: 'medium' },
  { code: '7375', description: 'Information Retrieval Services', category: 'Technology', risk_level: 'medium' },
  { code: '7379', description: 'Computer Maintenance & Repair Services', category: 'Technology', risk_level: 'medium' },
  { code: '7392', description: 'Management, Consulting, & Public Relations Services', category: 'Professional Services', risk_level: 'medium' },
  { code: '7393', description: 'Detective Agencies & Protective Services', category: 'Services', risk_level: 'medium' },
  { code: '7394', description: 'Equipment Rental & Leasing Services, Tool Rental, Furniture Rental, & Appliance Rental', category: 'Services', risk_level: 'medium' },
  { code: '7395', description: 'Photo Developing', category: 'Services', risk_level: 'low' },
  { code: '7399', description: 'Business Services - Not Elsewhere Classified', category: 'Professional Services', risk_level: 'medium' },
  { code: '7512', description: 'Automobile Rental Agency', category: 'Automotive', risk_level: 'medium' },
  { code: '7513', description: 'Truck & Utility Trailer Rentals', category: 'Automotive', risk_level: 'medium' },
  { code: '7519', description: 'Motor Home & Recreational Vehicle Rentals', category: 'Automotive', risk_level: 'medium' },
  { code: '7523', description: 'Parking Lots, Garages', category: 'Automotive', risk_level: 'low' },
  { code: '7531', description: 'Automotive Body Repair Shops', category: 'Automotive', risk_level: 'medium' },
  { code: '7534', description: 'Tire Retreading & Repair Shops', category: 'Automotive', risk_level: 'low' },
  { code: '7535', description: 'Automotive Paint Shops', category: 'Automotive', risk_level: 'medium' },
  { code: '7538', description: 'Automotive Service Shops', category: 'Automotive', risk_level: 'medium' },
  { code: '7542', description: 'Car Washes', category: 'Automotive', risk_level: 'low' },
  { code: '7549', description: 'Towing Services', category: 'Automotive', risk_level: 'medium' },
  { code: '7622', description: 'Electronics Repair Shops', category: 'Services', risk_level: 'medium' },
  { code: '7623', description: 'Air Conditioning & Refrigeration Repair', category: 'Services', risk_level: 'medium' },
  { code: '7629', description: 'Electrical & Small Appliance Repair', category: 'Services', risk_level: 'medium' },
  { code: '7631', description: 'Watch, Clock, & Jewelry Repair', category: 'Services', risk_level: 'medium' },
  { code: '7641', description: 'Furniture - Reupholstery, Repair, & Refinishing', category: 'Services', risk_level: 'low' },
  { code: '7692', description: 'Welding Services', category: 'Services', risk_level: 'low' },
  { code: '7699', description: 'Miscellaneous Repair Shops & Related Services', category: 'Services', risk_level: 'medium' },
  { code: '7829', description: 'Motion Picture & Video Tape Production & Distribution', category: 'Entertainment', risk_level: 'medium' },
  { code: '7832', description: 'Motion Picture Theaters', category: 'Entertainment', risk_level: 'medium' },
  { code: '7841', description: 'Video Tape Rental Stores', category: 'Entertainment', risk_level: 'low' },
  { code: '7911', description: 'Dance Halls, Studios, & Schools', category: 'Entertainment', risk_level: 'medium' },
  { code: '7922', description: 'Theatrical Producers & Ticket Agencies', category: 'Entertainment', risk_level: 'medium' },
  { code: '7929', description: 'Bands, Orchestras, & Miscellaneous Entertainers - Not Elsewhere Classified', category: 'Entertainment', risk_level: 'medium' },
  { code: '7932', description: 'Billiard & Pool Establishments', category: 'Entertainment', risk_level: 'medium' },
  { code: '7933', description: 'Bowling Alleys', category: 'Entertainment', risk_level: 'medium' },
  { code: '7941', description: 'Sports Clubs/Fields', category: 'Entertainment', risk_level: 'medium' },
  { code: '7991', description: 'Tourist Attractions & Exhibits', category: 'Entertainment', risk_level: 'medium' },
  { code: '7992', description: 'Public Golf Courses', category: 'Entertainment', risk_level: 'medium' },
  { code: '7993', description: 'Video Game Arcades', category: 'Entertainment', risk_level: 'medium' },
  { code: '7994', description: 'Video Game Arcades/Establishments', category: 'Entertainment', risk_level: 'medium' },
  { code: '7995', description: 'Betting/Casino Gambling', category: 'Entertainment', risk_level: 'high' },
  { code: '7996', description: 'Amusement Parks/Carnivals', category: 'Entertainment', risk_level: 'medium' },
  { code: '7997', description: 'Clubs - Country Clubs, Membership', category: 'Entertainment', risk_level: 'medium' },
  { code: '7998', description: 'Aquariums', category: 'Entertainment', risk_level: 'medium' },
  { code: '7999', description: 'Recreation Services - Not Elsewhere Classified', category: 'Entertainment', risk_level: 'medium' },
  { code: '8011', description: 'Doctors & Physicians', category: 'Healthcare', risk_level: 'medium' },
  { code: '8021', description: 'Dentists & Orthodontists', category: 'Healthcare', risk_level: 'medium' },
  { code: '8031', description: 'Osteopaths', category: 'Healthcare', risk_level: 'medium' },
  { code: '8041', description: 'Chiropractors', category: 'Healthcare', risk_level: 'medium' },
  { code: '8042', description: 'Optometrists & Ophthalmologists', category: 'Healthcare', risk_level: 'medium' },
  { code: '8043', description: 'Opticians, Eyeglasses', category: 'Healthcare', risk_level: 'medium' },
  { code: '8049', description: 'Podiatrists & Chiropodists', category: 'Healthcare', risk_level: 'medium' },
  { code: '8050', description: 'Nursing & Personal Care', category: 'Healthcare', risk_level: 'medium' },
  { code: '8062', description: 'Hospitals', category: 'Healthcare', risk_level: 'medium' },
  { code: '8071', description: 'Medical & Dental Laboratories', category: 'Healthcare', risk_level: 'medium' },
  { code: '8099', description: 'Health Practitioners, Medical Services - Not Elsewhere Classified', category: 'Healthcare', risk_level: 'medium' },
  { code: '8111', description: 'Legal Services, Attorneys', category: 'Professional Services', risk_level: 'medium' },
  { code: '8211', description: 'Elementary & Secondary Schools', category: 'Education', risk_level: 'medium' },
  { code: '8220', description: 'Colleges & Universities', category: 'Education', risk_level: 'medium' },
  { code: '8241', description: 'Correspondence Schools', category: 'Education', risk_level: 'medium' },
  { code: '8244', description: 'Business & Vocational Schools', category: 'Education', risk_level: 'medium' },
  { code: '8249', description: 'Trade & Vocational Schools', category: 'Education', risk_level: 'medium' },
  { code: '8299', description: 'Schools & Educational Services - Not Elsewhere Classified', category: 'Education', risk_level: 'medium' },
  { code: '8351', description: 'Child Care Services', category: 'Services', risk_level: 'medium' },
  { code: '8398', description: 'Charitable & Social Service Organizations', category: 'Non-profit', risk_level: 'medium' },
  { code: '8641', description: 'Civic, Social, & Fraternal Associations', category: 'Non-profit', risk_level: 'medium' },
  { code: '8651', description: 'Political Organizations', category: 'Non-profit', risk_level: 'medium' },
  { code: '8661', description: 'Religious Organizations', category: 'Non-profit', risk_level: 'medium' },
  { code: '8675', description: 'Automobile Associations', category: 'Automotive', risk_level: 'medium' },
  { code: '8699', description: 'Membership Organizations - Not Elsewhere Classified', category: 'Non-profit', risk_level: 'medium' },
  { code: '8734', description: 'Testing Laboratories', category: 'Professional Services', risk_level: 'medium' },
  { code: '8911', description: 'Architectural, Engineering, & Surveying Services', category: 'Professional Services', risk_level: 'medium' },
  { code: '8931', description: 'Accounting, Auditing, & Bookkeeping Services', category: 'Professional Services', risk_level: 'medium' },
  { code: '8999', description: 'Professional Services - Not Elsewhere Classified', category: 'Professional Services', risk_level: 'medium' },
  { code: '9211', description: 'Court Costs', category: 'Government', risk_level: 'low' },
  { code: '9222', description: 'Fines', category: 'Government', risk_level: 'low' },
  { code: '9311', description: 'Tax Payments', category: 'Government', risk_level: 'low' },
  { code: '9399', description: 'Government Services - Not Elsewhere Classified', category: 'Government', risk_level: 'low' },
  { code: '9402', description: 'Postal Services - Government Only', category: 'Government', risk_level: 'low' },
  { code: '9950', description: 'Intra-Company Purchases', category: 'Business', risk_level: 'low' }
];

/**
 * Seed MCC data
 */
async function seedMccs() {
  try {
    logger.log(`Seeding standard MCC data...`);
    
    // Check if MCCs table exists
    const tableCheck = await jpts.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'mccs'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    // Check if category column exists
    let categoryColumnExists = false;
    if (tableExists) {
      const categoryColumnCheck = await jpts.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = 'mccs'
          AND column_name = 'category'
        );
      `);
      
      categoryColumnExists = categoryColumnCheck.rows[0].exists;
      
      if (!categoryColumnExists) {
        logger.log('Adding missing category column to MCCs table...');
        await jpts.query(`ALTER TABLE mccs ADD COLUMN category VARCHAR(50);`);
        logger.log('Category column added to MCCs table');
        categoryColumnExists = true;
      }
    }
    
    if (!tableExists) {
      logger.log('MCCs table does not exist, creating it...');
      await jpts.query(`
        CREATE TABLE mccs (
          id SERIAL PRIMARY KEY,
          _id VARCHAR(50) UNIQUE,
          code VARCHAR(10) NOT NULL UNIQUE,
          description TEXT,
          category VARCHAR(50),
          risk_level VARCHAR(20)
        );
      `);
    } else {
      if (!categoryColumnExists) {
        logger.log('Adding missing category column to MCCs table...');
        await jpts.query(`ALTER TABLE mccs ADD COLUMN category VARCHAR(50);`);
        logger.log('Category column added to MCCs table');
      }
      
      logger.log('MCCs table exists, clearing existing data...');
      await jpts.query('TRUNCATE TABLE mccs RESTART IDENTITY');
      logger.log('MCCs table cleared.');
    }
    
    logger.log(`Adding ${mccData.length} MCCs to the database...`);
    
    // Insert MCCs in batches
    const batchSize = 20;
    const batches = Math.ceil(mccData.length / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const start = batch * batchSize;
      const end = Math.min(start + batchSize, mccData.length);
      const currentBatch = mccData.slice(start, end);
      
      console.log(`Processing batch ${batch + 1}/${batches} (MCCs ${start+1}-${end})`);
      
      for (const mcc of currentBatch) {
        try {
          // No need for a unique ID since we'll use the 'id' column as the primary key
          
          console.log(`Inserting MCC ${mcc.code}: ${mcc.description} with category: ${mcc.category}, risk level: ${mcc.risk_level}`);
          
          // Insert MCC
          await jpts.query(`
            INSERT INTO mccs (code, description, category, risk_level)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (code) DO UPDATE SET 
              description = $2,
              category = $3,
              risk_level = $4
          `, [mcc.code, mcc.description, mcc.category, mcc.risk_level]);
          
          console.log(`Successfully added MCC ${mcc.code}: ${mcc.description}`);
        } catch (err) {
          console.error(`Error inserting MCC ${mcc.code}: ${err.message}`);
          logger.error(`Error inserting MCC ${mcc.code}: ${err.message}`);
        }
      }
      
      console.log(`Inserted batch ${batch + 1}/${batches} of MCCs`);
      logger.log(`Inserted batch ${batch + 1}/${batches} of MCCs`);
    }
    
    // Get final count
    const finalCount = await jpts.query('SELECT COUNT(*) FROM mccs');
    logger.log(`Finished seeding MCCs. Total count: ${finalCount.rows[0].count}`);
    
  } catch (error) {
    logger.error(`Error seeding MCCs: ${error.message}`);
    logger.error(error.stack);
  }
}

/**
 * Main function
 */
async function seedData() {
  console.log('Starting MCC data seeding process...');
  logger.log('Starting MCC data seeding process...');
  
  try {
    // Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check database connection
    const connectionCheck = await jpts.query('SELECT NOW()');
    console.log('Database connection confirmed:', connectionCheck.rows[0].now);
    
    // Check if MCCs table exists and has the category column
    const tableCheck = await jpts.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'mccs'
    `);
    
    console.log('MCCs table structure:', tableCheck.rows);
    
    // Seed MCC data
    await seedMccs();
    
    // Check final count
    const finalCount = await jpts.query('SELECT COUNT(*) FROM mccs');
    console.log(`Final MCC count: ${finalCount.rows[0].count}`);
    
    console.log('MCC data seeding completed successfully');
    logger.log('MCC data seeding completed successfully');
  } catch (error) {
    console.error(`Error during MCC data seeding: ${error.message}`);
    logger.error(`Error during MCC data seeding: ${error.message}`);
    logger.error(error.stack);
  }
}

// Run the seeding process
module.exports = seedData;
