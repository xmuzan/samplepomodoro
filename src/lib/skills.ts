
export const SKILL_CATEGORIES = {
    wingchun: {
        label: 'Wing Chun',
        ranks: ['Çırak', 'Savaşçı', 'Usta', 'Büyük Usta', 'Efsanevi Savaşçı', 'Ejderha Savaşçısı', 'Yüce Ejderha', 'Ölümsüz Savaşçı', 'Tanrıların Savaşçısı', 'Evrenin Koruyucusu']
    },
    hack: {
        label: 'Hack & Yazılım',
        ranks: ['Acemi Kodcu', 'Jr. Developer', 'Developer', 'Sr. Developer', 'Lead Developer', 'Principal Engineer', 'Distinguished Engineer', 'Fellow', 'Siber Lord', 'Dijital Tanrı']
    },
    spor: {
        label: 'Spor',
        ranks: ['Yeni Başlayan', 'Amatör', 'Yarı-Pro', 'Profesyonel', 'Elit Atlet', 'Ulusal Şampiyon', 'Dünya Şampiyonu', 'Olimpiyat Madalyalı', 'Yaşayan Efsane', 'Spor Tanrısı']
    },
    kitap: {
        label: 'Kitap Okuma',
        ranks: ['Okur-Yazar', 'Kitap Kurdu', 'Hevesli Okur', 'Bilge Okur', 'Kütüphane Gezgini', 'Edebiyat Uzmanı', 'Filozof Okur', 'Yaşayan Kütüphane', 'Bilgelik Ustası', 'Evrensel Bilge']
    },
    psikoloji: {
        label: 'Psikoloji',
        ranks: ['Meraklı Gözlemci', 'Empati Ustası', 'Zihin Kaşifi', 'Davranış Analisti', 'İnsan Mühendisi', 'Duygu Simyacısı', 'Bilinçaltı Profesörü', 'Psikolojik Savaşçı', 'Zihin Bükücü', 'İnsanlığın Psikoloğu']
    },
    islam: {
        label: 'İslam',
        ranks: ['Mümin', 'Salih', 'Takva Sahibi', 'Alim', 'Arif', 'Veli', 'Kutup', 'Gavs', 'İnsan-ı Kamil', 'Halifetullah']
    },
    other: {
        label: 'Diğer',
        ranks: []
    }
};

export type SkillCategory = keyof typeof SKILL_CATEGORIES;

export type SkillData = {
    [key in SkillCategory]?: {
        completedTasks: number;
        rankIndex: number;
    }
};
