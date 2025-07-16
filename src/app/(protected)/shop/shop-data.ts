
import type { ShopItemData } from './_components/shop-item';

export const shopItemsData: ShopItemData[] = [
  {
    id: 'potion_energy',
    name: 'Enerji İksiri',
    description: 'Anında %10 HP yeniler. Gerçek hayatta bir bardak favori içeceğini içmeye veya bir paket abur cubur yemeye denktir. Anlık bir enerji patlaması sağlar ama gerçek sağlık alışkanlıklarının yerini tutmaz.',
    price: 100,
    imageUrl: '/enerjiksiri.png',
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
    imageUrl: '/gölgesineması.png',
    aiHint: 'futuristic screen'
  },
  {
    id: 'book_wisdom',
    name: 'Bilgelik Tomarı',
    description: 'Envanterden kullanarak 25 dakika boyunca kendini geliştirecek bir kitap oku veya benzeri kaynaklara göz at. Entelektüel kapasiteni ve algını yükseltir.',
    price: 300,
    imageUrl: '/bilgeliktomarı.png',
    aiHint: 'ancient book'
  },
];
