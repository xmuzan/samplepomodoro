
import type { ShopItemData } from './_components/shop-item';

export const shopItemsData: ShopItemData[] = [
  {
    id: 'potion_hp',
    name: 'Can İksiri',
    description: 'Anında %10 HP yeniler. Tükenmiş fiziksel gücü tazelemek için kullanılır.',
    price: 100,
    imageUrl: '/enerjiiksiri.png',
    aiHint: 'glowing potion'
  },
  {
    id: 'potion_mind',
    name: 'Zihin Kristali',
    description: 'Envanterden kullanarak zihinsel berraklığı anında artır. %15 MP yeniler.',
    price: 120,
    imageUrl: '/zihinkristali.png',
    aiHint: 'glowing blue crystal'
  },
  {
    id: 'scroll_cinema',
    name: 'Gölge Sineması',
    description: 'Envanterden kullanarak 20 dakikalık bir film, dizi veya video izle. Zihnini dinlendirir ve farklı dünyalara kaçmanı sağlar.',
    price: 250,
    imageUrl: '/sinema.png',
    aiHint: 'futuristic screen'
  },
  {
    id: 'potion_energy_new',
    name: 'Enerji İksiri',
    description: 'Gerçek hayatta bir bardak favori içeceğini içmeye veya bir paket abur cubur yemeye denktir. Anlık bir motivasyon artışı sağlar.',
    price: 50,
    imageUrl: '/enerjiiksiriyeni.png',
    aiHint: 'can of energy drink'
  }
];
