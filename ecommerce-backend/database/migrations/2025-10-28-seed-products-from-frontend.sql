START TRANSACTION;

-- Seed products based on src/data/products.ts
-- Default stock for all items
SET @default_stock = 100;

REPLACE INTO products (
  slug, name, category, short_description, description,
  price, original_price, stock, colors, sizes, image_url, gallery,
  rating, reviews, tags, is_featured, is_new
) VALUES
('ao-dai-regal-crimson', 'Regal Crimson Ao Dai', 'ao-dai',
 'Crimson silk ao dai with hand-embroidered phoenix details, created for modern wedding ceremonies.',
 'Regal Crimson is crafted from Nha Xa mulberry silk and finished with hand-embroidered phoenix motifs that honor Vietnamese heritage. A sheer organza overlayer softens the profile while the tailored fit is calibrated for Western proportions.',
 1890, 2190, @default_stock,
  JSON_ARRAY('Crimson','Champagne','Ivory'), JSON_ARRAY('XS','S','M','L','XL'), '/images/image_2.png',
  JSON_ARRAY('/images/banner.png','/images/banner.png','/images/image_1.png'),
  4.9, 62, JSON_ARRAY('bridal','luxury','limited'), 1, 0),

('ao-dai-heritage-gold', 'Heritage Gold Ao Dai', 'ao-dai',
 'Golden satin ao dai framed with French lace, designed for black-tie celebrations.',
 'Heritage Gold pairs French lace with luminous satin and Swarovski beadwork to deliver a couture glow under evening lights. Raglan sleeves encourage fluid movement, making it ideal for receptions and red-carpet entrances.',
 1790, 1950, @default_stock,
  JSON_ARRAY('Gold','Pearl','Rose'), JSON_ARRAY('XS','S','M','L','XL'), '/images/image_1.png',
  JSON_ARRAY('/images/banner2.png','/images/image_2.png','/images/image_3.png'),
  4.8, 48, JSON_ARRAY('evening','best-seller'), 1, 0),

('ao-dai-silk-ivory', 'Silk Ivory Ao Dai', 'ao-dai',
 'Minimal ivory ao dai with architectural seams tailored for contemporary executives.',
 'Silk Ivory focuses on clean lines and a sculpted fit achieved through couture interior construction. Italian satin drapes elegantly while the streamlined collar keeps the look current for corporate galas and cultural moments.',
 1260, NULL, @default_stock,
  JSON_ARRAY('Ivory','Mist Blue','Emerald'), JSON_ARRAY('XS','S','M','L'), '/images/image_4.png',
  JSON_ARRAY('/images/image_4.png','/images/image_5.png'),
  4.7, 31, JSON_ARRAY('minimal','work'), 1, 0),

('vest-silk-noir', 'Silk Noir Vest Suit', 'vest',
 'Black satin longline vest suit with gold buttons for fashion-forward brides and hosts.',
 'Silk Noir features a lightly structured jacket with soft shoulders and premium Italian satin for a refined matte shine. Couture interior finishing keeps the silhouette sharp while allowing effortless movement all evening long.',
 980, NULL, @default_stock,
  JSON_ARRAY('Black','Emerald','Ruby'), JSON_ARRAY('XS','S','M','L','XL'), '/images/image_6.png',
  JSON_ARRAY('/images/image_6.png','/images/image_2.png'),
  4.6, 27, JSON_ARRAY('modern','evening'), 0, 0),

('vest-cream-tailored', 'Cream Tailored Vest', 'vest',
 'Champagne tailored vest set with culotte trousers for cocktail-ready polish.',
 'The Cream Tailored Vest blends champagne suiting with architectural darts to accentuate the waist. A breathable wool-blend keeps you comfortable from ceremony to after-party, while cropped culotte trousers add modern ease.',
 890, NULL, @default_stock,
  JSON_ARRAY('Champagne','Navy','Stone'), JSON_ARRAY('XS','S','M','L'), '/images/image_6.png',
  JSON_ARRAY('/images/banner.png','/images/image_3.png'),
  4.5, 19, JSON_ARRAY('business','signature'), 0, 0),

('wedding-lotus-bloom', 'Lotus Bloom Bridal Gown', 'wedding',
 'Multi-layer organza bridal gown inspired by lotus petals with crystal embellishment.',
 'Lotus Bloom combines a sheer corseted bodice with layered organza panels that mimic floating lotus petals. Hand-applied crystals create a gentle shimmer for ballroom and garden ceremonies alike.',
 2980, 3290, @default_stock,
  JSON_ARRAY('Pearl','Blush','Champagne'), JSON_ARRAY('S','M','L'), '/images/image_6.png',
  JSON_ARRAY('/images/image_1.png','/images/image_5.png'),
  4.9, 54, JSON_ARRAY('bridal','couture'), 0, 1),

('wedding-aurora', 'Aurora Silk Wedding Ao Dai', 'wedding',
 'White silk ao dai with detachable cape for elegant ceremonies across the United States.',
 'Aurora delivers a luminous silk base accompanied by a detachable illusion cape trimmed in freshwater pearls. The modular design transitions easily from church aisle to rooftop celebration.',
 2450, NULL, @default_stock,
  JSON_ARRAY('Ivory','Mocha','Rose'), JSON_ARRAY('XS','S','M','L'), '/images/image_5.png',
  JSON_ARRAY('/images/image_5.png','/images/image_3.png'),
  4.8, 43, JSON_ARRAY('bridal','limited'), 0, 0),

('evening-starlight', 'Starlight Evening Gown', 'evening',
 'High-slit evening gown with hand-set sequins that capture every flash on the gala carpet.',
 'Starlight is built on a fine mesh base layered with hand-applied sequins forming a constellation effect. The column silhouette elongates the figure while the strategic slit ensures comfortable strides on stage or red carpet.',
 1650, NULL, @default_stock,
  JSON_ARRAY('Black Gold','Emerald','Sapphire'), JSON_ARRAY('XS','S','M','L'), '/images/image_2.png',
  JSON_ARRAY('/images/image_2.png','/images/image_6.png'),
  4.7, 36, JSON_ARRAY('evening','best-seller'), 0, 0),

('evening-lumina', 'Lumina Velvet Gown', 'evening',
 'Burgundy velvet boat-neck gown finished with a sculpted champagne-gold belt.',
 'Lumina hugs the body in Italian velvet, balancing sensual draping with a structured belt dipped in champagne gold. The gown is a natural choice for holiday galas and black-tie charity events.',
 1380, NULL, @default_stock,
  JSON_ARRAY('Burgundy','Navy','Charcoal'), JSON_ARRAY('S','M','L'), '/images/image_4.png',
  JSON_ARRAY('/images/image_4.png','/images/image_6.png'),
  4.6, 24, JSON_ARRAY('evening','signature'), 0, 0),

('ao-dai-majestic-pearl', 'Majestic Pearl Ao Dai', 'ao-dai',
 'Pearl-toned ao dai with cathedral-length chiffon train celebrating Hue imperial motifs.',
 'Majestic Pearl reinterprets imperial Vietnamese patterns through champagne embroidery and pearl handwork. A detachable chiffon train creates an ethereal entrance for outdoor ceremonies and high-profile receptions.',
 2050, NULL, @default_stock,
  JSON_ARRAY('Pearl','Gold','Blush'), JSON_ARRAY('XS','S','M','L','XL'), '/images/image_3.png',
  JSON_ARRAY('/images/image_3.png','/images/image_2.png'),
  4.9, 58, JSON_ARRAY('bridal','heritage'), 0, 0),

('vest-midnight-velvet', 'Midnight Velvet Vest', 'vest',
 'Navy velvet vest with champagne hardware inspired by the New York skyline.',
 'Midnight Velvet pairs deep navy velvet with polished gold buttons to echo city lights at dusk. The elongated cut flatters tailored trousers while remaining soft enough for extended travel and meetings.',
 1120, NULL, @default_stock,
  JSON_ARRAY('Navy','Onyx','Forest'), JSON_ARRAY('S','M','L','XL'), '/images/image_6.png',
  JSON_ARRAY('/images/image_6.png','/images/banner.png'),
  4.5, 22, JSON_ARRAY('tailor-made','evening'), 0, 0),

('evening-amber', 'Amber Column Dress', 'evening',
 'Amber column dress with asymmetric cutouts for luminous cocktail statements.',
 'Amber Column relies on corseted construction and asymmetric cutouts to contour the body without sacrificing polish. A removable gold rope belt lets you transition seamlessly from cocktail hour to afterparty.',
 1520, NULL, @default_stock,
  JSON_ARRAY('Amber','Jet Black','Emerald'), JSON_ARRAY('XS','S','M','L'), '/images/image_4.png',
  JSON_ARRAY('/images/image_4.png','/images/image_1.png'),
  4.6, 30, JSON_ARRAY('evening','limited'), 0, 0);

-- Add 4 missing items from productIdMap
REPLACE INTO products (
  slug, name, category, short_description, description,
  price, original_price, stock, colors, sizes, image_url, gallery,
  rating, reviews, tags, is_featured, is_new
) VALUES
('ao-dai-azure-moon', 'Azure Moon Ao Dai', 'ao-dai',
 'Azure silk ao dai with moonlit sheen and minimal collar.',
 'Azure Moon balances a luminous silk base with a refined minimal collar, offering a contemporary silhouette inspired by night sky hues.',
 1720, NULL, @default_stock,
  JSON_ARRAY('Azure','Ivory','Emerald'), JSON_ARRAY('XS','S','M','L','XL'), '/images/image_2.png',
  JSON_ARRAY('/images/banner.png','/images/image_2.png'),
  4.7, 35, JSON_ARRAY('bridal','modern'), 0, 0),

('vest-executive-navy', 'Executive Navy Vest', 'vest',
 'Executive navy vest suit tailored for business formality.',
 'Executive Navy brings structured shoulders and clean lines, crafted in premium suiting for boardroom presence and evening polish.',
 990, NULL, @default_stock,
  JSON_ARRAY('Navy','Stone','Charcoal'), JSON_ARRAY('S','M','L','XL'), '/images/image_6.png',
  JSON_ARRAY('/images/image_6.png','/images/banner.png'),
  4.6, 28, JSON_ARRAY('business','signature'), 0, 0),

('vest-sovereign-charcoal', 'Sovereign Charcoal Vest', 'vest',
 'Charcoal vest with sovereign cut and refined finishing.',
 'Sovereign Charcoal features a sovereign cut with refined finishing, ideal for formal receptions and executive travel.',
 1050, NULL, @default_stock,
  JSON_ARRAY('Charcoal','Black','Navy'), JSON_ARRAY('S','M','L','XL'), '/images/image_6.png',
  JSON_ARRAY('/images/image_6.png','/images/image_2.png'),
  4.6, 24, JSON_ARRAY('evening','modern'), 0, 0),

('vest-diplomat-ivory', 'Diplomat Ivory Vest', 'vest',
 'Ivory vest set with diplomatic elegance and soft structure.',
 'Diplomat Ivory balances soft structure with diplomatic elegance, pairing easily with tailored trousers and evening appointments.',
 1020, NULL, @default_stock,
  JSON_ARRAY('Ivory','Champagne','Stone'), JSON_ARRAY('S','M','L'), '/images/image_6.png',
  JSON_ARRAY('/images/image_6.png','/images/image_5.png'),
  4.5, 21, JSON_ARRAY('modern','limited'), 0, 0);

COMMIT;

-- Ensure products_id filled for newly inserted rows
UPDATE products SET products_id = CONCAT('PID', LPAD(id, 4, '0')) WHERE products_id IS NULL;


