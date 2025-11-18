export type TimelitePalette = {
  backgroundMain: string;
  backgroundLight: string;
  textPrimary: string;
  textSecondary: string;
  accentGold: string;
  accentGoldDeep: string;
  ctaPrimary: string;
  ctaPrimaryText: string;
  ctaSecondaryBorder: string;
  ctaSecondaryText: string;
  heroFrameBorder: string;
  iconStroke: string;
  whatsapp: string;
  messenger: string;
  floatingAction: string;
};

const timelitePalette: TimelitePalette = {
  backgroundMain: '#F6EFE3', // large hero background
  backgroundLight: '#FFFDF8', // navbar and surfaces
  textPrimary: '#1F1A17', // main headings
  textSecondary: '#5F5B57', // body copy
  accentGold: '#E2C675', // gold text/borders
  accentGoldDeep: '#B8953A', // outline button text
  ctaPrimary: '#B63A3F', // red "Shop Ao Dai" button
  ctaPrimaryText: '#FFFFFF',
  ctaSecondaryBorder: '#E4C768', // outlined CTA border
  ctaSecondaryText: '#C29A3B',
  heroFrameBorder: '#F1DA98', // oval frame outline
  iconStroke: '#EBDFA1', // navbar icon outlines
  whatsapp: '#27BA55',
  messenger: '#1D64E2',
  floatingAction: '#F8DE5E', // yellow close button
};

export default timelitePalette;
