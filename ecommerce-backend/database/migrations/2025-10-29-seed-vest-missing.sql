START TRANSACTION;

SET @default_stock = 100;

REPLACE INTO products (
  slug, name, category, short_description, description,
  price, original_price, stock, colors, sizes, image_url, gallery,
  rating, reviews, tags, is_featured, is_new
) VALUES
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
  4.5, 21, JSON_ARRAY('modern','limited'), 0, 0),

('vest-maverick-pinstripe', 'Maverick Pinstripe Vest', 'vest',
 'Pinstripe vest with maverick tailoring and sharp lapels.',
 'Maverick Pinstripe delivers a confident pinstripe pattern with sharp lapels and a tailored waist, balancing heritage details with modern ease.',
 1080, NULL, @default_stock,
  JSON_ARRAY('Navy Pinstripe','Charcoal Pinstripe'), JSON_ARRAY('S','M','L','XL'), '/images/image_6.png',
  JSON_ARRAY('/images/image_6.png','/images/banner.png'),
  4.6, 26, JSON_ARRAY('tailor-made','evening'), 0, 0);

COMMIT;

-- Backfill products_id for any newly inserted rows
UPDATE products SET products_id = CONCAT('PID', LPAD(id, 4, '0')) WHERE products_id IS NULL;


