// Image asset mapping for unbranded loose farm produce
import toorDalImg from '../assets/images/toor_dal_loose_1790095463576.jpg';
import greenMoongImg from '../assets/images/green_moong_loose_1790095481366.jpg';
import groundnutImg from '../assets/images/groundnut_raw_loose_1790095495321.jpg';
import basmatiImg from '../assets/images/basmati_rice_loose_1790095518040.jpg';
import brownChanaImg from '../assets/images/brown_chana_loose_1790095529806.jpg';
import whitePeasImg from '../assets/images/white_peas_loose_1790095543799.jpg';
import blackRiceImg from '../assets/images/black_rice_loose_1790095555538.jpg';

export const PRODUCE_IMAGES: Record<string, string> = {
  'prod-toor-dal': toorDalImg,
  'prod-green-gram': greenMoongImg,
  'prod-groundnut': groundnutImg,
  'prod-brown-chana': brownChanaImg,
  'prod-sona-masoori': basmatiImg,
  'prod-basmati': basmatiImg,
  'prod-black-rice': blackRiceImg,
  'prod-white-peas': whitePeasImg,
  'prod-horse-gram': brownChanaImg,
  'prod-kalaburagi-toor': toorDalImg,
};

export function getProduceImage(produceId: string, category?: string): string {
  if (PRODUCE_IMAGES[produceId]) {
    return PRODUCE_IMAGES[produceId];
  }
  // Category fallbacks
  switch (category) {
    case 'pulses':
      return toorDalImg;
    case 'grains':
      return basmatiImg;
    case 'oilseeds':
      return groundnutImg;
    case 'peas':
      return whitePeasImg;
    case 'millets':
      return blackRiceImg;
    default:
      return toorDalImg;
  }
}
